import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20 })
  action!: "CREATE" | "UPDATE" | "DELETE";

  @Column({ type: "varchar", length: 50 })
  entityName!: string;

  @Column({ type: "int" })
  entityId!: number;

  @Column({ type: "jsonb", nullable: true })
  details!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
