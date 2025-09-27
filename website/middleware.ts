// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Always allow NextAuth internals/callbacks (defense-in-depth)
  if (url.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Gate your protected routes
  if (
    url.pathname.startsWith("/api/scenarios") ||
    url.pathname.startsWith("/api/console") ||
    url.pathname.startsWith("/scenarios")
  ) {
    // getToken will use NEXTAUTH_SECRET from env automatically
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      // send unauthenticated users to your login page
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Only run on the routes you want to protect
export const config = {
  matcher: ["/api/scenarios/:path*", "/api/console/:path*", "/scenarios/:path*"],
};
