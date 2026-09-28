import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdminPage } from "@/lib/auth/admin";
import { getCategories, getProductById } from "@/lib/products/queries";

import { updateProduct } from "../actions";

export const metadata: Metadata = {
  title: "Editar producto · Panel admin",
  robots: { index: false },
};

export default async function EditProductPage(props: PageProps<"/admin/productos/[id]">) {
  const { id } = await props.params;

  const admin = await requireAdminPage(`/admin/productos/${id}`);
  if (admin.status !== "admin") return null;

  if (!z.uuid().safeParse(id).success) notFound();

  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm text-charcoal/60">Editar producto</p>
      <h1 className="mb-6 font-display text-3xl font-black">{product.name}</h1>
      <ProductForm
        categories={categories}
        action={updateProduct.bind(null, product.id)}
        product={product}
      />
    </section>
  );
}
