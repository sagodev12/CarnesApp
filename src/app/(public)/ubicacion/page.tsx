import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VisitSection from "@/components/public/VisitSection";
import { toCoordinates } from "@/lib/location";
import { getSiteConfig } from "@/lib/site-config/queries";

// Respaldo: el panel revalida esta página al guardar (revalidatePath).
export const revalidate = 3600;

export const metadata: Metadata = { title: "Ubicación" };

export default async function LocationPage() {
  const config = await getSiteConfig();
  const coordinates = toCoordinates(config);
  // Sin ubicación configurada no hay mapa (el menú tampoco muestra el enlace).
  if (!coordinates) notFound();

  return <VisitSection config={config} coordinates={coordinates} />;
}
