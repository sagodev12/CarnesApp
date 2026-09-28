import type { OpeningHours } from "@/lib/hours";

export type Category = {
  id: string;
  name: string;
  order: number;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  // Promoción: precio rebajado con vigencia opcional (ver lib/promotions).
  sale_price: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  unit: string | null;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
  // Se muestra en la tienda pero no se puede pedir.
  sold_out: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name"> | null;
};

export type SiteConfig = {
  id: string | null; // null = valores por defecto (no hay fila o RLS no la deja leer)
  business_name: string;
  logo_url: string | null;
  hero_image_url: string | null;
  description: string | null;
  address: string | null;
  phone_whatsapp: string;
  whatsapp_message: string | null;
  schedule: string | null;
  instagram: string | null;
  facebook: string | null;
  primary_color: string | null;
  // Ubicación del local (ambas null = sin mapa).
  latitude: number | null;
  longitude: number | null;
  // Horario por día (0 = domingo) para "Abierto / Cerrado ahora".
  opening_hours: OpeningHours | null;
};
