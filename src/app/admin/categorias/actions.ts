"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/admin";
import { formValues, type FormState } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/server";
import { removeImageByUrl, uploadPublicImage } from "@/lib/supabase/storage";
import { parseCategoryFormData, type CategoryInput } from "@/lib/validations/category.schema";

// Códigos de Postgres: violación de llave foránea y de valor único.
const FOREIGN_KEY_VIOLATION = "23503";
const UNIQUE_VIOLATION = "23505";

const CHECKBOXES = ["remove_image"];
const IMAGES_FOLDER = "categories";

// Solo las columnas de la tabla (sin la imagen ni las opciones del formulario).
function categoryRow({ name, slug, description, order }: CategoryInput) {
  return { name, slug, description, order };
}

function revalidateCategories() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
  // Los productos cacheados incluyen el nombre de su categoría.
  revalidateTag("products", { expire: 0 });
}

// El slug es único: dos nombres que dan la misma URL ("Res" y "rés") chocan.
function saveError(
  error: { message: string; code?: string },
  action: string,
  values: FormState["values"],
): FormState {
  if (error.code === UNIQUE_VIOLATION) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: { name: ["Ya existe una categoría con ese nombre."] },
      values,
    };
  }
  return { status: "error", message: `No se pudo ${action} la categoría: ${error.message}`, values };
}

export async function createCategory(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const values = formValues(formData, CHECKBOXES);
  const parsed = parseCategoryFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const category = categoryRow(parsed.data);

  let imageUrl: string | null = null;
  if (parsed.data.image) {
    try {
      imageUrl = (await uploadPublicImage(parsed.data.image, IMAGES_FOLDER)).url;
    } catch (error) {
      return { status: "error", message: (error as Error).message, values };
    }
  }

  const { error } = await createAdminClient()
    .from("categories")
    .insert({ ...category, image_url: imageUrl });

  if (error) {
    // Evita dejar imágenes huérfanas si falla el insert.
    await removeImageByUrl(imageUrl);
    return saveError(error, "crear", values);
  }

  revalidateCategories();

  return { status: "success", message: `Categoría "${category.name}" creada.` };
}

// Se usa con updateCategory.bind(null, id) desde el formulario de edición.
export async function updateCategory(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const values = formValues(formData, CHECKBOXES);

  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "Categoría inválida.", values };
  }

  const parsed = parseCategoryFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { image, remove_image: removeImage } = parsed.data;
  const category = categoryRow(parsed.data);
  const supabase = createAdminClient();

  const { data: current, error: readError } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  if (readError || !current) {
    return { status: "error", message: "No se encontró la categoría.", values };
  }

  // Imagen: nueva > quitar > mantener la actual.
  let imageUrl: string | null = current.image_url;
  if (image) {
    try {
      imageUrl = (await uploadPublicImage(image, IMAGES_FOLDER)).url;
    } catch (error) {
      return { status: "error", message: (error as Error).message, values };
    }
  } else if (removeImage) {
    imageUrl = null;
  }

  const { error } = await supabase
    .from("categories")
    .update({ ...category, image_url: imageUrl })
    .eq("id", id);

  if (error) {
    if (imageUrl !== current.image_url) await removeImageByUrl(imageUrl);
    return saveError(error, "actualizar", values);
  }

  // La imagen anterior solo se borra cuando el cambio ya quedó guardado.
  if (imageUrl !== current.image_url) await removeImageByUrl(current.image_url);

  revalidateCategories();
  redirect("/admin/categorias");
}

export async function deleteCategory(id: string): Promise<FormState> {
  await assertAdmin();

  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "Categoría inválida." };
  }

  // Devuelve la fila borrada para limpiar su imagen.
  const { data: deleted, error } = await createAdminClient()
    .from("categories")
    .delete()
    .eq("id", id)
    .select("image_url")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message:
        error.code === FOREIGN_KEY_VIOLATION
          ? "No se puede eliminar: tiene productos asociados. Cámbiales la categoría primero."
          : `No se pudo eliminar la categoría: ${error.message}`,
    };
  }

  await removeImageByUrl(deleted?.image_url);

  revalidateCategories();

  return { status: "success", message: "Categoría eliminada." };
}
