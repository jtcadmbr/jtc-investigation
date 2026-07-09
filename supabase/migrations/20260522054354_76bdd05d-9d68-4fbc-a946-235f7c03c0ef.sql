ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS cor text;

ALTER TYPE public.investigated_status ADD VALUE IF NOT EXISTS 'desaparecido';
ALTER TYPE public.investigated_status ADD VALUE IF NOT EXISTS 'sem_restricao';