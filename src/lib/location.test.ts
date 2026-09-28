import { describe, expect, it } from "vitest";

import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  roundCoordinate,
  toCoordinates,
} from "./location";

const coords = { lat: 4.609711, lng: -74.08175 };

describe("toCoordinates", () => {
  it("devuelve las coordenadas cuando ambas existen", () => {
    expect(toCoordinates({ latitude: 4.609711, longitude: -74.08175 })).toEqual(coords);
  });

  it("devuelve null si falta alguna", () => {
    expect(toCoordinates({ latitude: null, longitude: null })).toBeNull();
    expect(toCoordinates({ latitude: 4.6, longitude: null })).toBeNull();
  });

  it("acepta coordenadas en cero (no las trata como vacías)", () => {
    expect(toCoordinates({ latitude: 0, longitude: 0 })).toEqual({ lat: 0, lng: 0 });
  });
});

describe("roundCoordinate", () => {
  it("redondea a 6 decimales", () => {
    expect(roundCoordinate(4.6097112345)).toBe(4.609711);
    expect(roundCoordinate(-74.0817549999)).toBe(-74.081755);
  });
});

describe("enlaces de Google Maps", () => {
  it("arma la URL del mapa embebido con zoom y en español", () => {
    expect(googleMapsEmbedUrl(coords)).toBe(
      "https://maps.google.com/maps?q=4.609711,-74.08175&z=16&hl=es&output=embed",
    );
    expect(googleMapsEmbedUrl(coords, 18)).toContain("&z=18&");
  });

  it("arma la URL de cómo llegar", () => {
    expect(googleMapsDirectionsUrl(coords)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=4.609711,-74.08175",
    );
  });
});
