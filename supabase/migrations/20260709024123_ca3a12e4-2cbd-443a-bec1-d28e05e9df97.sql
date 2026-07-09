ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS investigated_id UUID REFERENCES public.investigateds(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS uploads_investigated_id_idx ON public.uploads(investigated_id);
CREATE INDEX IF NOT EXISTS connections_from_id_idx ON public.connections(from_id);
CREATE INDEX IF NOT EXISTS connections_to_id_idx ON public.connections(to_id);