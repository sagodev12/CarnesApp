"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/admin";
import { formValues, type FormState } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/server";
import { removeImageByUrl, uploadPublicImage } from "@/lib/supabase/storage";
import {
  parseProductFormData,
  type ProductInput,
} from "@/lib/validations/product.schema";

const CHECKBOXES = ["active", "remove_image"];

// Solo las columnas de la tabla (sin la imagen ni las opciones del formulario).
function productRow(data: ProductInput) {
  const { name, description, price, unit, category_id, order, active } = data;
  return { name, description, price, unit, category_id, order, active };
}

function revalidateProducts() {
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
  // Caché de la galería (unstable_cache): expire 0 = el próximo visitante
  // ya ve el cambio, sin servir la versión vieja.
  revalidateTag("products", { expire: 0 });
}

export async function createProduct(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Las Server Actions son endpoints públicos: se verifica el admin siempre.
  await assertAdmin();

  const values = formValues(formData, CHECKBOXES);
  const parsed = parseProductFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { image } = parsed.data;
  const product = productRow(parsed.data);

  let imageUrl: string | null = null;
  if (image) {
    try {
      imageUrl = (await uploadPublicImage(image)).url;
    } catch (error) {
      return { status: "error", message: (error as Error).message, values };
    }
  }

  const { error } = await createAdminClient()
    .from("products")
    .insert({ ...product, image_url: imageUrl });

  if (error) {
    // Evita dejar imágenes huérfanas si falla el insert.
    await removeImageByUrl(imageUrl);

    return {
      status: "error",
      message: `No se pudo guardar el producto: ${error.message}`,
      values,
    };
  }

  revalidateProducts();

  return { status: "success", message: `"${product.name}" se agregó correctamente.` };
}

// Se usa con updateProduct.bind(null, id) desde el formulario de edición.
export async function updateProduct(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const values = formValues(formData, CHECKBOXES);

  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "Producto inválido.", values };
  }

  const parsed = parseProductFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { image, remove_image: removeImage } = parsed.data;
  const product = productRow(parsed.data);
  const supabase = createAdminClient();

  const { data: current, error: readError } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (readError || !current) {
    return { status: "error", message: "No se encontró el producto.", values };
  }

  // Imagen: nueva > quitar > mantener la actual.
  let imageUrl: string | null = current.image_url;
  if (image) {
    try {
      imageUrl = (await uploadPublicImage(image)).url;
    } catch (error) {
      return { status: "error", message: (error as Error).message, values };
    }
  } else if (removeImage) {
    imageUrl = null;
  }

  const { error } = await supabase
    .from("products")
    .update({ ...product, image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    if (imageUrl !== current.image_url) await removeImageByUrl(imageUrl);

    return {
      status: "error",
      message: `No se pudo actualizar el producto: ${error.message}`,
      values,
    };
  }

  // La imagen anterior solo se borra cuando el cambio ya quedó guardado.
  if (imageUrl !== current.image_url) await removeImageByUrl(current.image_url);

  revalidateProducts();
  redirect("/admin/productos");
}
