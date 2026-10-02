// Texto escrito en el panel → párrafos: se separan con una línea en blanco.
export function toParagraphs(text: string | null | undefined) {
  if (!text) return [];
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
