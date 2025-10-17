// src/prisma.ts (or wherever you keep it)
import { PrismaClient } from "@prisma/client";

// add types for hot-reload in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // optional: log queries in dev
    // log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
