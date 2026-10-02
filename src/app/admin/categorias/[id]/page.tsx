import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import CategoryForm from "@/components/admin/CategoryForm";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdminPage } from "@/lib/auth/admin";
import { getCategoryById } from "@/lib/products/queries";

import { updateCategory } from "../actions";

export const metadata: Metadata = {
  title: "Editar categoría · Panel admin",
  robots: { index: false },
};

export default async function EditCategoryPage(props: PageProps<"/admin/categorias/[id]">) {
  const { id } = await props.params;

  const admin = await requireAdminPage(`/admin/categorias/${id}`);
  if (admin.status !== "admin") return null;

  if (!z.uuid().safeParse(id).success) notFound();

  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title={category.name}
        description={`Editar categoría · se ve en /productos/${category.slug}`}
        back={{ href: "/admin/categorias", label: "Categorías" }}
      />
      <CategoryForm action={updateCategory.bind(null, category.id)} category={category} />
    </section>
  );
}
