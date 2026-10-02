import Image from "next/image";

import { Field, fileInputClass } from "@/components/ui/form";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/validations/common";

type ImageFieldProps = {
  label: string;
  name: string;
  removeName: string;
  currentUrl: string | null;
  errors?: string[];
  removeChecked: boolean;
  hint?: string;
  // Para vistas previas en vivo (opcionales).
  onFileChange?: (file: File | null) => void;
  onRemoveChange?: (remove: boolean) => void;
};

// Imagen opcional con miniatura de la actual y casilla para quitarla.
export default function ImageField({
  label,
  name,
  removeName,
  currentUrl,
  errors,
  removeChecked,
  hint = "JPG, PNG o WEBP. Máximo 4 MB.",
  onFileChange,
  onRemoveChange,
}: ImageFieldProps) {
  return (
    <Field label={label} name={name} errors={errors} optional hint={hint}>
      {currentUrl && (
        <div className="mb-3 flex items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden rounded-md bg-charcoal/5">
            <Image src={currentUrl} alt={label} fill sizes="96px" className="object-contain" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={removeName}
              defaultChecked={removeChecked}
              onChange={(event) => onRemoveChange?.(event.target.checked)}
              className="size-4 accent-brick"
            />
            Quitar
          </label>
        </div>
      )}
      <input
        id={name}
        name={name}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={(event) => onFileChange?.(event.target.files?.[0] ?? null)}
        aria-invalid={Boolean(errors)}
        className={fileInputClass}
      />
    </Field>
  );
}
