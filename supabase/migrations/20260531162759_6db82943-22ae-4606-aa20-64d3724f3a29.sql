-- 1. Tornar bucket uploads público (URLs nunca expiram)
UPDATE storage.buckets SET public = true WHERE id = 'uploads';

-- Permitir leitura pública dos objetos
DROP POLICY IF EXISTS "uploads public read" ON storage.objects;
CREATE POLICY "uploads public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- 2. Tabela de links compartilháveis
CREATE TABLE public.share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigated_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_links_token ON public.share_links(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.share_links TO authenticated;
GRANT SELECT ON public.share_links TO anon;
GRANT ALL ON public.share_links TO service_role;

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner all" ON public.share_links
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Leitura pública por token (não expirado)
CREATE POLICY "public read by token" ON public.share_links
  FOR SELECT TO anon
  USING (expires_at > now());

-- Permitir que anon leia o investigado referenciado por um share_link válido
CREATE POLICY "public read via share" ON public.investigateds
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.investigated_id = investigateds.id
      AND sl.expires_at > now()
  ));

GRANT SELECT ON public.investigateds TO anon;