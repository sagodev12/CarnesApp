import "server-only";

import { imagePathFromUrl } from "@/lib/storage-path";

import { createAdminClient } from "./server";

export const IMAGES_BUCKET = "products";

export async function uploadPublicImage(file: File, folder?: string) {
  const supabase = createAdminClient();
  const extension = file.type.split("/")[1];
  const path = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  const url = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;

  return { url, path };
}

// Borra una imagen a partir de su URL pública. Ignora URLs que no son de
// nuestro bucket (p. ej. imágenes externas) y no lanza si falla: un archivo
// huérfano no debe romper el guardado.
export async function removeImageByUrl(url: string | null | undefined) {
  const path = imagePathFromUrl(url, IMAGES_BUCKET);
  if (!path) return;

  await createAdminClient().storage.from(IMAGES_BUCKET).remove([path]);
}
