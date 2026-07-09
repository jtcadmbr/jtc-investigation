-- Adiciona colunas para melhorar a precisão da busca facial
ALTER TABLE public.face_embeddings 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS gender_probability REAL,
ADD COLUMN IF NOT EXISTS age REAL;
