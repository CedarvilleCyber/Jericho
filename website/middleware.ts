// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Optional: limit where it runs
// export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };

/*
// middleware.ts
import { auth } from "@/auth";             // <- from your src/auth.ts
import { NextResponse } from "next/server";

export default auth((req) => {
  // If there is no session, redirect to Sign In and bounce back after login
  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  // If you want per-route logic or roles, you can inspect req.auth here
  // e.g., if (req.nextUrl.pathname.startsWith("/admin") && !req.auth.user.isAdmin) { ... }
  return NextResponse.next();
});

// Run on everything except Next.js internals, static files, and NextAuth endpoints
export const config = {
  matcher: [
    
     //* Match all paths except:
     //*  - _next (Next.js assets)
     //*  - static files with an extension, e.g. .png, .ico, .css
     //*  - the NextAuth auth endpoints (/api/auth/*)
     
    "/((?!.+\\.[\\w]+$|_next/|api/auth).*)",
    // Also protect API routes by default (except /api/auth which is excluded above)
    "/api/(.*)",
  ],
};*/