// Ubicación del local: coordenadas y enlaces de Google Maps (sin API key).

export type Coordinates = { lat: number; lng: number };

export function toCoordinates({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}): Coordinates | null {
  if (latitude === null || longitude === null) return null;
  return { lat: latitude, lng: longitude };
}

// 6 decimales ≈ 10 cm: suficiente y sin el ruido de los clics en el mapa.
export function roundCoordinate(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

export function googleMapsEmbedUrl({ lat, lng }: Coordinates, zoom = 16) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=es&output=embed`;
}

export function googleMapsDirectionsUrl({ lat, lng }: Coordinates) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
