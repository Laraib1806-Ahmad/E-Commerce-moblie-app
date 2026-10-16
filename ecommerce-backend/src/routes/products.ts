import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { redis } from "../redis";
import multer from "multer";
import { supabase } from "../supabase";
import { clearProductsCache } from "../redis";
import { Brand } from "../entities/Brand";
import { importQueue } from "../queues/importQueue";
import { logAudit } from "../utils/auditLog";
import { isSetIterator } from "util/types";
import { JoinAttribute } from "typeorm/query-builder/JoinAttribute.js";
import { arraySync } from "node:stream/iter";
const importUpload = multer({ dest: "uploads/imports/" });

const upload = multer({ storage: multer.memoryStorage() });
const brandRepository = AppDataSource.getRepository(Brand);
const router = Router();
const productRepository = AppDataSource.getRepository(Product);

const SORTABLE_FIELDS: Record<string, string> = {
  price: "product.price",
  rating: "product.rating",
};

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );
    const { search, category, brand, favorite, sortBy, order } = req.query;
    const priceMin = req.query.priceMin ? Number(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? Number(req.query.priceMax) : null;
    const ratingMin = req.query.ratingMin ? Number(req.query.ratingMin) : null;
    const ratingMax = req.query.ratingMax ? Number(req.query.ratingMax) : null;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const query = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.brand", "brand");

    if (search)
      query.andWhere("product.productName ILIKE :search", {
        search: `%${search}%`,
      });
    if (category) query.andWhere("product.category = :category", { category });
    if (brand) query.andWhere("brand.name = :brand", { brand });
    if (favorite === "true") query.andWhere("product.favorite = true");
    if (priceMin !== null && !Number.isNaN(priceMin))
      query.andWhere("product.price > :priceMin", { priceMin });
    if (priceMax !== null && !Number.isNaN(priceMax))
      query.andWhere("product.price < :priceMax", { priceMax });
    if (ratingMin !== null && !Number.isNaN(ratingMin))
      query.andWhere("product.rating > :ratingMin", { ratingMin });
    if (ratingMax !== null && !Number.isNaN(ratingMax))
      query.andWhere("product.rating < :ratingMax", { ratingMax });

    const sortField = SORTABLE_FIELDS[sortBy as string] || "product.id";
    const sortOrder = order === "desc" ? "DESC" : "ASC";
    query
      .orderBy(sortField, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    const result = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      productName,
      category,
      price,
      rating,
      description,
      favorite,
      brandName,
    } = req.body;

    if (
      !productName ||
      !category ||
      !price ||
      !rating ||
      !description ||
      !brandName
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let brand = await brandRepository.findOne({ where: { name: brandName } });
    if (!brand) {
      return res
        .status(400)
        .json({ message: `Brand "${brandName}" not found` });
    }

    let imageUrl: string | null = null;
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (error) {
        return res
          .status(500)
          .json({ message: `Image upload failed: ${error.message}` });
      }
      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const product = productRepository.create({
      productName,
      category,
      price: Number(price),
      rating: Number(rating),
      description,
      favorite: favorite === "true" || favorite === true,
      imageUrl,
      brand,
    });

    const saved = await productRepository.save(product);
    await clearProductsCache();
    await logAudit("CREATE", "Product", saved.id, {
      productName: saved.productName,
    });

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await productRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: { brand: true },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const product = await productRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: { brand: true },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const before = { ...product };
    productRepository.merge(product, req.body);
    const updated = await productRepository.save(product);

    await clearProductsCache();
    await logAudit("UPDATE", "Product", updated.id, {
      before: {
        price: before.price,
        rating: before.rating,
        favorite: before.favorite,
      },
      after: {
        price: updated.price,
        rating: updated.rating,
        favorite: updated.favorite,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await productRepository.findOne({
      where: { id: Number(req.params.id) },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const result = await productRepository.delete(req.params.id);
    if (result.affected === 0)
      return res.status(404).json({ message: "Product not found" });

    await clearProductsCache();
    await logAudit("DELETE", "Product", Number(req.params.id), {
      productName: product.productName,
    });

    res.json({ message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/import", importUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const job = await importQueue.add("import-products", {
      filePath: req.file.path,
      originalName: req.file.originalname,
    });

    res.status(202).json({ message: "Import started", jobId: job.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/import/:jobId/status", async (req, res) => {
  try {
    const job = await importQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;

    res.json({ state, progress, result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
