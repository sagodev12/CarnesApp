-- Lectura pública para la landing y la galería.
-- Ejecutar una vez en Supabase: Dashboard → SQL Editor.
--
-- Las escrituras NO se abren: solo el servidor (secret key) crea/edita,
-- y esa key se salta RLS. admin_users queda sin acceso público.

drop policy if exists "Lectura pública de productos activos" on public.products;
create policy "Lectura pública de productos activos"
  on public.products for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Lectura pública de categorías" on public.categories;
create policy "Lectura pública de categorías"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Lectura pública de la configuración" on public.site_config;
create policy "Lectura pública de la configuración"
  on public.site_config for select
  to anon, authenticated
  using (true);
