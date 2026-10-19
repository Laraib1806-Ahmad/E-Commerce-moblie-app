import { Worker } from "bullmq";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import fs from "fs";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Brand } from "../entities/Brand";
import { redis } from "../redis";
import { clearProductsCache } from "../redis";
import { logAudit } from "../utils/auditLog";

export const importWorker = new Worker(
  "product-import",
  async (job) => {
    const { filePath, originalName } = job.data;
    const productRepository = AppDataSource.getRepository(Product);
    const brandRepository = AppDataSource.getRepository(Brand);

    const fileBuffer = fs.readFileSync(filePath);
    let rows: any[];

    if (originalName.endsWith(".csv")) {
      rows = parse(fileBuffer, { columns: true, skip_empty_lines: true });
    } else {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    }

    let inserted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.productName || !row.category || !row.price || !row.brandName) {
          throw new Error("Missing required fields");
        }

        let brand = await brandRepository.findOne({
          where: { name: row.brandName },
        });
        if (!brand) {
          brand = await brandRepository.save({
            name: row.brandName,
            country: row.brandCountry || "Unknown",
          });
        }

        const saved = await productRepository.save({
          productName: row.productName,
          category: row.category,
          price: Number(row.price),
          rating: Number(row.rating) || 0,
          description: row.description || "",
          favorite: false,
          brand,
        });

        await logAudit("CREATE", "Product", saved.id, {
          productName: saved.productName,
          source: "bulk-import",
        });

        inserted++;
      } catch (err: any) {
        failed++;
        errors.push(`Row ${i + 2}: ${err.message}`);
      }

      await job.updateProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    fs.unlinkSync(filePath);
    await clearProductsCache();

    return { total: rows.length, inserted, failed, errors };
  },
  { connection: redis },
);

importWorker.on("completed", (job) => {
  console.log(`Import job ${job.id} done:`, job.returnvalue);
});

importWorker.on("failed", (job, err) => {
  console.error(`Import job ${job?.id} failed:`, err.message);
});
