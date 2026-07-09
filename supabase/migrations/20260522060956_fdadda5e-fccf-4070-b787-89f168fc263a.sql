ALTER TABLE public.investigateds
  ADD COLUMN IF NOT EXISTS telefones jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS emails jsonb DEFAULT '[]'::jsonb;