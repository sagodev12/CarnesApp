import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { analyzeImageTone, perceivedLuminance, toneFromLuminance } from "./image-tone";

// Imagen sólida (o partida en dos colores, izquierda/derecha) en PNG.
async function png(left: string, right = left, width = 200, height = 100) {
  const half = await sharp({
    create: { width: width / 2, height, channels: 3, background: right },
  })
    .png()
    .toBuffer();
  return sharp({ create: { width, height, channels: 3, background: left } })
    .composite([{ input: half, left: width / 2, top: 0 }])
    .png()
    .toBuffer();
}

describe("perceivedLuminance", () => {
  it("va de 0 (negro) a 1 (blanco)", () => {
    expect(perceivedLuminance(0, 0, 0)).toBe(0);
    expect(perceivedLuminance(255, 255, 255)).toBeCloseTo(1);
  });

  it("el verde pesa más que el azul (así lo percibe el ojo)", () => {
    expect(perceivedLuminance(0, 255, 0)).toBeGreaterThan(perceivedLuminance(0, 0, 255));
  });
});

describe("toneFromLuminance", () => {
  it("clasifica en clara u oscura", () => {
    expect(toneFromLuminance(0.9)).toBe("light");
    expect(toneFromLuminance(0.2)).toBe("dark");
  });
});

describe("analyzeImageTone", () => {
  it("detecta imágenes claras y oscuras", async () => {
    expect(await analyzeImageTone(await png("#ffffff"))).toBe("light");
    expect(await analyzeImageTone(await png("#f3e9d2"))).toBe("light");
    expect(await analyzeImageTone(await png("#111111"))).toBe("dark");
    expect(await analyzeImageTone(await png("#9a3324"))).toBe("dark");
  });

  it("mide la zona del texto (izquierda), no la imagen entera", async () => {
    expect(await analyzeImageTone(await png("#ffffff", "#000000"))).toBe("light");
    expect(await analyzeImageTone(await png("#000000", "#ffffff"))).toBe("dark");
  });

  it("devuelve null si el archivo no es una imagen", async () => {
    expect(await analyzeImageTone(Buffer.from("no es una imagen"))).toBeNull();
  });
});
