import { readUpload } from "@/lib/uploads/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const data = await readUpload("avatars", file);
  if (!data) return new Response(null, { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
