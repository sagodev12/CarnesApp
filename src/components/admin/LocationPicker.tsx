"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import type { LatLngExpression, Map as LeafletMap, Marker } from "leaflet";
import { Loader2, LocateFixed, MapPin, Search, Trash2 } from "lucide-react";

import { inputClass } from "@/components/ui/form";
import { roundCoordinate, type Coordinates } from "@/lib/location";

type LocationPickerProps = {
  initial: Coordinates | null;
  // Dirección guardada: prellena la búsqueda.
  address: string | null;
  error?: string;
};

type SearchResult = { display_name: string; lat: string; lon: string };

// Sin ubicación: Colombia completa.
const DEFAULT_CENTER: LatLngExpression = [4.5709, -74.2973];
const DEFAULT_ZOOM = 5;
const PIN_ZOOM = 17;

// Pin propio (divIcon): los íconos por defecto de Leaflet se rompen con bundlers.
const PIN_HTML = `<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true">
  <path d="M16 1C7.7 1 1 7.6 1 15.9 1 27.3 16 41 16 41s15-13.7 15-25.1C31 7.6 24.3 1 16 1z" fill="currentColor" stroke="#fff" stroke-width="2"/>
  <circle cx="16" cy="16" r="5.5" fill="#fff"/>
</svg>`;

// Selector de la ubicación del local con OpenStreetMap: buscar dirección,
// clic en el mapa o arrastrar el pin. Envía latitude/longitude en inputs ocultos.
export default function LocationPicker({ initial, address, error }: LocationPickerProps) {
  const [position, setPosition] = useState<Coordinates | null>(initial);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(address ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  // Crea el mapa una vez (Leaflet usa window: se importa en el cliente).
  useEffect(() => {
    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        initial ? [initial.lat, initial.lng] : DEFAULT_CENTER,
        initial ? PIN_ZOOM : DEFAULT_ZOOM,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      map.on("click", (event) => setPosition(round(event.latlng)));

      mapRef.current = map;
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Solo al montar: la posición inicial después la maneja el estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantiene el pin sincronizado con la posición elegida.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    if (!position) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng]);
      return;
    }

    const marker = L.marker([position.lat, position.lng], {
      draggable: true,
      keyboard: false,
      icon: L.divIcon({
        className: "text-brick drop-shadow",
        html: PIN_HTML,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      }),
    }).addTo(map);
    marker.on("dragend", () => setPosition(round(marker.getLatLng())));
    markerRef.current = marker;
  }, [position, ready]);

  function moveTo(coords: Coordinates) {
    setPosition(round(coords));
    mapRef.current?.setView([coords.lat, coords.lng], PIN_ZOOM);
  }

  async function search() {
    const text = query.trim();
    if (text.length < 3) {
      setNotice("Escribe una dirección más completa.");
      return;
    }

    setSearching(true);
    setNotice(null);
    setResults([]);
    try {
      // Nominatim (OpenStreetMap): solo al presionar, nunca al escribir.
      const params = new URLSearchParams({
        format: "jsonv2",
        limit: "5",
        countrycodes: "co",
        "accept-language": "es",
        q: text,
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const found = (await response.json()) as SearchResult[];

      if (found.length === 0) {
        setNotice("No encontramos esa dirección. Prueba con barrio y ciudad, o marca el punto en el mapa.");
      } else if (found.length === 1) {
        choose(found[0]);
      } else {
        setResults(found);
      }
    } catch {
      setNotice("No se pudo buscar ahora. Marca el punto directamente en el mapa.");
    } finally {
      setSearching(false);
    }
  }

  function choose(result: SearchResult) {
    setResults([]);
    moveTo({ lat: Number(result.lat), lng: Number(result.lon) });
    setNotice("Revisa que el pin quede en la entrada del local; puedes arrastrarlo.");
  }

  function locate() {
    if (!navigator.geolocation) {
      setNotice("Este navegador no permite obtener la ubicación.");
      return;
    }
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        moveTo({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        setLocating(false);
        setNotice("No se pudo obtener tu ubicación. Revisa los permisos del navegador.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function clear() {
    setPosition(null);
    setResults([]);
    setNotice("Sin ubicación: la sección del mapa no se mostrará en la página.");
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="latitude" value={position?.lat ?? ""} />
      <input type="hidden" name="longitude" value={position?.lng ?? ""} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="location-search" className="sr-only">
          Buscar dirección
        </label>
        <input
          id="location-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            // Enter busca en vez de enviar todo el formulario de configuración.
            if (event.key === "Enter") {
              event.preventDefault();
              void search();
            }
          }}
          placeholder="Ej: Calle 10 # 5-20, Bucaramanga"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={searching}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-60"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Buscar
        </button>
      </div>

      {results.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white text-sm">
          {results.map((result) => (
            <li key={`${result.lat},${result.lon}`}>
              <button
                type="button"
                onClick={() => choose(result)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-cream"
              >
                <MapPin size={16} className="mt-0.5 shrink-0 text-brick" />
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* isolate: las capas de Leaflet (z-index 400+) no tapan la barra del panel. */}
      <div className="relative isolate overflow-hidden rounded-xl border border-line bg-charcoal/5">
        <div
          ref={containerRef}
          className="h-72 w-full sm:h-80"
          role="application"
          aria-label="Mapa: haz clic para marcar la ubicación del local"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-charcoal/50">
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className={position ? "text-charcoal/70" : "text-charcoal/50"}>
          {position
            ? `Ubicación: ${position.lat}, ${position.lng}`
            : "Haz clic en el mapa para marcar el local."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 font-medium hover:border-charcoal/40 disabled:opacity-60"
          >
            {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            Usar mi ubicación
          </button>
          {position && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 font-medium text-brick hover:border-brick/50"
            >
              <Trash2 size={14} />
              Quitar ubicación
            </button>
          )}
        </div>
      </div>

      {notice && <p className="text-xs text-charcoal/60">{notice}</p>}
      {error && <p className="text-xs text-brick">{error}</p>}
    </div>
  );
}

function round({ lat, lng }: Coordinates): Coordinates {
  return { lat: roundCoordinate(lat), lng: roundCoordinate(lng) };
}
