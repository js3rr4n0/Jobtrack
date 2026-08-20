-- Enlace de la videollamada de la entrevista. Es un dato distinto del enlace
-- de la vacante: uno lleva al anuncio y otro a la sala donde hay que estar a
-- una hora concreta.

alter table public.job_applications
  add column if not exists meeting_url text;
