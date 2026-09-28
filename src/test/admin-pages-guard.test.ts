import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

// El layout de /admin deja pasar a usuarios anónimos para que cada página
// redirija al login con su propia URL de retorno. Por eso TODA página del
// panel debe llamar a requireAdminPage: este test lo garantiza.
const ADMIN_DIR = join(process.cwd(), "src/app/admin");

function findPages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findPages(path);
    return entry.name === "page.tsx" ? [path] : [];
  });
}

describe("páginas del panel admin", () => {
  const pages = findPages(ADMIN_DIR).map((path) => ({ path, name: relative(ADMIN_DIR, path) }));

  it("encuentra las páginas del panel (incluido el dashboard)", () => {
    expect(pages.map(({ name }) => name)).toContain("page.tsx");
    expect(pages.length).toBeGreaterThanOrEqual(6);
  });

  for (const { path, name } of pages) {
    it(`${name} verifica el admin con requireAdminPage`, () => {
      const source = readFileSync(path, "utf8");

      expect(source).toMatch(/await requireAdminPage\(/);
      expect(source).toMatch(/if \(admin\.status !== "admin"\) return null;/);
    });
  }
});
