import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Brand } from "../entities/Brand";

const router = Router();
const brandRepository = AppDataSource.getRepository(Brand);

router.get("/", async (req, res) => {
  try {
    const brands = await brandRepository.find({ order: { name: "ASC" } });
    res.json(brands);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
