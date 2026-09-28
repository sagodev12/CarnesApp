import { auth0 } from "@/lib/auth0";

// Monta las rutas de Auth0 (/auth/*) y mantiene la sesión viva.
// La autorización de admin NO se hace aquí: se verifica en el layout de
// /admin y dentro de cada Server Action (ver src/lib/auth/admin.ts).
export async function proxy(request: Request) {
  return await auth0.middleware(request);
}

// Solo donde hay sesión: rutas de Auth0 y el panel (incluye sus Server
// Actions, que se envían a la misma URL). La landing pública queda fuera,
// así sigue siendo estática y un fallo de Auth0 no la afecta.
export const config = {
  matcher: ["/auth/:path*", "/admin/:path*", "/admin"],
};
