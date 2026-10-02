"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/admin";
import { formValues, type FormState } from "@/lib/forms";
import { toneForImage } from "@/lib/tone-for-image";
import { createAdminClient } from "@/lib/supabase/server";
import { removeImageByUrl, uploadPublicImage } from "@/lib/supabase/storage";
import { parseSiteConfigFormData } from "@/lib/validations/site-config.schema";

// Imagen: nueva > quitar > mantener la actual.
async function resolveImage(
  current: string | null,
  file: File | undefined,
  remove: boolean,
) {
  if (file) return (await uploadPublicImage(file, "site")).url;
  if (remove) return null;
  return current;
}

export async function updateSiteConfig(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const values = formValues(formData, ["remove_logo", "remove_hero", "remove_about_image"]);
  const parsed = parseSiteConfigFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const {
    logo,
    hero,
    about_image: aboutImage,
    remove_logo,
    remove_hero,
    remove_about_image,
    ...config
  } = parsed.data;
  const supabase = createAdminClient();

  // site_config es un registro único (columna singleton).
  const { data: current, error: readError } = await supabase
    .from("site_config")
    .select("id, logo_url, hero_image_url, hero_image_tone, about_image_url")
    .eq("singleton", true)
    .maybeSingle();

  if (readError || !current) {
    return {
      status: "error",
      message: "No se encontró la configuración del sitio en la base de datos.",
      values,
    };
  }

  let logoUrl: string | null;
  let heroUrl: string | null;
  let aboutUrl: string | null;
  try {
    logoUrl = await resolveImage(current.logo_url, logo, remove_logo);
    heroUrl = await resolveImage(current.hero_image_url, hero, remove_hero);
    aboutUrl = await resolveImage(current.about_image_url, aboutImage, remove_about_image);
  } catch (error) {
    return { status: "error", message: (error as Error).message, values };
  }

  // La portada lleva texto encima: su brillo decide el color del texto.
  const heroTone = await toneForImage({
    url: heroUrl,
    file: hero,
    previousTone: current.hero_image_tone,
  });

  const { error } = await supabase
    .from("site_config")
    .update({
      ...config,
      logo_url: logoUrl,
      hero_image_url: heroUrl,
      hero_image_tone: heroTone,
      about_image_url: aboutUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("singleton", true);

  if (error) {
    if (logoUrl !== current.logo_url) await removeImageByUrl(logoUrl);
    if (heroUrl !== current.hero_image_url) await removeImageByUrl(heroUrl);
    if (aboutUrl !== current.about_image_url) await removeImageByUrl(aboutUrl);

    return {
      status: "error",
      message: `No se pudo guardar la configuración: ${error.message}`,
      values,
    };
  }

  if (logoUrl !== current.logo_url) await removeImageByUrl(current.logo_url);
  if (heroUrl !== current.hero_image_url) await removeImageByUrl(current.hero_image_url);
  if (aboutUrl !== current.about_image_url) await removeImageByUrl(current.about_image_url);

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");

  return { status: "success", message: "Cambios guardados. Ya se ven en la página." };
}
