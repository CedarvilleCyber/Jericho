// app/api/camera/status/route.ts
import { getSessionFromRequest } from "@/lib/auth-helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request.headers);
  if (!session) return new Response(null, { status: 401 });
  return new Response(null, { status: 200 });
}
