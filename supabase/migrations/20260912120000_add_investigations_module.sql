-- ============================================================
-- Módulo INVESTIGAÇÕES
-- Cada investigação é um caso independente e todas as suas
-- informações ficam vinculadas ao id da investigação.
-- ============================================================

-- Investigações (caso principal)
CREATE TABLE public.investigacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text NOT NULL UNIQUE,
  titulo text NOT NULL,
  descricao text,
  data_abertura date,
  status text NOT NULL DEFAULT 'em_apuracao',
  prioridade text NOT NULL DEFAULT 'media',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigacoes TO authenticated;
GRANT ALL ON public.investigacoes TO service_role;
CREATE INDEX investigacoes_user_idx ON public.investigacoes(user_id);
CREATE INDEX investigacoes_status_idx ON public.investigacoes(status);
ALTER TABLE public.investigacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.investigacoes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER investigacoes_updated_at BEFORE UPDATE ON public.investigacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Testemunhas
CREATE TABLE public.testemunhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  idade integer,
  data_relato date,
  local_estava text,
  estava_presente boolean,
  viu_pessoalmente boolean,
  ouviu_pessoalmente boolean,
  relato text,
  o_que_lembra text,
  o_que_nao_tem_certeza text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testemunhas TO authenticated;
GRANT ALL ON public.testemunhas TO service_role;
CREATE INDEX testemunhas_investigacao_idx ON public.testemunhas(investigacao_id);
ALTER TABLE public.testemunhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.testemunhas FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER testemunhas_updated_at BEFORE UPDATE ON public.testemunhas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Relatos
CREATE TABLE public.relatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  data date,
  hora text,
  autor_fonte text,
  tipo text NOT NULL DEFAULT 'informacao_nao_verificada',
  texto text NOT NULL,
  observacoes text,
  status_verificacao text NOT NULL DEFAULT 'nao_verificado',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relatos TO authenticated;
GRANT ALL ON public.relatos TO service_role;
CREATE INDEX relatos_investigacao_idx ON public.relatos(investigacao_id);
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.relatos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER relatos_updated_at BEFORE UPDATE ON public.relatos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Pessoas relacionadas (reutiliza o cadastro existente — sem duplicar)
CREATE TABLE public.investigacao_pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  investigated_id uuid NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  tipo_relacao text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (investigacao_id, investigated_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigacao_pessoas TO authenticated;
GRANT ALL ON public.investigacao_pessoas TO service_role;
CREATE INDEX investigacao_pessoas_investigacao_idx ON public.investigacao_pessoas(investigacao_id);
CREATE INDEX investigacao_pessoas_investigated_idx ON public.investigacao_pessoas(investigated_id);
ALTER TABLE public.investigacao_pessoas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.investigacao_pessoas FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Evidências
CREATE TABLE public.evidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'outros',
  data date,
  descricao text,
  origem text,
  status_verificacao text NOT NULL DEFAULT 'nao_verificado',
  mime text,
  storage_path text,
  url text,
  adicionado_por text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidencias TO authenticated;
GRANT ALL ON public.evidencias TO service_role;
CREATE INDEX evidencias_investigacao_idx ON public.evidencias(investigacao_id);
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.evidencias FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER evidencias_updated_at BEFORE UPDATE ON public.evidencias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Câmeras do local do acontecimento
CREATE TABLE public.cameras_investigacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  local text NOT NULL,
  existe_gravacao boolean NOT NULL DEFAULT false,
  data date,
  horario_aproximado text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cameras_investigacao TO authenticated;
GRANT ALL ON public.cameras_investigacao TO service_role;
CREATE INDEX cameras_investigacao_investigacao_idx ON public.cameras_investigacao(investigacao_id);
ALTER TABLE public.cameras_investigacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.cameras_investigacao FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER cameras_investigacao_updated_at BEFORE UPDATE ON public.cameras_investigacao
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Anotações internas
CREATE TABLE public.notas_investigacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  autor text,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_investigacao TO authenticated;
GRANT ALL ON public.notas_investigacao TO service_role;
CREATE INDEX notas_investigacao_investigacao_idx ON public.notas_investigacao(investigacao_id);
ALTER TABLE public.notas_investigacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.notas_investigacao FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER notas_investigacao_updated_at BEFORE UPDATE ON public.notas_investigacao
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Histórico / Linha do tempo
CREATE TABLE public.investigacao_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'edicao',
  descricao text NOT NULL,
  usuario text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigacao_historico TO authenticated;
GRANT ALL ON public.investigacao_historico TO service_role;
CREATE INDEX investigacao_historico_investigacao_idx ON public.investigacao_historico(investigacao_id);
ALTER TABLE public.investigacao_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.investigacao_historico FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.investigacoes REPLICA IDENTITY FULL;
ALTER TABLE public.testemunhas REPLICA IDENTITY FULL;
ALTER TABLE public.relatos REPLICA IDENTITY FULL;
ALTER TABLE public.investigacao_pessoas REPLICA IDENTITY FULL;
ALTER TABLE public.evidencias REPLICA IDENTITY FULL;
ALTER TABLE public.cameras_investigacao REPLICA IDENTITY FULL;
ALTER TABLE public.notas_investigacao REPLICA IDENTITY FULL;
ALTER TABLE public.investigacao_historico REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.investigacoes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.testemunhas; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.relatos; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.investigacao_pessoas; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.evidencias; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.cameras_investigacao; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notas_investigacao; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.investigacao_historico; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;