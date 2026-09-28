import { beforeEach, describe, expect, it, vi } from "vitest";

// ---- Mocks: Auth0 (vía assertAdmin), Supabase y Next ----
const assertAdmin = vi.fn();
vi.mock("@/lib/auth/admin", () => ({ assertAdmin: () => assertAdmin() }));

// Cliente de Supabase falso y encadenable que registra las llamadas.
const calls: { table: string; op: string; payload?: unknown }[] = [];
let dbError: { message: string; code?: string } | null = null;

function query(table: string) {
  const builder = {
    insert: (payload: unknown) => (calls.push({ table, op: "insert", payload }), builder),
    update: (payload: unknown) => (calls.push({ table, op: "update", payload }), builder),
    delete: () => (calls.push({ table, op: "delete" }), builder),
    select: () => builder,
    eq: () => builder,
    maybeSingle: () => Promise.resolve({ data: { image_url: null, logo_url: null, hero_image_url: null }, error: dbError }),
    then: (resolve: (value: unknown) => void) => resolve({ error: dbError }),
  };
  return builder;
}

const createAdminClient = vi.fn(() => ({ from: query }));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: () => createAdminClient() }));
vi.mock("@/lib/supabase/storage", () => ({
  uploadPublicImage: vi.fn(async () => ({ url: "https://x/img.png", path: "img.png" })),
  removeImageByUrl: vi.fn(async () => {}),
}));

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const { createCategory, deleteCategory } = await import("@/app/admin/categorias/actions");
const { createProduct, updateProduct } = await import("@/app/admin/productos/actions");
const { updateSiteConfig } = await import("@/app/admin/configuracion/actions");

const PRODUCT_ID = "4352e764-3ae0-43f0-ac77-dce1563944c7";
const idle = { status: "idle" as const };

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

const validProduct = form({ name: "Chata", description: "", price: "32000", unit: "kg", order: "0", active: "on" });
const validConfig = form({ business_name: "Surticarnes", phone_whatsapp: "3123627031", primary_color: "#9a3324" });

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;
  dbError = null;
  assertAdmin.mockResolvedValue({ status: "admin", email: "admin@test.com" });
});

describe("todas las acciones exigen admin antes de tocar la base", () => {
  const actions = {
    createCategory: () => createCategory(idle, form({ name: "Res" })),
    deleteCategory: () => deleteCategory(PRODUCT_ID),
    createProduct: () => createProduct(idle, validProduct),
    updateProduct: () => updateProduct(PRODUCT_ID, idle, validProduct),
    updateSiteConfig: () => updateSiteConfig(idle, validConfig),
  };

  for (const [name, run] of Object.entries(actions)) {
    it(`${name} rechaza a quien no es admin`, async () => {
      assertAdmin.mockRejectedValue(new Error("No autorizado"));

      await expect(run()).rejects.toThrow("No autorizado");
      expect(createAdminClient).not.toHaveBeenCalled();
      expect(calls).toHaveLength(0);
    });
  }
});

describe("createCategory", () => {
  it("devuelve errores de validación sin escribir", async () => {
    const state = await createCategory(idle, form({ name: "A" }));

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.name).toBeDefined();
    expect(calls).toHaveLength(0);
  });

  it("inserta la categoría y revalida el panel y el sitio", async () => {
    const state = await createCategory(idle, form({ name: "Res", order: "1" }));

    expect(state.status).toBe("success");
    expect(calls).toContainEqual({ table: "categories", op: "insert", payload: { name: "Res", order: 1 } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/categorias");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    // Los productos incluyen el nombre de su categoría.
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });
});

describe("deleteCategory", () => {
  it("explica el error cuando la categoría tiene productos (FK)", async () => {
    dbError = { message: "violates foreign key constraint", code: "23503" };

    const result = await deleteCategory(PRODUCT_ID);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/productos asociados/);
  });

  it("rechaza ids que no son uuid", async () => {
    const result = await deleteCategory("1; drop table");

    expect(result.status).toBe("error");
    expect(calls).toHaveLength(0);
  });
});

describe("createProduct", () => {
  it("guarda la descripción vacía como string vacío", async () => {
    const state = await createProduct(idle, validProduct);

    expect(state.status).toBe("success");
    expect(calls[0]).toMatchObject({ table: "products", op: "insert", payload: { description: "" } });
  });

  it("invalida la caché de productos de la galería de inmediato", async () => {
    await createProduct(idle, validProduct);

    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });
});

describe("updateProduct", () => {
  it("actualiza y redirige al listado", async () => {
    await expect(updateProduct(PRODUCT_ID, idle, validProduct)).rejects.toThrow(
      "REDIRECT:/admin/productos",
    );
    expect(calls).toContainEqual(
      expect.objectContaining({ table: "products", op: "update" }),
    );
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });

  it("rechaza ids que no son uuid", async () => {
    const state = await updateProduct("abc", idle, validProduct);

    expect(state.status).toBe("error");
    expect(calls.filter((call) => call.op === "update")).toHaveLength(0);
  });
});

describe("updateSiteConfig", () => {
  it("guarda el WhatsApp normalizado", async () => {
    const state = await updateSiteConfig(idle, validConfig);

    expect(state.status).toBe("success");
    expect(calls).toContainEqual(
      expect.objectContaining({
        table: "site_config",
        op: "update",
        payload: expect.objectContaining({ phone_whatsapp: "573123627031" }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
