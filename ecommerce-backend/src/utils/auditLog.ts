import { AppDataSource } from "../data-source";
import { AuditLog } from "../entities/AuditLog";

export async function logAudit(
  action: "CREATE" | "UPDATE" | "DELETE",
  entityName: string,
  entityId: number,
  details?: Record<string, any>,
) {
  const auditLogRepository = AppDataSource.getRepository(AuditLog);
  await auditLogRepository.save({
    action,
    entityName,
    entityId,
    details: details || null,
  });
}
