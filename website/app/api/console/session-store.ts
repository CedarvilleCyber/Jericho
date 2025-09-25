import redis from "@/lib/redis";

export async function saveCookie(jti: string, cookie: string) {
    await redis.setex(`console:${jti}`, 70, cookie); // TTL 70s
}

export async function takeCookie(jti: string) {
    const key = `console:${jti}`;
    const cookie = await redis.get(key);
    if (!cookie) return null;
    await redis.del(key);
    return cookie;
}