-- Canal de contacto dentro de la aplicacion. Sin politicas de acceso: con la
-- seguridad a nivel de fila activada y ninguna politica, la clave anonima no
-- puede leer ni escribir. Solo la API, con la clave de servicio, entra aqui.

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (topic in ('soporte', 'privacidad', 'legal', 'otro')),
  reply_to text check (char_length(reply_to) <= 160),
  body text not null check (char_length(trim(body)) between 10 and 2000),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

create index if not exists support_messages_pendientes_idx
  on public.support_messages (created_at desc)
  where handled_at is null;

alter table public.support_messages enable row level security;
