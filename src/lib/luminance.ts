// Brillo de una imagen para elegir el color del texto que va encima.
// Sin dependencias de servidor: lo usan el panel (vista previa) y el servidor.

export type ImageTone = "light" | "dark";

// Por encima de este brillo (0–1) la imagen se considera clara.
const LIGHT_THRESHOLD = 0.55;

// Parte del ancho donde va el texto (alineado a la izquierda).
export const TEXT_REGION = 0.6;

// Brillo percibido de un color (0 = negro, 1 = blanco): el ojo es más
// sensible al verde que al rojo y mucho menos al azul.
export function perceivedLuminance(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function toneFromLuminance(luminance: number): ImageTone {
  return luminance > LIGHT_THRESHOLD ? "light" : "dark";
}

// Píxeles RGB(A) en crudo de una imagen pequeña → tono de la zona del texto.
export function toneFromPixels(
  data: ArrayLike<number>,
  width: number,
  height: number,
  channels: number,
): ImageTone {
  const columns = Math.max(1, Math.round(width * TEXT_REGION));
  let total = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < columns; x++) {
      const i = (y * width + x) * channels;
      total += perceivedLuminance(data[i], data[i + 1], data[i + 2]);
    }
  }
  return toneFromLuminance(total / (columns * height));
}

export function isImageTone(value: unknown): value is ImageTone {
  return value === "light" || value === "dark";
}
