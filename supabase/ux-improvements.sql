-- Mejoras de la tienda: productos agotados y horario de atención.
-- Ejecutar una vez en Supabase: Dashboard → SQL Editor, ANTES de desplegar
-- el código que las usa (las consultas piden estas columnas).

-- 1. Agotado: el producto se muestra pero no se puede pedir.
alter table public.products
  add column if not exists sold_out boolean not null default false;

-- 2. Horario estructurado para "Abierto / Cerrado ahora".
-- Arreglo de 7 días (0 = domingo): {"open":"07:00","close":"18:00"} o null (cerrado).
-- null en la columna = sin horario configurado (no se muestra el indicador).
alter table public.site_config
  add column if not exists opening_hours jsonb;
