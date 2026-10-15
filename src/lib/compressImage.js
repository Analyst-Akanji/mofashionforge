// Shrinks large images in the browser before upload.
// Non-images (e.g. PDFs), small files, and any failure return the original file untouched.
export async function compressImage(file, { maxSize = 1600, quality = 0.85, minBytes = 0 } = {}) {
  const fallback = {
    blob: file,
    ext: (file.name.split(".").pop() || "bin").toLowerCase(),
    type: file.type,
  };

  if (!file.type.startsWith("image/") || file.size < minBytes) return fallback;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size < file.size) return { blob, ext: "jpg", type: "image/jpeg" };
  } catch {
    /* fall through to the original file */
  }
  return fallback;
}
