-- ============================================================
-- Testemunhas: campos tri-estado (Sim/Não/Não informado)
-- O formulário permite "Não informado" (null). As colunas foram
-- criadas inicialmente como NOT NULL pela migração drizzle; a
-- migração original do módulo já previa elas anuláveis.
-- Revertemos para anulável mantendo o DEFAULT false existente.
-- ============================================================

ALTER TABLE public.testemunhas
  ALTER COLUMN estava_presente DROP NOT NULL,
  ALTER COLUMN viu_pessoalmente DROP NOT NULL,
  ALTER COLUMN ouviu_pessoalmente DROP NOT NULL;