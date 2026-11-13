import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { stripeWebhookHandler } from "./routes/stripeWebhook";
import cors from "cors";
import { AppDataSource } from "./data-source";
import uploadRoutes from "./routes/uploads";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import brandRoutes from "./routes/brands";
import auditLogRoutes from "./routes/auditLogs";
import orderRoutes from "./routes/orders";
import "./workers/importWorker";

const app = express();
app.use(cors());
// app.use(cors({ origin: "http://localhost:3000" }));

app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

app.use(express.json());
app.use("/upload", uploadRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/brands", brandRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/orders", orderRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected ~");
    app.listen(9999, () => console.log("Server running on port 9999"));
  })
  .catch((error) => {
    console.error("Database Connection Failed:", error);
  });
