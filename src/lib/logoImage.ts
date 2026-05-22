const MAX_SIZE = 128;
const MAX_BYTES = 400_000;
const ACCEPT = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];

export function isImageFile(file: File) {
  return ACCEPT.includes(file.type) || file.type.startsWith("image/");
}

/** Resize image to a compact data URL for storage in DB / localStorage */
export async function fileToLogoDataUrl(file: File): Promise<string> {
  if (!isImageFile(file)) throw new Error("Please upload an image (PNG, JPG, WebP, or GIF)");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");

  if (file.type === "image/svg+xml") {
    const text = await file.text();
    return `data:image/svg+xml;base64,${btoa(text)}`;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.88;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_BYTES) {
    throw new Error("Image is too large after compression. Try a smaller file.");
  }
  return dataUrl;
}
