import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// ---- Mock: cliente de Supabase Storage que registra las subidas ----
const upload = vi.fn<(...args: unknown[]) => Promise<{ error: null }>>(async () => ({ error: null }));
const getPublicUrl = vi.fn((path: string) => ({ data: { publicUrl: `https://x/${path}` } }));
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({ storage: { from: () => ({ upload, getPublicUrl }) } }),
}));

const ONE_YEAR = 60 * 60 * 24 * 365;
const THIRTY_ONE_DAYS = 60 * 60 * 24 * 31;

describe("caché de imágenes", () => {
  beforeEach(() => {
    upload.mockClear();
  });

  it("sube las imágenes a Supabase con Cache-Control de un año (URLs inmutables)", async () => {
    const { uploadPublicImage } = await import("@/lib/supabase/storage");
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await uploadPublicImage(file, "products");

    expect(upload).toHaveBeenCalledTimes(1);
    const [path, , options] = upload.mock.calls[0];
    expect(path).toMatch(/^products\/[0-9a-f-]+\.png$/);
    expect(options).toEqual({ contentType: "image/png", cacheControl: String(ONE_YEAR) });
  });

  it("el optimizador de Next cachea las imágenes al menos 31 días", async () => {
    const { default: config } = await import("../../next.config");

    expect(config.images?.minimumCacheTTL).toBeGreaterThanOrEqual(THIRTY_ONE_DAYS);
  });
});
