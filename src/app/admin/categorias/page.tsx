import type { Metadata } from "next";

import CategoryForm from "@/components/admin/CategoryForm";
import CategoryList from "@/components/admin/CategoryList";
import { requireAdminPage } from "@/lib/auth/admin";
import { getCategories, getProductCountByCategory } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Categorías · Panel admin",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPage("/admin/categorias");
  if (admin.status !== "admin") return null;

  const [categories, productCounts] = await Promise.all([
    getCategories(),
    getProductCountByCategory(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black">Categorías</h1>
        <p className="mt-1 text-charcoal/70">
          Agrupan los productos y sirven de filtro en la galería.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
        <CategoryForm />
        <CategoryList categories={categories} productCounts={productCounts} />
      </div>
    </section>
  );
}
