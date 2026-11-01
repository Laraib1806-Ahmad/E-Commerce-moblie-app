import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import uploadRoutes from "./routes/uploads";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import brandRoutes from "./routes/brands";
import auditLogRoutes from "./routes/auditLogs";
import "./workers/importWorker";

const app = express();
app.use(cors());
// app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/brands", brandRoutes);
app.use("/audit-logs", auditLogRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected ~");
    app.listen(9999, () => console.log("Server running on port 9999"));
  })
  .catch((error) => {
    console.error("Database Connection Failed:", error);
  });
