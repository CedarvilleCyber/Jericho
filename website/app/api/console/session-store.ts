// app/api/console/session-store.ts
import { putOnce, take } from "@/lib/redis";

const keyFor = (jti: string) => `console:${jti}`;

export async function saveCookie(jti: string, cookie: string) {
  await putOnce(keyFor(jti), cookie, 70); // TTL 70s
}

export async function takeCookie(jti: string) {
  return await take(keyFor(jti)); // returns string | null (and deletes on read)
}
