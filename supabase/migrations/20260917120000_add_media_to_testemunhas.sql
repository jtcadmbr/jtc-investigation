-- ============================================================
-- Testemunhas: anexar foto e/ou vídeo da testemunha
-- Os arquivos ficam no bucket 'uploads', sob a pasta do usuário
-- (as policies existentes de storage já cobrem esse caminho).
-- ============================================================

ALTER TABLE public.testemunhas
  ADD COLUMN foto_url text,
  ADD COLUMN foto_storage_path text,
  ADD COLUMN video_url text,
  ADD COLUMN video_storage_path text;