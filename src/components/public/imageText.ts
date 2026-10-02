import type { ImageTone } from "@/lib/luminance";

// Clases para poner texto legible sobre una foto según su brillo:
// foto oscura (o sin analizar) → velo oscuro y texto claro;
// foto clara → velo crema y texto oscuro.
// En el celular el texto ocupa todo el ancho, así que el velo es parejo;
// desde sm se degrada hacia la derecha para dejar ver la foto.
export function imageTextTheme(tone: ImageTone | null) {
  if (tone === "light") {
    return {
      light: false,
      overlay:
        "bg-cream/80 sm:bg-transparent sm:bg-gradient-to-r sm:from-cream/95 sm:via-cream/75 sm:to-cream/20",
      text: "text-charcoal [text-shadow:0_1px_2px_rgb(255_255_255/0.5)]",
      muted: "text-charcoal/80",
      accent: "text-brick",
    };
  }
  return {
    light: true,
    overlay:
      "bg-charcoal/70 sm:bg-transparent sm:bg-gradient-to-r sm:from-charcoal/90 sm:via-charcoal/65 sm:to-charcoal/20",
    text: "text-cream [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
    muted: "text-cream/85",
    accent: "text-mustard",
  };
}
