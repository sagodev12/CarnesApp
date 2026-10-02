import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Imágenes de productos servidas desde Supabase Storage.
    remotePatterns: supabaseUrl
      ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)]
      : [],
    // Las URLs de imágenes son inmutables (UUID por subida): cachear las
    // versiones optimizadas 31 días en vez de las 4 h por defecto.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  experimental: {
    serverActions: {
      // Imágenes de hasta 4 MB + overhead de multipart/form-data.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
