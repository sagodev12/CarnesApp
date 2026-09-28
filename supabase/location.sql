-- Ubicación del local para el mapa de la página pública.
-- Ejecutar una vez en Supabase: Dashboard → SQL Editor, ANTES de desplegar
-- el código que la usa (la consulta de site_config pide estas columnas).
--
-- Ambas null = sin mapa. La lectura pública de site_config ya las cubre.

alter table public.site_config
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.site_config drop constraint if exists site_config_location_check;
alter table public.site_config
  add constraint site_config_location_check
  check (
    (latitude is null and longitude is null)
    or (
      latitude between -90 and 90
      and longitude between -180 and 180
    )
  );
