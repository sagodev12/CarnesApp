import type { Metadata } from "next";

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
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-3xl font-black">Nuevo producto</h1>
      <ProductForm categories={categories} action={createProduct} />
    </section>
  );
}
