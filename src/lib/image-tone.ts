import "server-only";

import sharp from "sharp";

import { toneFromPixels, type ImageTone } from "./luminance";

export { perceivedLuminance, toneFromLuminance, type ImageTone } from "./luminance";

// Tamaño al que se reduce la imagen para medirla (basta con pocos píxeles).
const SAMPLE = { width: 40, height: 20 };

// Tono (clara/oscura) de la zona donde va el texto. null si no se puede leer.
export async function analyzeImageTone(input: Buffer | File): Promise<ImageTone | null> {
  try {
    const buffer = input instanceof File ? Buffer.from(await input.arrayBuffer()) : input;
    const { data, info } = await sharp(buffer)
      .rotate() // respeta la orientación EXIF de las fotos del celular
      .resize(SAMPLE.width, SAMPLE.height, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return toneFromPixels(data, info.width, info.height, info.channels);
  } catch {
    return null;
  }
}

// Para imágenes ya subidas (antes de que existiera el análisis).
export async function analyzeImageUrl(url: string): Promise<ImageTone | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    return analyzeImageTone(Buffer.from(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

