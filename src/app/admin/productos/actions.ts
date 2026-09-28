"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";
import { parseProductFormData } from "@/lib/validations/product.schema";

// Un archivo "use server" solo puede exportar funciones async.
const PRODUCT_IMAGES_BUCKET = "products";

export type ProductFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  // Se devuelven los valores enviados para no perderlos si hay errores.
  values?: Record<string, string | boolean>;
};

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  // Las Server Actions son endpoints públicos: se verifica el admin siempre.
  await assertAdmin();

  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    unit: String(formData.get("unit") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    active: formData.get("active") === "on",
  };

  const parsed = parseProductFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { image, ...product } = parsed.data;
  const supabase = createAdminClient();

  let imageUrl: string | null = null;
  let imagePath: string | null = null;

  if (image) {
    const extension = image.type.split("/")[1];
    imagePath = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(imagePath, image, { contentType: image.type });

    if (uploadError) {
      return {
        status: "error",
        message: `No se pudo subir la imagen: ${uploadError.message}`,
        values,
      };
    }

    imageUrl = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(imagePath).data.publicUrl;
  }

  const { error } = await supabase
    .from("products")
    .insert({ ...product, image_url: imageUrl });

  if (error) {
    // Evita dejar imágenes huérfanas si falla el insert.
    if (imagePath) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([imagePath]);
    }

    return {
      status: "error",
      message: `No se pudo guardar el producto: ${error.message}`,
      values,
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/");

  return { status: "success", message: `"${product.name}" se agregó correctamente.` };
}
