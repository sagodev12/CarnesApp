import { toneFromPixels, type ImageTone } from "@/lib/luminance";

// Igual que el análisis del servidor, pero en el navegador: para la vista
// previa de una imagen elegida que aún no se ha subido (URL blob:).
export function measureImageTone(url: string): Promise<ImageTone | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 40;
        canvas.height = 20;
        const context = canvas.getContext("2d");
        if (!context) return resolve(null);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        resolve(toneFromPixels(data, canvas.width, canvas.height, 4));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}
