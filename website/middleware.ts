// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


export async function middleware(req: any) {
const url = new URL(req.url);
if (url.pathname.startsWith("/api/scenarios") || url.pathname.startsWith("/api/console")) {
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
if (!token) return NextResponse.redirect(new URL("/login", req.url));
}
return NextResponse.next();
}
export const config = { matcher: ["/api/scenarios/:path*", "/api/console/:path*", "/scenarios/:path*"] };
