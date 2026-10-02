"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Loader2, Pencil, Tags, Trash2 } from "lucide-react";

import { deleteCategory } from "@/app/admin/categorias/actions";
import { FormMessage } from "@/components/ui/form";
import type { FormState } from "@/lib/forms";
import type { Category } from "@/types";

type CategoryListProps = {
  categories: (Category & { productCount: number })[];
};

export default function CategoryList({ categories }: CategoryListProps) {
  // Id de la categoría que está pidiendo confirmación para eliminarse.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [result, setResult] = useState<FormState>({ status: "idle" });
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      setResult(await deleteCategory(id));
      setConfirmingId(null);
    });
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-16 text-center">
        <Tags size={40} className="text-charcoal/30" />
        <p className="mt-3 font-medium">Aún no hay categorías</p>
        <p className="mt-1 text-sm text-charcoal/60">
          Crea categorías como &quot;Res&quot; o &quot;Cerdo&quot; para filtrar la galería.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormMessage state={result} />

      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/60">
        {categories.map((category) => {
          const count = category.productCount;
          const confirming = confirmingId === category.id;

          return (
            <li key={category.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-charcoal/5 text-charcoal/30">
                  {category.image_url ? (
                    <Image src={category.image_url} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <ImageOff size={18} aria-label="Sin imagen" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{category.name}</p>
                  <p className="text-xs text-charcoal/60">
                    Orden {category.order} · {count} {count === 1 ? "producto" : "productos"}
                    {!category.description && " · sin descripción"}
                  </p>
                </div>
              </div>

              {confirming ? (
                <div className="flex items-center gap-2">
                  <span className="hidden text-sm text-charcoal/70 sm:inline">¿Eliminar?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    disabled={pending}
                    className="rounded-md border border-line px-3 py-1.5 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brick px-3 py-1.5 text-sm font-medium text-cream disabled:opacity-60"
                  >
                    {pending && <Loader2 size={14} className="animate-spin" />}
                    Sí, eliminar
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/categorias/${category.id}`}
                    aria-label={`Editar ${category.name}`}
                    className="rounded-md p-2 text-charcoal/60 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(category.id)}
                    aria-label={`Eliminar ${category.name}`}
                    className="rounded-md p-2 text-charcoal/60 transition-colors hover:bg-brick/10 hover:text-brick"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
