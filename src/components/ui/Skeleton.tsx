// Bloque gris animado para estados de carga.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-charcoal/10 ${className}`} />;
}

// Tarjeta de producto en carga (misma forma que ProductCard de la galería
// y del panel, para que no salte el diseño al llegar los datos).
export function ProductCardSkeleton({ variant = "public" }: { variant?: "public" | "admin" }) {
  const isPublic = variant === "public";

  return (
    <div
      aria-hidden
      className={`flex h-full flex-col overflow-hidden border border-line bg-white ${
        isPublic ? "rounded-2xl" : "rounded-xl"
      }`}
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className={`flex flex-1 flex-col ${isPublic ? "gap-3 p-5" : "gap-2 p-4"}`}>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <div className="mt-auto flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-24" />
          {isPublic && <Skeleton className="h-9 w-24 rounded-lg" />}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count,
  variant = "public",
  label = "Cargando productos",
}: {
  count: number;
  variant?: "public" | "admin";
  label?: string;
}) {
  return (
    <div role="status" aria-label={label}>
      <ul
        className={
          variant === "public"
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <ProductCardSkeleton variant={variant} />
          </li>
        ))}
      </ul>
      <span className="sr-only">{label}…</span>
    </div>
  );
}
