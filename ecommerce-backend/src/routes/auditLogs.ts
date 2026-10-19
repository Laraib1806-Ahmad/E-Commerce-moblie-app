import { Router } from "express";
import { AppDataSource } from "../data-source";
import { AuditLog } from "../entities/AuditLog";

const router = Router();
const auditLogRepository = AppDataSource.getRepository(AuditLog);

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    );

    const [data, total] = await auditLogRepository.findAndCount({
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
