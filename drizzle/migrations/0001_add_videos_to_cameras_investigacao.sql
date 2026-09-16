ALTER TABLE public.cameras_investigacao
  ADD COLUMN IF NOT EXISTS videos jsonb NOT NULL DEFAULT '[]'::jsonb;