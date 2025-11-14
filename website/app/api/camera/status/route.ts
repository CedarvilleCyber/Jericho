// app/api/camera/status/route.ts
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return new Response(null, { status: 401 });
  return new Response(null, { status: 200 });
}
