import { Queue } from "bullmq";
import { redis } from "../redis";

export const importQueue = new Queue("product-import", {
  connection: redis,
});
