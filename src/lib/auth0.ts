import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Lee AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET y
// APP_BASE_URL del entorno. Las rutas /auth/login, /auth/logout, etc. las
// monta automáticamente src/proxy.ts.
export const auth0 = new Auth0Client();
