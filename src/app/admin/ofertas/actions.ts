"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/admin";
import { formValues, type FormState } from "@/lib/forms";
import { toneForImage } from "@/lib/tone-for-image";
import { createAdminClient } from "@/lib/supabase/server";
import { removeImageByUrl, uploadPublicImage } from "@/lib/supabase/storage";
import { parseOffersFormData } from "@/lib/validations/offers.schema";

// Ajustes de la franja de ofertas del inicio (columnas offers_* de site_config).
export async function updateOffersSettings(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const values = formValues(formData, ["offers_visible", "remove_offers_image"]);
  const parsed = parseOffersFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { offers_image: image, remove_offers_image: removeImage, ...settings } = parsed.data;
  const supabase = createAdminClient();

  // site_config es un registro único (columna singleton).
  const { data: current, error: readError } = await supabase
    .from("site_config")
    .select("offers_image_url, offers_image_tone")
    .eq("singleton", true)
    .maybeSingle();

  if (readError || !current) {
    return {
      status: "error",
      message: "No se encontró la configuración del sitio en la base de datos.",
      values,
    };
  }

  // El estilo con imagen necesita una (nueva o la que ya estaba).
  const keepsImage = Boolean(current.offers_image_url) && !removeImage;
  if (settings.offers_style === "image" && !image && !keepsImage) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { offers_image: ["Sube una imagen de fondo para el estilo “Con imagen”."] },
      values,
    };
  }

  // Imagen: nueva > quitar > mantener la actual.
  let imageUrl: string | null = current.offers_image_url;
  if (image) {
    try {
      imageUrl = (await uploadPublicImage(image, "site")).url;
    } catch (error) {
      return { status: "error", message: (error as Error).message, values };
    }
  } else if (removeImage) {
    imageUrl = null;
  }

  // El brillo del fondo decide el color del texto de la franja.
  const imageTone = await toneForImage({
    url: imageUrl,
    file: image,
    previousTone: current.offers_image_tone,
  });

  const { error } = await supabase
    .from("site_config")
    .update({
      ...settings,
      offers_image_url: imageUrl,
      offers_image_tone: imageTone,
      updated_at: new Date().toISOString(),
    })
    .eq("singleton", true);

  if (error) {
    if (imageUrl !== current.offers_image_url) await removeImageByUrl(imageUrl);
    return { status: "error", message: `No se pudo guardar: ${error.message}`, values };
  }

  // La imagen anterior solo se borra cuando el cambio ya quedó guardado.
  if (imageUrl !== current.offers_image_url) await removeImageByUrl(current.offers_image_url);

  revalidatePath("/admin/ofertas");
  revalidatePath("/", "layout");

  return { status: "success", message: "Cambios guardados. Ya se ven en la página." };
}
