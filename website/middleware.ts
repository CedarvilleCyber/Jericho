// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Optional: limit where it runs
// export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
