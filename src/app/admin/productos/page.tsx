import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import PageHeader from "@/components/admin/PageHeader";
import ProductList from "@/components/admin/ProductList";
import Pagination from "@/components/ui/Pagination";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { requireAdminPage } from "@/lib/auth/admin";
import { ADMIN_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { getProductCounts, getProductsPage } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Productos · Panel admin",
  robots: { index: false },
};

const hrefFor = (page: number) =>
  page === 1 ? "/admin/productos" : `/admin/productos?pagina=${page}`;

export default async function AdminProductsPage(props: PageProps<"/admin/productos">) {
  // El layout ya protege la ruta, pero las páginas se pueden renderizar en
  // paralelo al layout: se verifica también aquí antes de leer con service_role.
  const admin = await requireAdminPage("/admin/productos");
  if (admin.status !== "admin") return null;

  const page = parsePage((await props.searchParams).pagina);
  const { total, hidden } = await getProductCounts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Productos"
        description={
          <>
            {total} {total === 1 ? "producto" : "productos"}
            {hidden > 0 && ` · ${hidden} ${hidden === 1 ? "oculto" : "ocultos"}`}
          </>
        }
        actions={
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-brick px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brick-dark"
          >
            <Plus size={16} />
            Nuevo producto
          </Link>
        }
      />

      {/* key: al cambiar de página vuelve a mostrarse el skeleton. */}
      <Suspense
        key={page}
        fallback={<ProductGridSkeleton count={Math.min(total || 6, ADMIN_PAGE_SIZE)} variant="admin" />}
      >
        <ProductsSection page={page} />
      </Suspense>
    </section>
  );
}

async function ProductsSection({ page }: { page: number }) {
  const result = await getProductsPage(page);

  return (
    <div className="space-y-8">
      <ProductList products={result.items} now={new Date()} />
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
    </div>
  );
}
