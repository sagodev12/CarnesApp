import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import PageHeader from "@/components/admin/PageHeader";
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
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title={product.name}
        description="Editar producto"
        back={{ href: "/admin/productos", label: "Productos" }}
      />
      <ProductForm
        categories={categories}
        action={updateProduct.bind(null, product.id)}
        product={product}
      />
    </section>
  );
}
