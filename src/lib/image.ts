const THUMB_MAX = 480;
const THUMB_QUALITY = 0.8;

export interface ImageMeta {
  width: number;
  height: number;
  thumb: Blob;
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, THUMB_QUALITY));
}

// note: reads the natural size and draws a webp thumbnail (longest side THUMB_MAX) in the browser
export async function readImageMeta(file: File): Promise<ImageMeta> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, THUMB_MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const thumb = await toBlob(canvas, "image/webp");
    if (!thumb) throw new Error("Failed to create thumbnail");
    return { width: bitmap.width, height: bitmap.height, thumb };
  } finally {
    bitmap.close();
  }
}
