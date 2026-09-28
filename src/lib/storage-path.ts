// Obtiene la ruta de un archivo dentro de un bucket a partir de su URL
// pública de Supabase. Devuelve null si la URL no pertenece a ese bucket.
export function imagePathFromUrl(url: string | null | undefined, bucket: string) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}
