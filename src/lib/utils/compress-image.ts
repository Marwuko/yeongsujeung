const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const SKIP_BELOW_BYTES = 300 * 1024; // don't bother compressing files already < 300KB

/**
 * Compress an image file in-browser using OffscreenCanvas.
 *
 * - Resizes so the longest edge ≤ MAX_DIMENSION (preserves aspect ratio)
 * - Re-encodes as JPEG regardless of source format (handles HEIC, PNG, WebP)
 * - Only returns the compressed file when it is strictly smaller than the original
 * - Falls back to the original file on any error (old Safari, unsupported format, etc.)
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    let w = width;
    let h = height;
    const longest = Math.max(width, height);
    if (longest > MAX_DIMENSION) {
      const ratio = MAX_DIMENSION / longest;
      w = Math.round(width * ratio);
      h = Math.round(height * ratio);
    }

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close(); return file; }

    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: JPEG_QUALITY });

    // Abort if compression made things worse
    if (blob.size >= file.size) return file;

    const stem = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${stem}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file; // OffscreenCanvas unavailable or decode failed
  }
}
