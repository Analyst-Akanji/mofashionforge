// Shared image helpers for the admin pages (Gallery, Blog).
// Put this file at: src/lib/imageUtils.js

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Shrinks big phone photos (max 1600px, JPEG) before upload.
// Falls back to the original file if anything goes wrong.
export async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (blob && blob.size < file.size) return { blob, ext: "jpg", type: "image/jpeg" };
  } catch (_) {
    /* fall through to the original file */
  }
  return { blob: file, ext: file.name.split(".").pop().toLowerCase(), type: file.type };
}

// Public URL -> file name inside the bucket ("" if the URL isn't from that bucket)
export function storageNameFromUrl(url, bucket) {
  return decodeURIComponent((url || "").split(`/${bucket}/`)[1] || "");
}

export function randomFileName(prefix, ext) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}
