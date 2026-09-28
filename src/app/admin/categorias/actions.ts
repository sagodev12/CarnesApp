"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/admin";
import { formValues, type FormState } from "@/lib/forms";
import { createAdminClient } from "@/lib/supabase/server";
import { parseCategoryFormData } from "@/lib/validations/category.schema";

// Código de Postgres para violación de llave foránea.
const FOREIGN_KEY_VIOLATION = "23503";

function revalidateCategories() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
  // Los productos cacheados incluyen el nombre de su categoría.
  revalidateTag("products", { expire: 0 });
}

export async function createCategory(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const values = formValues(formData);
  const parsed = parseCategoryFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { error } = await createAdminClient().from("categories").insert(parsed.data);

  if (error) {
    return {
      status: "error",
      message: `No se pudo crear la categoría: ${error.message}`,
      values,
    };
  }

  revalidateCategories();

  return { status: "success", message: `Categoría "${parsed.data.name}" creada.` };
}

export async function deleteCategory(id: string): Promise<FormState> {
  await assertAdmin();

  if (!z.uuid().safeParse(id).success) {
    return { status: "error", message: "Categoría inválida." };
  }

  const { error } = await createAdminClient().from("categories").delete().eq("id", id);

  if (error) {
    return {
      status: "error",
      message:
        error.code === FOREIGN_KEY_VIOLATION
          ? "No se puede eliminar: tiene productos asociados. Cámbiales la categoría primero."
          : `No se pudo eliminar la categoría: ${error.message}`,
    };
  }

  revalidateCategories();

  return { status: "success", message: "Categoría eliminada." };
}
