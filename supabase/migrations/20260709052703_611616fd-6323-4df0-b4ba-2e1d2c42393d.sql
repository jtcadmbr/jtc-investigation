-- Tabela de embeddings faciais (um vetor por rosto detectado em cada foto)
CREATE TABLE public.face_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investigated_id UUID NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  face_index INTEGER NOT NULL DEFAULT 0,
  embedding REAL[] NOT NULL,
  quality REAL NOT NULL DEFAULT 0,
  detector_score REAL NOT NULL DEFAULT 0,
  box_x REAL,
  box_y REAL,
  box_w REAL,
  box_h REAL,
  model_version TEXT NOT NULL DEFAULT 'vladmandic-mobilenet-v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (investigated_id, photo_url, face_index, model_version)
);

CREATE INDEX face_embeddings_person_idx ON public.face_embeddings(investigated_id);
CREATE INDEX face_embeddings_photo_idx ON public.face_embeddings(photo_url);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.face_embeddings TO authenticated;
GRANT ALL ON public.face_embeddings TO service_role;

ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read face embeddings"
  ON public.face_embeddings FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "auth insert face embeddings"
  ON public.face_embeddings FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "auth update face embeddings"
  ON public.face_embeddings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth delete face embeddings"
  ON public.face_embeddings FOR DELETE
  TO authenticated USING (true);

CREATE TRIGGER face_embeddings_updated_at
  BEFORE UPDATE ON public.face_embeddings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
