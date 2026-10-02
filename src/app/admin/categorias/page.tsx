import type { Metadata } from "next";

import CategoryForm from "@/components/admin/CategoryForm";
import CategoryList from "@/components/admin/CategoryList";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdminPage } from "@/lib/auth/admin";
import { getCategoriesWithCounts } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Categorías · Panel admin",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPage("/admin/categorias");
  if (admin.status !== "admin") return null;

  const categories = await getCategoriesWithCounts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Categorías"
        description="Agrupan los productos. Cada una tiene su página en la tienda y una tarjeta en el inicio."
      />

      <div className="grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
        <CategoryForm />
        <CategoryList categories={categories} />
      </div>
    </section>
  );
}
