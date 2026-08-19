-- Adjuntos por vacante. Para bases que ya tienen la tabla de archivos creada:
-- el esquema completo tambien lo incluye y puede volver a ejecutarse entero,
-- pero este trozo basta y no toca nada mas.

alter table public.documents
  add column if not exists application_id uuid
  references public.job_applications (id) on delete cascade;

alter table public.documents drop constraint if exists documents_kind_check;
alter table public.documents
  add constraint documents_kind_check
  check (kind in ('resume', 'cover-letter', 'note-image', 'attachment'));

create index if not exists documents_application_idx
  on public.documents (application_id, created_at desc);
