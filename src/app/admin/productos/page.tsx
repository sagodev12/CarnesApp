import type { Metadata } from "next";

import ProductForm from "@/components/admin/ProductForm";
import ProductList from "@/components/admin/ProductList";
import { requireAdminPage } from "@/lib/auth/admin";
import { getAllProducts, getCategories } from "@/lib/products/queries";

export const metadata: Metadata = {
  title: "Productos · Panel admin",
  robots: { index: false },
};

export default async function AdminProductsPage() {
  // El layout ya protege la ruta, pero las páginas se pueden renderizar en
  // paralelo al layout: se verifica también aquí antes de leer con service_role.
  const admin = await requireAdminPage("/admin/productos");
  if (admin.status !== "admin") return null;

  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black">Productos</h1>
        <p className="mt-1 text-charcoal/70">
          {products.length} {products.length === 1 ? "producto" : "productos"} en
          el catálogo.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="lg:sticky lg:top-6">
          <ProductForm categories={categories} />
        </div>
        <ProductList products={products} />
      </div>
    </section>
  );
}
