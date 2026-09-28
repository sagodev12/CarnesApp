import { beforeEach, describe, expect, it, vi } from "vitest";

const getActiveProductsPage = vi.fn();
const getActiveProductsByIds = vi.fn();
vi.mock("@/lib/products/public-queries", () => ({
  getActiveProductsPage: (...args: unknown[]) => getActiveProductsPage(...args),
  getActiveProductsByIds: (...args: unknown[]) => getActiveProductsByIds(...args),
}));

const { GET } = await import("@/app/api/products/route");

const A = "4352e764-3ae0-43f0-ac77-dce1563944c7";
const request = (query: string) => new Request(`http://localhost/api/products?${query}`);

beforeEach(() => {
  vi.clearAllMocks();
  getActiveProductsPage.mockResolvedValue({
    items: [{ id: A }],
    total: 1,
    page: 2,
    pageSize: 12,
    totalPages: 1,
    hasMore: false,
  });
  getActiveProductsByIds.mockResolvedValue([{ id: A }]);
});

describe("GET /api/products", () => {
  it("devuelve una página de productos con cabeceras de caché", async () => {
    const response = await GET(request(`pagina=2&categoria=${A}`));

    expect(response.status).toBe(200);
    expect(getActiveProductsPage).toHaveBeenCalledWith({ page: 2, categoryId: A, search: null });
    expect(await response.json()).toMatchObject({ items: [{ id: A }], page: 2 });
    expect(response.headers.get("cache-control")).toMatch(/s-maxage=\d+/);
  });

  it("pasa la búsqueda normalizada a la consulta", async () => {
    await GET(request("buscar=%20chata%20"));

    expect(getActiveProductsPage).toHaveBeenCalledWith({ page: 1, categoryId: null, search: "chata" });
  });

  it("devuelve productos por ids (para validar el carrito)", async () => {
    const response = await GET(request(`ids=${A}`));

    expect(getActiveProductsByIds).toHaveBeenCalledWith([A]);
    expect(await response.json()).toEqual({ items: [{ id: A }] });
  });

  it("responde 400 ante parámetros inválidos sin consultar la base", async () => {
    const response = await GET(request("categoria=res"));

    expect(response.status).toBe(400);
    expect(getActiveProductsPage).not.toHaveBeenCalled();
  });
});
