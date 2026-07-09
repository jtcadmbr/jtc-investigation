
CREATE TABLE public.investigateds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'desconhecido',
  foto_url TEXT,
  fotos JSONB NOT NULL DEFAULT '[]'::jsonb,
  documentos JSONB NOT NULL DEFAULT '[]'::jsonb,
  cpf TEXT, rg TEXT,
  idade INTEGER,
  data_nascimento DATE,
  obito BOOLEAN NOT NULL DEFAULT false,
  data_obito DATE,
  nome_mae TEXT, nome_pai TEXT,
  avo_materna TEXT, avo_materno TEXT, avo_paterna TEXT, avo_paterno TEXT,
  irmaos TEXT, irmas TEXT, tios TEXT, tias TEXT,
  instagram TEXT, facebook TEXT, tiktok TEXT, twitter TEXT,
  youtube TEXT, linkedin TEXT, outras_redes TEXT,
  endereco TEXT, cidade TEXT, estado TEXT, pais TEXT DEFAULT 'Brasil',
  descricao TEXT, observacoes TEXT,
  telefone TEXT, email TEXT,
  telefones JSONB NOT NULL DEFAULT '[]'::jsonb,
  emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigateds TO authenticated;
GRANT SELECT ON public.investigateds TO anon;
GRANT ALL ON public.investigateds TO service_role;
ALTER TABLE public.investigateds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigated_id UUID NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.share_links TO authenticated;
GRANT SELECT ON public.share_links TO anon;
GRANT ALL ON public.share_links TO service_role;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access" ON public.investigateds FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read via active share link" ON public.investigateds FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.share_links sl WHERE sl.investigated_id = investigateds.id AND sl.expires_at > now()));

CREATE POLICY "Owner full access" ON public.share_links FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read active links" ON public.share_links FOR SELECT TO anon
  USING (expires_at > now());

CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigated_id UUID REFERENCES public.investigateds(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  mime TEXT,
  tamanho BIGINT,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploads TO authenticated;
GRANT ALL ON public.uploads TO service_role;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.uploads FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boards TO authenticated;
GRANT ALL ON public.boards TO service_role;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.boards FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.panel_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  investigated_id UUID NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  pos_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  pos_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panel_nodes TO authenticated;
GRANT ALL ON public.panel_nodes TO service_role;
ALTER TABLE public.panel_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.panel_nodes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  rotulo TEXT,
  cor TEXT,
  texto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.connections FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.face_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigated_id UUID NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  face_index INTEGER NOT NULL DEFAULT 0,
  embedding DOUBLE PRECISION[] NOT NULL,
  quality DOUBLE PRECISION,
  detector_score DOUBLE PRECISION,
  box_x DOUBLE PRECISION,
  box_y DOUBLE PRECISION,
  box_w DOUBLE PRECISION,
  box_h DOUBLE PRECISION,
  model_version TEXT NOT NULL,
  gender TEXT,
  gender_probability DOUBLE PRECISION,
  age DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT face_embeddings_uniq UNIQUE (investigated_id, photo_url, face_index, model_version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.face_embeddings TO authenticated;
GRANT ALL ON public.face_embeddings TO service_role;
ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.face_embeddings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_face_embedding_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT user_id INTO NEW.user_id FROM public.investigateds WHERE id = NEW.investigated_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_face_embeddings_user_id
  BEFORE INSERT ON public.face_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.set_face_embedding_user_id();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_investigateds_updated_at BEFORE UPDATE ON public.investigateds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_boards_updated_at BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
