-- 1. Remover tabelas de e-mail antigas se existirem (para limpar tudo)
DROP TABLE IF EXISTS public.smtp_configs;

-- 2. Criar tipo enum para finalidade do e-mail
DO $$ BEGIN
    CREATE TYPE public.email_purpose AS ENUM ('verification', 'recovery', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Criar tabela de configurações SMTP
CREATE TABLE public.smtp_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL,
    from_name TEXT NOT NULL,
    from_email TEXT NOT NULL,
    purpose public.email_purpose NOT NULL DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smtp_configs TO authenticated;
GRANT ALL ON public.smtp_configs TO service_role;

-- 5. RLS
ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own SMTP configs"
ON public.smtp_configs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.smtp_configs IS 'Configurações de servidor SMTP configuradas pelo usuário para diferentes finalidades (verificação, recuperação).';