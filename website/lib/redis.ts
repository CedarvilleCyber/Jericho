// lib/redis.ts
import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const redis = new Redis(url, { maxRetriesPerRequest: 3 });


export async function putOnce(key: string, value: string, ttlSec: number) {
await redis.set(key, value, "EX", ttlSec);
}
export async function take(key: string) {
const val = await redis.get(key);
if (!val) return null;
await redis.del(key);
return val;
}