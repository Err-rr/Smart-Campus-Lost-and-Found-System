const MAX_BYTES = 1024 * 1024; // hard limit from the requirements
const TARGET_CHARS = 300 * 1024; // aim much lower so localStorage does not fill up

/** Approximate decoded size of a base64 data URL. */
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file could not be read as an image.'));
    };
    img.src = url;
  });
}

/**
 * Resizes and re-encodes a photo as a JPEG data URL under 1 MB.
 * Steps down size and quality until it fits.
 */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file (JPG or PNG).');
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not process this image.');

  for (const maxSide of [1024, 800, 640, 480]) {
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.8, 0.7, 0.6, 0.5]) {
      const url = canvas.toDataURL('image/jpeg', quality);
      if (url.length <= TARGET_CHARS) return url;
    }
  }

  const fallback = canvas.toDataURL('image/jpeg', 0.5);
  if (dataUrlBytes(fallback) > MAX_BYTES) throw new Error('This photo is too large. Try a smaller one.');
  return fallback;
}
