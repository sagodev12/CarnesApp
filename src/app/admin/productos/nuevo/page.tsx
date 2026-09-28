import type { Metadata } from "next";

import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/auth/admin";
import { getCategories } from "@/lib/products/queries";

import { createProduct } from "../actions";

export const metadata: Metadata = {
  title: "Nuevo producto · Panel admin",
  robots: { index: false },
};

export default async function NewProductPage() {
  const admin = await requireAdminPage("/admin/productos/nuevo");
  if (admin.status !== "admin") return null;

  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title="Nuevo producto"
        description="Completa los datos y agrégalo a la tienda."
        back={{ href: "/admin/productos", label: "Productos" }}
      />
      <ProductForm categories={categories} action={createProduct} />
    </section>
  );
}
