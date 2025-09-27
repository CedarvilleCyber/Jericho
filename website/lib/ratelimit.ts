// lib/ratelimit.ts
import { redis } from "./redis";


export async function rateLimit(key: string, limit: number, windowSec: number) {
const now = Date.now();
const bucket = `rl:${key}`;
const tx = redis.multi();
tx.zremrangebyscore(bucket, 0, now - windowSec * 1000);
tx.zadd(bucket, now, String(now));
tx.zcard(bucket);
tx.expire(bucket, windowSec);
const [, , count] = (await tx.exec()) as any[];
return (count as number) <= limit;
}