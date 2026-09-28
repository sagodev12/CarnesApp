import "server-only";

import { redirect } from "next/navigation";

import { auth0 } from "@/lib/auth0";

// Correos autorizados como administradores, separados por comas.
// Auth0 autentica a cualquiera (p. ej. con Google); esto decide quién es admin.
function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminStatus =
  | { status: "anonymous" }
  | { status: "forbidden"; email: string | undefined }
  | { status: "admin"; email: string; name: string | undefined };

export async function getAdminStatus(): Promise<AdminStatus> {
  const session = await auth0.getSession();

  if (!session) return { status: "anonymous" };

  const { email, email_verified: emailVerified, name } = session.user;
  const isAdmin =
    Boolean(email) &&
    emailVerified === true &&
    getAdminEmails().includes(email!.toLowerCase());

  if (!isAdmin) return { status: "forbidden", email };

  return { status: "admin", email: email!, name };
}

// Para páginas/layouts: manda al login si no hay sesión.
export async function requireAdminPage(returnTo: string) {
  const admin = await getAdminStatus();

  if (admin.status === "anonymous") {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return admin;
}

// Para Server Actions: se debe llamar al inicio de CADA acción, aunque la
// página ya esté protegida, porque las acciones son endpoints públicos.
export async function assertAdmin() {
  const admin = await getAdminStatus();

  if (admin.status !== "admin") {
    throw new Error("No autorizado");
  }

  return admin;
}
