import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => console.log("Redis Connected ~"));
redis.on("error", (err) => console.error("Redis Error:", err.message));

export async function clearProductsCache() {
  const keys = await redis.keys("products:*");
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
