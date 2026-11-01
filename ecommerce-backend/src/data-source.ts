import { DataSource } from "typeorm";
import { Brand } from "./entities/Brand";
import { Product } from "./entities/Product";
import { AuditLog } from "./entities/AuditLog";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
  entities: [Brand, Product, AuditLog],
});
