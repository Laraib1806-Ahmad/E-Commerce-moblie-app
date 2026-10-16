import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";

const router = Router();
const productRepository = AppDataSource.getRepository(Product);

router.get("/", async (req, res) => {
  try {
    const rows = await productRepository
      .createQueryBuilder("product")
      .select("DISTINCT product.category", "category")
      .orderBy("product.category", "ASC")
      .getRawMany();

    res.json(rows.map((r) => r.category));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
