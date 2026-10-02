// Solo servidor: image-tone.ts (sharp) ya importa "server-only".
import { analyzeImageTone, analyzeImageUrl } from "./image-tone";
import { isImageTone, type ImageTone } from "./luminance";

// Tono a guardar junto a una imagen tras editar un formulario:
// sin imagen → null; imagen nueva → se analiza; la misma de antes → se reusa
// su tono, o se analiza si aún no lo tenía (imágenes subidas antes).
export async function toneForImage({
  url,
  file,
  previousTone,
}: {
  url: string | null;
  file: File | undefined;
  previousTone: string | null;
}): Promise<ImageTone | null> {
  if (!url) return null;
  if (file) return analyzeImageTone(file);
  if (isImageTone(previousTone)) return previousTone;
  return analyzeImageUrl(url);
}
