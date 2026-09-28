import { describe, expect, it } from "vitest";

import { imagePathFromUrl } from "./storage-path";

const BASE = "https://abc.supabase.co/storage/v1/object/public";

describe("imagePathFromUrl", () => {
  it("extrae la ruta dentro del bucket", () => {
    expect(imagePathFromUrl(`${BASE}/products/a45c.jpeg`, "products")).toBe("a45c.jpeg");
    expect(imagePathFromUrl(`${BASE}/products/site/logo.png`, "products")).toBe(
      "site/logo.png",
    );
  });

  it("decodifica caracteres escapados", () => {
    expect(imagePathFromUrl(`${BASE}/products/mi%20foto.png`, "products")).toBe(
      "mi foto.png",
    );
  });

  it("devuelve null para otros buckets, URLs externas o vacías", () => {
    expect(imagePathFromUrl(`${BASE}/product-images/a.png`, "products")).toBeNull();
    expect(imagePathFromUrl("https://example.com/a.png", "products")).toBeNull();
    expect(imagePathFromUrl(null, "products")).toBeNull();
    expect(imagePathFromUrl("", "products")).toBeNull();
  });
});
