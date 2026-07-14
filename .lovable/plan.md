## Objetivo

Melhorar a leitura biométrica (rosto, olhos, boca, pele, cabelo) com uma animação de escaneamento mais rica e mostrar **um único resultado por vez** com botões "Sim, é essa pessoa" / "Não, é outra". As respostas ficam salvas e passam a **treinar** o sistema para acertos futuros.

## Escopo

### 1. Leitura biométrica ampliada (`src/lib/face.ts`)
Novo bloco `computeExtendedMetrics()` calculado a partir do mesh Human (468 pontos) e amostras de pixel:
- **Olhos**: cor média (HEX) da íris esquerda/direita, abertura ocular, distância inter-ocular.
- **Boca**: largura, espessura do lábio, cor média.
- **Sobrancelhas**: espessura estimada e cor.
- **Cabelo**: cor amostrada da faixa acima da testa (fora do rosto).
- **Pele**: já existe (mantém), adiciona tom sob os olhos.
- **Formato do rosto**: oval / redondo / quadrado / longo (via razão largura/altura + mandíbula).

Tudo local, grátis, sem IA externa.

### 2. Animação de scan aprimorada (`src/routes/face-search.tsx`)
- Overlay com linhas de varredura horizontal + retículo se movendo pelos pontos do mesh.
- Fases nomeadas com progresso: `Rosto → Olhos → Boca → Sobrancelhas → Cabelo → Pele → Comparando`.
- Cada fase pisca a região correspondente no rosto (bounding boxes coloridas por região).
- Log em tempo real com os valores calculados (cor dos olhos em HEX real, cor do cabelo, largura da boca, etc.).

### 3. Fluxo de correspondência 1-a-1 com feedback

Substitui a lista de matches por um **carrossel de decisão**:

```text
┌──────────────────────────────────┐
│  Candidato 1 / 8                 │
│  [foto]   Nome:  João Silva      │
│           Confiança: 87%         │
│  [ Sim, é essa ]  [ Não, próxima]│
└──────────────────────────────────┘
```

- Mostra o candidato de maior confiança primeiro.
- "Sim" → marca confirmado, para o carrossel, mostra ficha.
- "Não" → registra rejeição e passa ao próximo candidato.
- Também permite "Não conheço" para pular sem treinar.

### 4. Aprendizado por feedback

Nova tabela `face_feedback`:
```
id, user_id, query_embedding (vector/float[]),
matched_investigated_id, decision ('confirm'|'reject'),
distance, confidence, created_at
```
- Toda decisão do usuário grava uma linha.
- No próximo `scan()`, antes de ranquear, o sistema consulta feedbacks passados:
  - **Confirmações**: se o embedding da query estiver perto (dist < 0.35) de um embedding já confirmado para a pessoa X, aplica bônus de +8% à confiança do candidato X.
  - **Rejeições**: se estiver perto de um embedding já rejeitado para a pessoa X, aplica penalidade -12%. Se penalidade zera o score, remove o candidato.
- Feedback é **por usuário** (via RLS) — cada operador treina seu próprio ranking sem contaminar os outros.

### 5. Migração de banco
```sql
CREATE TABLE public.face_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investigated_id uuid NOT NULL REFERENCES public.investigateds(id) ON DELETE CASCADE,
  query_embedding double precision[] NOT NULL,
  decision text NOT NULL CHECK (decision IN ('confirm','reject')),
  distance double precision NOT NULL,
  confidence double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.face_feedback TO authenticated;
GRANT ALL ON public.face_feedback TO service_role;
ALTER TABLE public.face_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback" ON public.face_feedback
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX ON public.face_feedback (user_id, investigated_id);
```

## Arquivos afetados
- `src/lib/face.ts` — métricas estendidas (olhos, boca, cabelo, sobrancelhas, formato).
- `src/routes/face-search.tsx` — animação, carrossel de decisão, aplicação do feedback.
- `src/components/FaceScanOverlay.tsx` **(novo)** — overlay visual do scan.
- Migração SQL — tabela `face_feedback`.

## Fora de escopo
- Retreino de modelo neural (o modelo continua o Human/MobileFaceNet). O "aprendizado" é reranking por feedback, 100% local + Cloud, sem IA paga.
- Mudanças na indexação existente (mantém compatível).
