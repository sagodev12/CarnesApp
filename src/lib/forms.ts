// Estado compartido por los formularios con useActionState.
// Vive fuera de los archivos "use server", que solo pueden exportar funciones async.
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  // Se devuelven los valores enviados para no perderlos si hay errores.
  values?: Record<string, string | boolean>;
};

export const initialFormState: FormState = { status: "idle" };

// Copia los campos de texto/checkbox del FormData (sin archivos).
export function formValues(formData: FormData, checkboxes: string[] = []) {
  const values: Record<string, string | boolean> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  for (const name of checkboxes) values[name] = formData.get(name) === "on";

  return values;
}
