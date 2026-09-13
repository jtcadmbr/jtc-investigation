CREATE TABLE public.investigacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  numero text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  observacoes text,
  status text NOT NULL DEFAULT 'em_apuracao',
  prioridade text NOT NULL DEFAULT 'media',
  data_abertura date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, numero)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigacoes TO authenticated;
GRANT ALL ON public.investigacoes TO service_role;
ALTER TABLE public.investigacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.investigacoes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX investigacoes_user_id_idx ON public.investigacoes (user_id);

CREATE TABLE public.investigacao_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'nota',
  descricao text,
  usuario text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigacao_historico TO authenticated;
GRANT ALL ON public.investigacao_historico TO service_role;
ALTER TABLE public.investigacao_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.investigacao_historico FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX investigacao_historico_inv_idx ON public.investigacao_historico (investigacao_id);

CREATE TABLE public.investigacao_pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  investigated_id uuid NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  tipo_relacao text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (investigacao_id, investigated_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigacao_pessoas TO authenticated;
GRANT ALL ON public.investigacao_pessoas TO service_role;
ALTER TABLE public.investigacao_pessoas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.investigacao_pessoas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX investigacao_pessoas_inv_idx ON public.investigacao_pessoas (investigacao_id);

CREATE TABLE public.testemunhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  idade integer,
  data_relato date,
  local_estava text,
  relato text,
  o_que_lembra text,
  o_que_nao_tem_certeza text,
  observacoes text,
  viu_pessoalmente boolean NOT NULL DEFAULT false,
  ouviu_pessoalmente boolean NOT NULL DEFAULT false,
  estava_presente boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testemunhas TO authenticated;
GRANT ALL ON public.testemunhas TO service_role;
ALTER TABLE public.testemunhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.testemunhas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX testemunhas_inv_idx ON public.testemunhas (investigacao_id);

CREATE TABLE public.relatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'informacao_nao_verificada',
  status_verificacao text NOT NULL DEFAULT 'nao_verificado',
  texto text NOT NULL,
  autor_fonte text,
  data date,
  hora text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relatos TO authenticated;
GRANT ALL ON public.relatos TO service_role;
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.relatos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX relatos_inv_idx ON public.relatos (investigacao_id);

CREATE TABLE public.evidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'outros',
  descricao text,
  origem text,
  status_verificacao text NOT NULL DEFAULT 'nao_verificado',
  data date,
  url text,
  storage_path text,
  mime text,
  adicionado_por text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidencias TO authenticated;
GRANT ALL ON public.evidencias TO service_role;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.evidencias FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX evidencias_inv_idx ON public.evidencias (investigacao_id);

CREATE TABLE public.cameras_investigacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  local text NOT NULL,
  observacoes text,
  horario_aproximado text,
  data date,
  existe_gravacao boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cameras_investigacao TO authenticated;
GRANT ALL ON public.cameras_investigacao TO service_role;
ALTER TABLE public.cameras_investigacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.cameras_investigacao FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX cameras_investigacao_inv_idx ON public.cameras_investigacao (investigacao_id);

CREATE TABLE public.notas_investigacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  investigacao_id uuid NOT NULL REFERENCES public.investigacoes(id) ON DELETE CASCADE,
  texto text NOT NULL,
  autor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_investigacao TO authenticated;
GRANT ALL ON public.notas_investigacao TO service_role;
ALTER TABLE public.notas_investigacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON public.notas_investigacao FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX notas_investigacao_inv_idx ON public.notas_investigacao (investigacao_id);

CREATE TRIGGER set_investigacoes_updated_at BEFORE UPDATE ON public.investigacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_testemunhas_updated_at BEFORE UPDATE ON public.testemunhas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_notas_updated_at BEFORE UPDATE ON public.notas_investigacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();