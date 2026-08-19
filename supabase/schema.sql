-- Esquema de Deska para PostgreSQL 15 gestionado por Supabase.
-- Ejecutar desde el editor SQL del proyecto o mediante la CLI de Supabase.

create extension if not exists "pgcrypto";

-- Los tipos se crean solo si faltan, de modo que este archivo puede volver a
-- ejecutarse entero sobre un proyecto ya existente para aplicar novedades.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'wishlist',
      'applied',
      'interview',
      'offer',
      'hired',
      'rejected'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'work_mode') then
    create type public.work_mode as enum ('onsite', 'hybrid', 'remote');
  end if;

  if not exists (select 1 from pg_type where typname = 'application_priority') then
    create type public.application_priority as enum ('low', 'medium', 'high');
  end if;
end
$$;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null check (char_length(trim(company)) between 1 and 120),
  position text not null check (char_length(trim(position)) between 1 and 120),
  status public.application_status not null default 'wishlist',
  location text check (char_length(location) <= 120),
  work_mode public.work_mode,
  priority public.application_priority not null default 'medium',
  salary_expectation integer check (salary_expectation >= 0),
  source_url text,
  notes text check (char_length(notes) <= 4000),
  category text check (char_length(category) <= 60),
  contact text check (char_length(contact) <= 160),
  resume_version text check (char_length(resume_version) <= 80),
  cover_letter_version text check (char_length(cover_letter_version) <= 80),
  interview_at timestamptz,
  follow_up_at timestamptz,
  applied_at timestamptz,
  board_order integer not null default 0 check (board_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migraciones para proyectos ya existentes. La tabla de arriba no se recrea si
-- ya existe, asi que cada columna nueva necesita este paso explicito, y debe ir
-- antes de los indices que la usan.
alter table public.job_applications
  add column if not exists category text check (char_length(category) <= 60);

alter table public.job_applications
  add column if not exists contact text check (char_length(contact) <= 160);

alter table public.job_applications
  add column if not exists resume_version text check (char_length(resume_version) <= 80);

alter table public.job_applications
  add column if not exists cover_letter_version text check (char_length(cover_letter_version) <= 80);

alter table public.job_applications
  add column if not exists follow_up_at timestamptz;

-- El tablero siempre se consulta por usuario, estado y posicion.
create index if not exists job_applications_board_idx
  on public.job_applications (user_id, status, board_order);

-- El tablero se filtra por area con frecuencia.
create index if not exists job_applications_category_idx
  on public.job_applications (user_id, category)
  where category is not null;

create index if not exists job_applications_interview_idx
  on public.job_applications (user_id, interview_at)
  where interview_at is not null;

-- Los seguimientos se consultan por fecha para saber a quien toca escribir.
create index if not exists job_applications_follow_up_idx
  on public.job_applications (user_id, follow_up_at)
  where follow_up_at is not null;

-- Mantiene updated_at coherente sin depender de la capa de aplicacion.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists job_applications_touch_updated_at on public.job_applications;

create trigger job_applications_touch_updated_at
  before update on public.job_applications
  for each row
  execute function public.touch_updated_at();

-- Seguridad a nivel de fila: cada usuario solo alcanza sus propias filas.
alter table public.job_applications enable row level security;

drop policy if exists job_applications_select_own on public.job_applications;
create policy job_applications_select_own
  on public.job_applications
  for select
  using (auth.uid() = user_id);

drop policy if exists job_applications_insert_own on public.job_applications;
create policy job_applications_insert_own
  on public.job_applications
  for insert
  with check (auth.uid() = user_id);

drop policy if exists job_applications_update_own on public.job_applications;
create policy job_applications_update_own
  on public.job_applications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists job_applications_delete_own on public.job_applications;
create policy job_applications_delete_own
  on public.job_applications
  for delete
  using (auth.uid() = user_id);

-- Mural de notas adhesivas. La posicion se guarda en porcentaje del mural para
-- que una nota colocada en el telefono aparezca en el mismo sitio relativo en
-- la computadora.
create table if not exists public.sticky_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null check (char_length(trim(text)) between 1 and 280),
  color text not null default 'amarillo'
    check (color in ('amarillo', 'rosa', 'azul', 'verde', 'lila')),
  position_x numeric(5, 2) not null default 4 check (position_x between 0 and 100),
  position_y numeric(5, 2) not null default 4 check (position_y between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El mural siempre se lee completo por usuario y en orden de creacion.
create index if not exists sticky_notes_user_idx
  on public.sticky_notes (user_id, created_at);

drop trigger if exists sticky_notes_touch_updated_at on public.sticky_notes;

create trigger sticky_notes_touch_updated_at
  before update on public.sticky_notes
  for each row
  execute function public.touch_updated_at();

alter table public.sticky_notes enable row level security;

drop policy if exists sticky_notes_manage_own on public.sticky_notes;
create policy sticky_notes_manage_own
  on public.sticky_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Preferencias de interfaz sincronizadas entre dispositivos.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'light',
  icon_pack text not null default 'outline',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists user_preferences_manage_own on public.user_preferences;
create policy user_preferences_manage_own
  on public.user_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists user_preferences_touch_updated_at on public.user_preferences;

create trigger user_preferences_touch_updated_at
  before update on public.user_preferences
  for each row
  execute function public.touch_updated_at();
