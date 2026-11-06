import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import sharp from "sharp";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || ".uploads");
const FILE_NAME = /^[A-Za-z0-9_-]+\.webp$/;

type UploadFolder = "avatars";

function resolvePath(folder: UploadFolder, filename: string) {
  if (!FILE_NAME.test(filename)) return null;
  return path.join(UPLOAD_DIR, folder, filename);
}

// Resizes to a size×size square and re-encodes as WebP, which drops EXIF metadata
export async function saveImage(folder: UploadFolder, input: Buffer, size: number) {
  const output = await sharp(input)
    .rotate()
    .resize(size, size, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();
  const filename = `${nanoid()}.webp`;
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), output);
  return filename;
}

export async function readUpload(folder: UploadFolder, filename: string) {
  const filePath = resolvePath(folder, filename);
  if (!filePath) return null;
  try {
    return new Uint8Array(await readFile(filePath));
  } catch {
    return null;
  }
}

export async function deleteUpload(folder: UploadFolder, filename: string) {
  const filePath = resolvePath(folder, filename);
  if (filePath) await rm(filePath, { force: true });
}

// "/avatars/abc.webp" → "abc.webp"; null for Microsoft data URLs and anything else we didn't store
export function avatarFileFromUrl(url: string | null | undefined) {
  const match = url?.match(/^\/avatars\/([^/]+)$/);
  return match ? match[1] : null;
}
