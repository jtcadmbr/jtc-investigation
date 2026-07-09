Escopo grande — vou entregar em 3 blocos independentes, cada um verificável.

## Bloco 1 — App desktop Windows (.exe)

- Adiciono `electron` e `@electron/packager` como devDependencies.
- Crio `electron/main.cjs` (CommonJS, `BrowserWindow` carregando o build), `electron/preload.cjs`, e ícone `electron/icon.ico` gerado a partir da logo JTC (script `scripts/make-ico.js` já existe).
- Ajusto `vite.config.ts` com `base: './'` **somente para o build do Electron** (via env var `ELECTRON_BUILD=1`) para não quebrar a versão web servida no Cloudflare.
- Script `bun run build:electron` que faz: vite build → packager → zipa em `public/downloads/JTC-Rastreio-Windows.zip`.
- Rodo o build no sandbox, deixo o `.zip` (com o `.exe` dentro) hospedado em `/downloads/JTC-Rastreio-Windows.zip`.
- Em `Configurações` adiciono um card "Baixar aplicativo desktop" com botão de download apontando para esse asset.

Observação técnica: o sandbox compila cross-platform para Windows via `--platform=win32 --arch=x64`. O resultado é um `.exe` funcional; distribuído em `.zip` (instaladores `.msi/.exe-setup` exigiriam electron-builder + wine, que não funcionam aqui).

## Bloco 2 — Novo modelo de reconhecimento facial (ArcFace ONNX)

Troco o pipeline de embedding do `@vladmandic/face-api` (MobileNet, 128-d) para **ArcFace R100 via `onnxruntime-web`** (embedding 512-d, estado-da-arte). Mantenho o face-api **apenas para detecção + landmarks + gênero/idade**, porque isso ele já faz bem e é leve.

Arquivos:
- `public/wasm/arcface/` — modelo ONNX (`arcfaceresnet100-8.onnx`, ~250MB é grande demais; uso variante quantizada `w600k_r50.onnx` ~166MB ou `buffalo_s` ~16MB. Padrão: **buffalo_s quantizado (~16MB)** — bom trade-off, muito mais preciso que MobileNet).
- `src/lib/arcface.ts` — carrega ORT web, faz alignment 112x112 usando os 5 pontos de referência do face-api (olhos, nariz, cantos da boca), roda inferência, retorna Float32Array 512-d L2-normalizado.
- `src/lib/face.ts` — passa a chamar `arcface.embed()` no lugar do `faceRecognitionNet`. Mantém augmentation com flip. `MODEL_VERSION` sobe para `arcface-buffalo-s-v1`.
- Threshold recalibrado: mesma pessoa fica em cos-dist ~0.35 → mostrar 90-99%; dúvida 0.5-0.6 → 30-50%; diferente > 0.65 → <10%.

## Bloco 3 — UX da busca facial

- **Reindex automático**: hook `useAutoReindex()` na rota `/pesquisa` que compara `MODEL_VERSION` atual com o `model_version` das linhas em `face_descriptors` (ou tabela equivalente). Se mudou, dispara reindex em background — barra de progresso fixa no topo, sem bloquear o uso. Faz em lotes de 20 fotos.
- **Filtro por gênero (rígido)**: candidatos com `gender` diferente do rosto da query são **descartados** (não só rebaixados). Configurável: um toggle "Ignorar gênero" no formulário caso queira busca ampla. Fecha o bug do homem casando com mulher.
- **Ordenação por confiança**: resultados sempre ordenados por `similarity` desc — o mais provável fica em cima com selo "Match forte" (verde) / "Provável" (amarelo) / "Fraco" (cinza).
- **Animação de análise forense**: durante o scan, mostro um overlay animado sobre a foto com etapas sequenciais (`framer-motion`):
  1. "Detectando rosto..." — retângulo pulsando
  2. "Mapeando 68 pontos de referência..." — pontos aparecendo um a um
  3. "Analisando textura da pele..." — varredura scanline
  4. "Medindo proporção áurea..." — linhas geométricas
  5. "Extraindo assinatura ArcFace 512-d..." — grid de números correndo
  6. "Comparando com banco..." — barra de progresso
  Cada etapa dura ~400ms, dá sensação de análise ultra-precisa e é real (esses cálculos já rodam via `computeFaceMetrics`).

## Ordem de entrega

1. Bloco 3 primeiro (mais rápido, resolve o bug do gênero imediatamente).
2. Bloco 2 (modelo novo + reindex).
3. Bloco 1 (build do .exe — mais demorado por causa do packager, ~3-5 min).

## Verificação

- Bloco 1: baixar o zip, extrair, `.exe` abre janela com o app.
- Bloco 2: subir foto de teste, ver que `MODEL_VERSION` mudou e reindex rodou; distância entre mesma pessoa cai.
- Bloco 3: subir foto de homem — nenhuma mulher aparece nos resultados.

Confirma que posso seguir com esse plano? Em especial: **buffalo_s (~16MB, muito mais preciso que hoje) ou quer o modelo grande buffalo_l (~166MB, precisão máxima mas download pesado na 1ª vez)?**