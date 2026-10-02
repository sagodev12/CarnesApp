import { beforeEach, describe, expect, it, vi } from "vitest";

// ---- Mocks: Auth0 (vía assertAdmin), Supabase y Next ----
const assertAdmin = vi.fn();
vi.mock("@/lib/auth/admin", () => ({ assertAdmin: () => assertAdmin() }));

// Cliente de Supabase falso y encadenable que registra las llamadas.
const calls: { table: string; op: string; payload?: unknown }[] = [];
let dbError: { message: string; code?: string } | null = null;
// Fila que devuelve maybeSingle() (lectura previa o fila borrada).
const EMPTY_ROW = { image_url: null, logo_url: null, hero_image_url: null, about_image_url: null, offers_image_url: null };
let currentRow: Record<string, unknown> | null = EMPTY_ROW;

function query(table: string) {
  const builder = {
    insert: (payload: unknown) => (calls.push({ table, op: "insert", payload }), builder),
    update: (payload: unknown) => (calls.push({ table, op: "update", payload }), builder),
    delete: () => (calls.push({ table, op: "delete" }), builder),
    select: () => builder,
    eq: () => builder,
    maybeSingle: () => Promise.resolve({ data: dbError ? null : currentRow, error: dbError }),
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

const { createCategory, deleteCategory, updateCategory } = await import("@/app/admin/categorias/actions");
const storage = vi.mocked(await import("@/lib/supabase/storage"));
const { createProduct, updateProduct } = await import("@/app/admin/productos/actions");
const { updateSiteConfig } = await import("@/app/admin/configuracion/actions");
const { updateOffersSettings } = await import("@/app/admin/ofertas/actions");

const PRODUCT_ID = "4352e764-3ae0-43f0-ac77-dce1563944c7";
const idle = { status: "idle" as const };

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

const validProduct = form({ name: "Chata", description: "", price: "32000", unit: "kg", order: "0", active: "on" });
const validOffers = form({ offers_visible: "on", offers_style: "brand", offers_layout: "grid", offers_limit: "6" });
const validConfig = form({ business_name: "Surticarnes", phone_whatsapp: "3123627031", primary_color: "#9a3324" });

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;
  dbError = null;
  currentRow = EMPTY_ROW;
  assertAdmin.mockResolvedValue({ status: "admin", email: "admin@test.com" });
});

describe("todas las acciones exigen admin antes de tocar la base", () => {
  const actions = {
    createCategory: () => createCategory(idle, form({ name: "Res" })),
    deleteCategory: () => deleteCategory(PRODUCT_ID),
    updateCategory: () => updateCategory(PRODUCT_ID, idle, form({ name: "Res" })),
    createProduct: () => createProduct(idle, validProduct),
    updateProduct: () => updateProduct(PRODUCT_ID, idle, validProduct),
    updateSiteConfig: () => updateSiteConfig(idle, validConfig),
    updateOffersSettings: () => updateOffersSettings(idle, validOffers),
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
    expect(calls).toContainEqual({
      table: "categories",
      op: "insert",
      payload: { name: "Res", slug: "res", description: null, order: 1, image_url: null },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/categorias");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    // Los productos incluyen el nombre de su categoría.
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });

  it("sube la imagen a la carpeta de categorías y guarda su URL", async () => {
    const image = new File(["x"], "res.png", { type: "image/png" });
    const withImage = form({ name: "Res Añeja", description: "Cortes madurados" });
    withImage.set("image", image);

    const state = await createCategory(idle, withImage);

    expect(state.status).toBe("success");
    expect(storage.uploadPublicImage).toHaveBeenCalledWith(image, "categories");
    expect(calls).toContainEqual({
      table: "categories",
      op: "insert",
      payload: {
        name: "Res Añeja",
        slug: "res-aneja",
        description: "Cortes madurados",
        order: 0,
        image_url: "https://x/img.png",
      },
    });
  });

  it("si el nombre ya existe (slug único) lo marca en el campo y borra la imagen subida", async () => {
    dbError = { message: "duplicate key value violates unique constraint", code: "23505" };
    const withImage = form({ name: "Res" });
    withImage.set("image", new File(["x"], "res.png", { type: "image/png" }));

    const state = await createCategory(idle, withImage);

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.name?.[0]).toMatch(/Ya existe una categoría/);
    expect(storage.removeImageByUrl).toHaveBeenCalledWith("https://x/img.png");
  });
});

describe("updateCategory", () => {
  it("actualiza nombre, slug y descripción y redirige al listado", async () => {
    await expect(
      updateCategory(PRODUCT_ID, idle, form({ name: "Cerdo Criollo", description: "Del campo", order: "2" })),
    ).rejects.toThrow("REDIRECT:/admin/categorias");

    expect(calls).toContainEqual({
      table: "categories",
      op: "update",
      payload: { name: "Cerdo Criollo", slug: "cerdo-criollo", description: "Del campo", order: 2, image_url: null },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(revalidateTag).toHaveBeenCalledWith("products", { expire: 0 });
  });

  it("al reemplazar la imagen borra la anterior", async () => {
    currentRow = { image_url: "https://x/vieja.png" };
    const withImage = form({ name: "Res" });
    withImage.set("image", new File(["x"], "res.png", { type: "image/png" }));

    await expect(updateCategory(PRODUCT_ID, idle, withImage)).rejects.toThrow("REDIRECT");

    expect(calls).toContainEqual(
      expect.objectContaining({ op: "update", payload: expect.objectContaining({ image_url: "https://x/img.png" }) }),
    );
    expect(storage.removeImageByUrl).toHaveBeenCalledWith("https://x/vieja.png");
  });

  it("quita la imagen si se marca 'Quitar imagen'", async () => {
    currentRow = { image_url: "https://x/vieja.png" };

    await expect(
      updateCategory(PRODUCT_ID, idle, form({ name: "Res", remove_image: "on" })),
    ).rejects.toThrow("REDIRECT");

    expect(calls).toContainEqual(
      expect.objectContaining({ op: "update", payload: expect.objectContaining({ image_url: null }) }),
    );
    expect(storage.removeImageByUrl).toHaveBeenCalledWith("https://x/vieja.png");
  });

  it("sin imagen nueva conserva la actual", async () => {
    currentRow = { image_url: "https://x/actual.png" };

    await expect(updateCategory(PRODUCT_ID, idle, form({ name: "Res" }))).rejects.toThrow("REDIRECT");

    expect(calls).toContainEqual(
      expect.objectContaining({ op: "update", payload: expect.objectContaining({ image_url: "https://x/actual.png" }) }),
    );
    expect(storage.removeImageByUrl).not.toHaveBeenCalledWith("https://x/actual.png");
  });

  it("rechaza ids que no son uuid", async () => {
    const state = await updateCategory("abc", idle, form({ name: "Res" }));

    expect(state.status).toBe("error");
    expect(calls).toHaveLength(0);
  });
});

describe("deleteCategory", () => {
  it("borra también la imagen de la categoría", async () => {
    currentRow = { image_url: "https://x/res.png" };

    const result = await deleteCategory(PRODUCT_ID);

    expect(result.status).toBe("success");
    expect(calls).toContainEqual({ table: "categories", op: "delete" });
    expect(storage.removeImageByUrl).toHaveBeenCalledWith("https://x/res.png");
  });

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

  it("guarda la marca de agotado", async () => {
    await createProduct(
      idle,
      form({ name: "Chata", description: "", price: "32000", unit: "kg", order: "0", active: "on", sold_out: "on" }),
    );

    expect(calls[0]).toMatchObject({ table: "products", op: "insert", payload: { sold_out: true } });
  });

  it("sin promoción guarda las columnas de promoción en null", async () => {
    await createProduct(idle, validProduct);

    expect(calls[0]).toMatchObject({
      payload: { sale_price: null, sale_starts_at: null, sale_ends_at: null },
    });
  });

  it("guarda el precio promo y su vigencia", async () => {
    const state = await createProduct(
      idle,
      form({
        name: "Chata",
        description: "",
        price: "32000",
        sale_price: "28000",
        sale_starts_at: "2026-10-01",
        sale_ends_at: "2026-10-31",
        unit: "kg",
        order: "0",
        active: "on",
      }),
    );

    expect(state.status).toBe("success");
    expect(calls[0]).toMatchObject({
      table: "products",
      op: "insert",
      payload: {
        sale_price: 28000,
        sale_starts_at: "2026-10-01T05:00:00.000Z",
        sale_ends_at: "2026-11-01T05:00:00.000Z",
      },
    });
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

  it("guarda el texto del footer y la sección Nosotros", async () => {
    const withAbout = form({
      business_name: "Surticarnes",
      phone_whatsapp: "3123627031",
      primary_color: "#9a3324",
      footer_text: "Desde 1998",
      about_title: "Nuestra historia",
      about_text: "Empezamos en 1998.",
    });
    const image = new File(["x"], "local.jpg", { type: "image/jpeg" });
    withAbout.set("about_image", image);

    const state = await updateSiteConfig(idle, withAbout);

    expect(state.status).toBe("success");
    expect(storage.uploadPublicImage).toHaveBeenCalledWith(image, "site");
    const update = calls.find((call) => call.table === "site_config" && call.op === "update");
    expect(update?.payload).toMatchObject({
      footer_text: "Desde 1998",
      about_title: "Nuestra historia",
      about_text: "Empezamos en 1998.",
      about_image_url: "https://x/img.png",
    });
    // Solo columnas de la tabla: el archivo y la casilla no se envían.
    expect(update?.payload).not.toHaveProperty("about_image");
    expect(update?.payload).not.toHaveProperty("remove_about_image");
  });

  it("al quitar la imagen de Nosotros borra la anterior", async () => {
    currentRow = { ...EMPTY_ROW, id: "1", about_image_url: "https://x/local.jpg" };

    const state = await updateSiteConfig(
      idle,
      form({ business_name: "Surticarnes", phone_whatsapp: "3123627031", primary_color: "#9a3324", remove_about_image: "on" }),
    );

    expect(state.status).toBe("success");
    expect(calls).toContainEqual(
      expect.objectContaining({ table: "site_config", op: "update", payload: expect.objectContaining({ about_image_url: null }) }),
    );
    expect(storage.removeImageByUrl).toHaveBeenCalledWith("https://x/local.jpg");
  });

  it("guarda la ubicación del local", async () => {
    const withLocation = form({
      business_name: "Surticarnes",
      phone_whatsapp: "3123627031",
      primary_color: "#9a3324",
      latitude: "4.609711",
      longitude: "-74.08175",
    });

    const state = await updateSiteConfig(idle, withLocation);

    expect(state.status).toBe("success");
    expect(calls).toContainEqual(
      expect.objectContaining({
        table: "site_config",
        op: "update",
        payload: expect.objectContaining({ latitude: 4.609711, longitude: -74.08175 }),
      }),
    );
  });
});

describe("updateOffersSettings", () => {
  it("guarda solo las columnas de la franja de ofertas y revalida el sitio", async () => {
    const state = await updateOffersSettings(
      idle,
      form({
        offers_visible: "on",
        offers_eyebrow: "Este fin de semana",
        offers_title: "Precios bajos",
        offers_style: "brand",
        offers_layout: "grid",
        offers_limit: "6",
      }),
    );

    expect(state.status).toBe("success");
    const update = calls.find((call) => call.table === "site_config" && call.op === "update");
    expect(update?.payload).toEqual({
      offers_visible: true,
      offers_eyebrow: "Este fin de semana",
      offers_title: "Precios bajos",
      offers_subtitle: null,
      offers_style: "brand",
      offers_layout: "grid",
      offers_limit: 6,
      offers_image_url: null,
      updated_at: expect.any(String),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/ofertas");
  });

  it("devuelve errores de validación sin escribir", async () => {
    const state = await updateOffersSettings(idle, form({ offers_style: "neon", offers_layout: "grid", offers_limit: "6" }));

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.offers_style).toBeDefined();
    expect(calls.filter((call) => call.op === "update")).toHaveLength(0);
  });

  it("el estilo con imagen exige una imagen de fondo", async () => {
    const state = await updateOffersSettings(
      idle,
      form({ offers_style: "image", offers_layout: "carousel", offers_limit: "12" }),
    );

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.offers_image?.[0]).toMatch(/imagen/i);
    expect(storage.uploadPublicImage).not.toHaveBeenCalled();
    expect(calls.filter((call) => call.op === "update")).toHaveLength(0);
  });

  it("sube la imagen de fondo nueva y borra la anterior", async () => {
    currentRow = { ...EMPTY_ROW, offers_image_url: "https://x/vieja.jpg" };
    const withImage = form({ offers_style: "image", offers_layout: "carousel", offers_limit: "12" });
    const image = new File(["x"], "fondo.jpg", { type: "image/jpeg" });
    withImage.set("offers_image", image);

    const state = await updateOffersSettings(idle, withImage);

    expect(state.status).toBe("success");
    expect(storage.uploadPublicImage).toHaveBeenCalledWith(image, "site");
    expect(calls).toContainEqual(
      expect.objectContaining({ op: "update", payload: expect.objectContaining({ offers_image_url: "https://x/img.png" }) }),
    );
    expect(storage.removeImageByUrl).toHaveBeenCalledWith("https://x/vieja.jpg");
  });

  it("conserva la imagen actual si no se sube otra", async () => {
    currentRow = { ...EMPTY_ROW, offers_image_url: "https://x/actual.jpg" };

    const state = await updateOffersSettings(
      idle,
      form({ offers_style: "image", offers_layout: "carousel", offers_limit: "12" }),
    );

    expect(state.status).toBe("success");
    expect(calls).toContainEqual(
      expect.objectContaining({ op: "update", payload: expect.objectContaining({ offers_image_url: "https://x/actual.jpg" }) }),
    );
    expect(storage.removeImageByUrl).not.toHaveBeenCalled();
  });
});
