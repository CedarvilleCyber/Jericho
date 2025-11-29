// app/api/auth/[...nextauth]/route.ts

// Force Node runtime so Prisma works (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";        // avoid caching issues in dev
export const fetchCache = "force-no-store";

import { handlers } from "@/auth";

export const GET = handlers.GET;
export const POST = handlers.POST;
