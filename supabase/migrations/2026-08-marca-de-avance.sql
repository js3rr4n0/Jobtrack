-- Marca de avance por postulacion. Guarda la etapa mas adelantada por la que
-- ha pasado cada tarjeta, para que devolverla a una columna anterior no borre
-- los puntos ya ganados. Se rellena con la etapa actual, que es lo unico que
-- consta de la historia de los tableros existentes.

alter table public.job_applications
  add column if not exists furthest_status public.application_status;

update public.job_applications
  set furthest_status = status
  where furthest_status is null;

alter table public.job_applications
  alter column furthest_status set default 'wishlist';

alter table public.job_applications
  alter column furthest_status set not null;
