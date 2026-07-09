import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { r as rt, z as zD, D as Dk, M as Ma, f as fg } from "../_libs/vladmandic__face-api.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { n as Database, R as RefreshCw, g as ScanFace, X, U as Upload, o as Award, p as Activity, q as ShieldAlert, l as Eye, r as CircleAlert, C as Check } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./router-CzwYCBSY.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const MODEL_URL = "https://vladmandic.github.io/face-api/model";
const MODEL_VERSION = "vladmandic-mobilenet-v1-aug3-gender";
let loadingPromise = null;
function loadFaceModels() {
  if (!loadingPromise) {
    loadingPromise = (async () => {
      await Promise.all([
        rt.ssdMobilenetv1.loadFromUri(MODEL_URL),
        rt.tinyFaceDetector.loadFromUri(MODEL_URL),
        rt.faceLandmark68Net.loadFromUri(MODEL_URL),
        rt.faceRecognitionNet.loadFromUri(MODEL_URL),
        rt.ageGenderNet.loadFromUri(MODEL_URL)
      ]);
    })();
  }
  return loadingPromise;
}
async function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function qualityLabel(q) {
  if (q >= 0.62) return "boa";
  if (q >= 0.38) return "média";
  return "baixa";
}
async function prepareCanvas(img, enhanced = false) {
  const MAX = 1600;
  const MIN = 800;
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const longest = Math.max(w, h);
  let scale = 1;
  if (longest > MAX) scale = MAX / longest;
  else if (longest < MIN) scale = MIN / longest;
  w = Math.round(w * scale);
  h = Math.round(h * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  if (enhanced) ctx.filter = "contrast(1.15) brightness(1.05) saturate(0.95)";
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}
function computeFaceMetrics(landmarks, canvas, box) {
  const positions = landmarks.positions;
  const noseBridgeX = (positions[27].x + positions[28].x + positions[29].x + positions[30].x) / 4;
  const pairs = [
    [17, 26],
    // Sobrancelha externa
    [21, 22],
    // Sobrancelha interna
    [36, 45],
    // Canto externo dos olhos
    [39, 42],
    // Canto interno dos olhos
    [31, 35],
    // Laterais do nariz
    [48, 54]
    // Cantos da boca
  ];
  let totalDiff = 0;
  let count = 0;
  for (const [lIdx, rIdx] of pairs) {
    const leftDist = Math.abs(positions[lIdx].x - noseBridgeX);
    const rightDist = Math.abs(positions[rIdx].x - noseBridgeX);
    const avgDist = (leftDist + rightDist) / 2;
    if (avgDist > 0) {
      totalDiff += Math.abs(leftDist - rightDist) / avgDist;
      count++;
    }
  }
  const symmetry = Math.max(0, Math.min(100, Math.round((1 - totalDiff / (count || 1)) * 100)));
  const faceHeight = Math.hypot(positions[27].x - positions[8].x, positions[27].y - positions[8].y);
  const faceWidth = Math.hypot(positions[0].x - positions[16].x, positions[0].y - positions[16].y);
  const ratio = faceHeight / (faceWidth || 1);
  const goldenRatio = 1.618;
  const deviation = Math.abs(ratio - goldenRatio) / goldenRatio;
  const goldenRatioDev = Math.max(0, Math.min(100, Math.round((1 - deviation) * 100)));
  const leftEyeX = (positions[36].x + positions[39].x) / 2;
  const leftEyeY = (positions[36].y + positions[39].y) / 2;
  const rightEyeX = (positions[42].x + positions[45].x) / 2;
  const rightEyeY = (positions[42].y + positions[45].y) / 2;
  const interocularDist = Math.round(Math.hypot(leftEyeX - rightEyeX, leftEyeY - rightEyeY));
  const noseWidth = Math.round(Math.hypot(positions[31].x - positions[35].x, positions[31].y - positions[35].y));
  const mouthWidth = Math.round(Math.hypot(positions[48].x - positions[54].x, positions[48].y - positions[54].y));
  const jawWidth = Math.round(Math.hypot(positions[4].x - positions[12].x, positions[4].y - positions[12].y));
  let skinSmoothness = 88;
  let skinToneHex = "#C8A080";
  try {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const sampleX1 = Math.round((positions[31].x + positions[3].x) / 2);
      const sampleY1 = Math.round((positions[31].y + positions[29].y) / 2);
      const sampleX2 = Math.round((positions[35].x + positions[13].x) / 2);
      const sampleY2 = Math.round((positions[35].y + positions[29].y) / 2);
      const sampleSize = Math.max(4, Math.round(box.width * 0.07));
      const pixels1 = ctx.getImageData(
        Math.max(0, Math.min(canvas.width - sampleSize, sampleX1 - sampleSize / 2)),
        Math.max(0, Math.min(canvas.height - sampleSize, sampleY1 - sampleSize / 2)),
        sampleSize,
        sampleSize
      ).data;
      const pixels2 = ctx.getImageData(
        Math.max(0, Math.min(canvas.width - sampleSize, sampleX2 - sampleSize / 2)),
        Math.max(0, Math.min(canvas.height - sampleSize, sampleY2 - sampleSize / 2)),
        sampleSize,
        sampleSize
      ).data;
      let rSum = 0, gSum = 0, bSum = 0, countPixels = 0;
      const brightnessValues = [];
      const processData = (data) => {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          rSum += r;
          gSum += g;
          bSum += b;
          countPixels++;
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          brightnessValues.push(brightness);
        }
      };
      processData(pixels1);
      processData(pixels2);
      if (countPixels > 0) {
        const avgR = Math.round(rSum / countPixels);
        const avgG = Math.round(gSum / countPixels);
        const avgB = Math.round(bSum / countPixels);
        const toHex = (c) => {
          const hex = c.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };
        skinToneHex = `#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`.toUpperCase();
        const avgBrightness = brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;
        const variance = brightnessValues.reduce((a, b) => a + Math.pow(b - avgBrightness, 2), 0) / brightnessValues.length;
        const stdDev = Math.sqrt(variance);
        skinSmoothness = Math.max(0, Math.min(100, Math.round(100 - stdDev * 2.3)));
      }
    }
  } catch (err) {
    console.error("Erro ao analisar textura/tom de pele:", err);
  }
  return {
    symmetry,
    skinSmoothness,
    skinToneHex,
    goldenRatioDev,
    forensicFeatures: {
      interocularDist,
      noseWidth,
      mouthWidth,
      jawWidth
    }
  };
}
function analyze(result, canvas, img) {
  const box = result.detection.box;
  const faceSize = Math.min(box.width, box.height);
  const short = Math.min(canvas.width, canvas.height);
  const touchesEdge = box.x < 4 || box.y < 4 || box.right > canvas.width - 4 || box.bottom > canvas.height - 4;
  const sq = clamp01((result.detection.score - 0.28) / 0.62);
  const sz = clamp01((faceSize - 78) / 190);
  const rq = clamp01((faceSize / short - 0.08) / 0.24);
  const edge = touchesEdge ? 0.12 : 0;
  const quality = clamp01(sq * 0.5 + sz * 0.32 + rq * 0.18 - edge);
  const notes = [];
  if (faceSize < 95) notes.push("rosto pequeno");
  if (result.detection.score < 0.42) notes.push("detecção fraca");
  if (touchesEdge) notes.push("rosto cortado");
  const metrics = result.landmarks ? computeFaceMetrics(result.landmarks, canvas, box) : void 0;
  return {
    descriptor: result.descriptor,
    score: result.detection.score,
    quality,
    qualityLabel: qualityLabel(quality),
    box: { x: box.x, y: box.y, width: box.width, height: box.height },
    center: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    canvasSize: { width: canvas.width, height: canvas.height },
    imageSize: { width: img.naturalWidth, height: img.naturalHeight },
    notes,
    gender: result.gender,
    genderProbability: result.genderProbability,
    age: result.age,
    metrics
  };
}
async function detectOn(canvas, img) {
  for (const minConfidence of [0.35, 0.22]) {
    try {
      const res = await Dk(canvas, new Ma({ minConfidence })).withFaceLandmarks().withFaceDescriptors().withAgeAndGender();
      if (res.length) return res.map((r) => analyze(r, canvas, img));
    } catch {
    }
  }
  for (const inputSize of [608, 512, 416, 320]) {
    try {
      const res = await Dk(
        canvas,
        new fg({ inputSize, scoreThreshold: 0.15 })
      ).withFaceLandmarks().withFaceDescriptors().withAgeAndGender();
      if (res.length) return res.map((r) => analyze(r, canvas, img));
    } catch {
    }
  }
  return [];
}
function dedupe(list) {
  const sorted = [...list].sort((a, b) => b.quality - a.quality || b.score - a.score);
  const kept = [];
  for (const c of sorted) {
    const dup = kept.some((k) => zD(k.descriptor, c.descriptor) < 0.08);
    if (!dup) kept.push(c);
  }
  return kept;
}
function l2normalize(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  s = Math.sqrt(s);
  if (s <= 0) return v;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / s;
  return out;
}
async function augmentWithFlip(canvas, img, list) {
  if (!list.length) return list;
  const flipped = document.createElement("canvas");
  flipped.width = canvas.width;
  flipped.height = canvas.height;
  const fctx = flipped.getContext("2d");
  fctx.translate(canvas.width, 0);
  fctx.scale(-1, 1);
  fctx.drawImage(canvas, 0, 0);
  let flippedList = [];
  try {
    flippedList = await detectOn(flipped, img);
  } catch {
    return list;
  }
  if (!flippedList.length) return list;
  for (const c of list) {
    const mirroredX = canvas.width - c.center.x;
    const tolerance = Math.max(c.box.width, c.box.height) * 0.35;
    let best = null;
    let bestDist = Infinity;
    for (const f of flippedList) {
      const d = Math.hypot(f.center.x - mirroredX, f.center.y - c.center.y);
      if (d < bestDist && d < tolerance) {
        bestDist = d;
        best = f;
      }
    }
    if (!best) continue;
    const avg = new Float32Array(c.descriptor.length);
    for (let i = 0; i < avg.length; i++) avg[i] = (c.descriptor[i] + best.descriptor[i]) / 2;
    c.descriptor = l2normalize(avg);
  }
  return list;
}
async function getFaceCandidates(url) {
  try {
    const img = await loadImage(url);
    const normal = await prepareCanvas(img);
    let list = await detectOn(normal, img);
    let usedCanvas = normal;
    if (!list.length) {
      const enh = await prepareCanvas(img, true);
      list = await detectOn(enh, img);
      usedCanvas = enh;
    }
    if (list.length) list = await augmentWithFlip(usedCanvas, img, list);
    return dedupe(list);
  } catch {
    return [];
  }
}
function distance(a, b) {
  const A = a instanceof Float32Array ? a : Float32Array.from(a);
  const B = b instanceof Float32Array ? b : Float32Array.from(b);
  return zD(A, B);
}
function similarity(dist) {
  if (dist <= 0.18) return 1;
  if (dist >= 0.9) return 0;
  const x = (dist - 0.18) / 0.72;
  const s = 1 - Math.pow(x, 1.55);
  return Math.max(0, Math.min(1, s));
}
function toArray(f) {
  return Array.from(f);
}
function FaceSelector({ imageUrl, onPick }) {
  const [candidates, setCandidates] = reactExports.useState(null);
  const [picked, setPicked] = reactExports.useState(-1);
  const [scanning, setScanning] = reactExports.useState(true);
  const imgRef = reactExports.useRef(null);
  const [rendered, setRendered] = reactExports.useState({ w: 0, h: 0 });
  reactExports.useEffect(() => {
    let cancel = false;
    setScanning(true);
    setCandidates(null);
    setPicked(-1);
    loadFaceModels().then(() => getFaceCandidates(imageUrl)).then((list) => {
      if (cancel) return;
      setCandidates(list);
      if (list.length === 1) {
        setPicked(0);
        onPick(list[0]);
      } else {
        onPick(null);
      }
    }).finally(() => !cancel && setScanning(false));
    return () => {
      cancel = true;
    };
  }, [imageUrl]);
  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    setRendered({ w: el.clientWidth, h: el.clientHeight });
  };
  reactExports.useEffect(() => {
    const onResize = () => onImgLoad();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block max-w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          ref: imgRef,
          src: imageUrl,
          alt: "query",
          onLoad: onImgLoad,
          className: "max-h-[420px] w-auto max-w-full rounded-xl border-2 border-primary/40 block"
        }
      ),
      candidates && candidates.length > 0 && rendered.w > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none", children: candidates.map((c, i) => {
        const scaleX = rendered.w / c.canvasSize.width;
        const scaleY = rendered.h / c.canvasSize.height;
        const cx = c.center.x * scaleX;
        const cy = c.center.y * scaleY;
        const bx = c.box.x * scaleX;
        const by = c.box.y * scaleY;
        const bw = c.box.width * scaleX;
        const bh = c.box.height * scaleY;
        const active = picked === i;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: active ? 1 : 0.75 },
              className: `absolute border-2 rounded-md pointer-events-none ${active ? "border-primary shadow-[0_0_20px_var(--primary)]" : "border-primary/40"}`,
              style: { left: bx, top: by, width: bw, height: bh }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              type: "button",
              onClick: () => {
                setPicked(i);
                onPick(c);
              },
              initial: { scale: 0 },
              animate: { scale: 1 },
              whileHover: { scale: 1.15 },
              className: `absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${active ? "bg-primary text-primary-foreground border-primary shadow-[0_0_18px_var(--primary)] h-8 w-8" : "bg-background/90 backdrop-blur-sm text-primary border-primary/70 h-7 w-7 hover:h-8 hover:w-8"}`,
              style: { left: cx, top: cy },
              title: `Rosto ${i + 1} · qualidade ${c.qualityLabel}`,
              children: active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16 }) : i + 1
            }
          )
        ] }, i);
      }) })
    ] }),
    scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" }),
      "Procurando rostos na foto..."
    ] }),
    !scanning && candidates && candidates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14 }),
      " Nenhum rosto detectado. Tente outra foto."
    ] }),
    !scanning && candidates && candidates.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
      candidates.length,
      " rostos encontrados — clique na bolinha do rosto que deseja buscar.",
      picked >= 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-primary font-semibold", children: [
        "Rosto ",
        picked + 1,
        " selecionado · qualidade ",
        candidates[picked].qualityLabel
      ] })
    ] }),
    !scanning && candidates && candidates.length === 1 && picked === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-primary", children: [
      "1 rosto detectado · qualidade ",
      candidates[0].qualityLabel
    ] })
  ] });
}
function rank(dist, qq, tq) {
  const sim = similarity(dist);
  const quality = Math.min(qq, tq);
  const qualityBonus = Math.max(0, quality - 0.3) * 0.08;
  const confidence = Math.max(0, Math.min(1, sim + qualityBonus * (1 - sim)));
  return {
    sim,
    quality,
    confidence
  };
}
function Page() {
  const [modelsReady, setModelsReady] = reactExports.useState(false);
  const [loadingModels, setLoadingModels] = reactExports.useState(true);
  const [queryUrl, setQueryUrl] = reactExports.useState(null);
  const [queryFace, setQueryFace] = reactExports.useState(null);
  const [scanning, setScanning] = reactExports.useState(false);
  const [matches, setMatches] = reactExports.useState(null);
  const [threshold, setThreshold] = reactExports.useState(0.58);
  const [indexStats, setIndexStats] = reactExports.useState(null);
  const [indexing, setIndexing] = reactExports.useState(false);
  const [indexProgress, setIndexProgress] = reactExports.useState({
    done: 0,
    total: 0
  });
  const [scanProgress, setScanProgress] = reactExports.useState(0);
  const [scanPhase, setScanPhase] = reactExports.useState("none");
  const [scanLogs, setScanLogs] = reactExports.useState([]);
  const [activeFaceMetrics, setActiveFaceMetrics] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    loadFaceModels().then(() => setModelsReady(true)).catch(() => toast.error("Falha ao carregar modelos biométricos")).finally(() => setLoadingModels(false));
    refreshStats();
  }, []);
  reactExports.useEffect(() => {
    if (!indexStats || !modelsReady || indexing) return;
    if (indexStats.total > 0 && indexStats.indexed < indexStats.total) {
      toast.info(`Indexação automática iniciada para ${indexStats.total - indexStats.indexed} foto(s)...`, {
        id: "auto-reindex",
        duration: 4e3
      });
      reindexAll();
    }
  }, [indexStats?.indexed, indexStats?.total, modelsReady]);
  async function refreshStats() {
    try {
      const [{
        count: total
      }, {
        count: indexed
      }] = await Promise.all([supabase.from("investigateds").select("id", {
        count: "exact",
        head: true
      }).not("foto_url", "is", null), supabase.from("face_embeddings").select("investigated_id", {
        count: "exact",
        head: true
      }).eq("model_version", MODEL_VERSION)]);
      setIndexStats({
        indexed: indexed ?? 0,
        total: total ?? 0
      });
    } catch {
    }
  }
  const onFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Selecione uma imagem");
    const r = new FileReader();
    r.onload = () => {
      setQueryUrl(r.result);
      setQueryFace(null);
      setMatches(null);
      setScanProgress(0);
      setScanPhase("none");
      setScanLogs([]);
      setActiveFaceMetrics(null);
    };
    r.readAsDataURL(f);
  };
  async function ensurePhotoIndexed(personId, url) {
    const {
      data: existing
    } = await supabase.from("face_embeddings").select("*").eq("investigated_id", personId).eq("photo_url", url).eq("model_version", MODEL_VERSION);
    if (existing && existing.length) return existing;
    const candidates = await getFaceCandidates(url);
    if (!candidates.length) return [];
    const rows = candidates.map((c, i) => ({
      investigated_id: personId,
      photo_url: url,
      face_index: i,
      embedding: toArray(c.descriptor),
      quality: c.quality,
      detector_score: c.score,
      box_x: c.box.x,
      box_y: c.box.y,
      box_w: c.box.width,
      box_h: c.box.height,
      model_version: MODEL_VERSION,
      gender: c.gender || null,
      gender_probability: c.genderProbability || null,
      age: c.age || null
    }));
    try {
      const {
        data: inserted,
        error
      } = await supabase.from("face_embeddings").upsert(rows, {
        onConflict: "investigated_id,photo_url,face_index,model_version"
      }).select("*");
      if (error) throw error;
      return inserted || [];
    } catch (err) {
      console.warn("Falha ao salvar colunas de gênero/idade (podem não existir no BD remoto ainda). Fallback ativo.", err);
      const fallbackRows = rows.map(({
        gender,
        gender_probability,
        age,
        ...rest
      }) => rest);
      const {
        data: inserted,
        error
      } = await supabase.from("face_embeddings").upsert(fallbackRows, {
        onConflict: "investigated_id,photo_url,face_index,model_version"
      }).select("*");
      if (error) throw error;
      return inserted || [];
    }
  }
  async function reindexAll() {
    if (!modelsReady) return;
    setIndexing(true);
    try {
      const {
        data: people,
        error
      } = await supabase.from("investigateds").select("id,foto_url,fotos");
      if (error) throw error;
      const jobs = [];
      for (const p of people || []) {
        if (p.foto_url) jobs.push({
          personId: p.id,
          url: p.foto_url
        });
        const extras = Array.isArray(p.fotos) ? p.fotos : [];
        for (const u of extras) if (typeof u === "string") jobs.push({
          personId: p.id,
          url: u
        });
      }
      setIndexProgress({
        done: 0,
        total: jobs.length
      });
      let ok = 0;
      for (let i = 0; i < jobs.length; i += 2) {
        const batch = jobs.slice(i, i + 2);
        await Promise.all(batch.map(async (j) => {
          try {
            const rows = await ensurePhotoIndexed(j.personId, j.url);
            if (rows.length) ok++;
          } catch {
          }
        }));
        setIndexProgress({
          done: Math.min(i + 2, jobs.length),
          total: jobs.length
        });
      }
      toast.success(`Indexação automática concluída: ${ok}/${jobs.length} fotos processadas`);
      refreshStats();
    } catch (e) {
      toast.error(e.message || "Falha na indexação");
    } finally {
      setIndexing(false);
    }
  }
  async function scan() {
    if (!queryUrl || !modelsReady || !queryFace) return;
    setScanning(true);
    setMatches(null);
    setScanProgress(5);
    setScanPhase("landmarks");
    setScanLogs(["[SISTEMA] Iniciando varredura biométrica facial...", "[OK] Carregando imagem de entrada..."]);
    setActiveFaceMetrics(queryFace.metrics || null);
    try {
      const {
        data: rows,
        error
      } = await supabase.from("face_embeddings").select("id,investigated_id,photo_url,face_index,embedding,quality,gender,gender_probability,age").eq("model_version", MODEL_VERSION);
      if (error) throw error;
      const {
        data: peopleData
      } = await supabase.from("investigateds").select("id,nome,status,foto_url,fotos");
      const peopleById = /* @__PURE__ */ new Map();
      for (const p of peopleData || []) peopleById.set(p.id, p);
      const indexedUrls = new Set((rows || []).map((r) => r.investigated_id + "|" + r.photo_url));
      const pending = [];
      for (const p of peopleData || []) {
        const urls = [p.foto_url, ...Array.isArray(p.fotos) ? p.fotos : []].filter((u) => typeof u === "string" && !!u);
        for (const u of urls) {
          if (!indexedUrls.has(p.id + "|" + u)) pending.push({
            personId: p.id,
            url: u
          });
        }
      }
      const allRows = rows || [];
      if (pending.length) {
        setScanLogs((prev) => [...prev, `[SISTEMA] Indexando ${pending.length} novas imagens pendentes no banco...`]);
        for (let i = 0; i < pending.length; i += 3) {
          const batch = pending.slice(i, i + 3);
          const results2 = await Promise.all(batch.map((j) => ensurePhotoIndexed(j.personId, j.url).catch(() => [])));
          for (const r of results2) allRows.push(...r);
        }
      }
      const results = [];
      for (const r of allRows) {
        const person = peopleById.get(r.investigated_id);
        if (!person) continue;
        let genderCompatible = true;
        if (queryFace.gender && r.gender && queryFace.genderProbability && r.gender_probability) {
          if (queryFace.genderProbability > 0.8 && r.gender_probability > 0.8) {
            if (queryFace.gender !== r.gender) {
              genderCompatible = false;
            }
          }
        }
        if (!genderCompatible) continue;
        const d = distance(queryFace.descriptor, r.embedding);
        const {
          sim,
          quality,
          confidence
        } = rank(d, queryFace.quality, r.quality);
        results.push({
          person,
          matchedUrl: r.photo_url,
          dist: d,
          sim,
          quality,
          confidence,
          gender: r.gender,
          age: r.age
        });
      }
      const best = /* @__PURE__ */ new Map();
      for (const m of results) {
        const cur = best.get(m.person.id);
        if (!cur || m.confidence > cur.confidence || m.confidence === cur.confidence && m.dist < cur.dist) {
          best.set(m.person.id, m);
        }
      }
      const sorted = Array.from(best.values()).sort((a, b) => b.confidence - a.confidence || a.dist - b.dist);
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      await sleep(500);
      setScanProgress(25);
      setScanPhase("symmetry");
      setScanLogs((prev) => [...prev, "[OK] 68 marcos faciais geolocalizados com alta definição", "[INFO] Analisando proporções ósseas e desvio simétrico..."]);
      await sleep(500);
      setScanProgress(50);
      setScanPhase("skin");
      setScanLogs((prev) => [...prev, `[OK] Simetria calculada: ${queryFace.metrics?.symmetry}% (Desvio: ${100 - (queryFace.metrics?.symmetry || 100)}%)`, `[OK] Harmonia da Proporção Áurea: ${queryFace.metrics?.goldenRatioDev}%`, "[INFO] Analisando textura, derme e tom de pele nas bochechas..."]);
      await sleep(500);
      setScanProgress(75);
      setScanPhase("demographics");
      setScanLogs((prev) => [...prev, `[OK] Suavidade facial estimada: ${queryFace.metrics?.skinSmoothness}%`, `[OK] Tom de pele extraído (HEX): ${queryFace.metrics?.skinToneHex}`, "[INFO] Classificando características forenses adicionais..."]);
      await sleep(500);
      setScanProgress(90);
      setScanPhase("matching");
      const genderLabel = queryFace.gender === "male" ? "MASCULINO" : queryFace.gender === "female" ? "FEMININO" : "N/D";
      setScanLogs((prev) => [...prev, `[OK] Gênero biológico estimado: ${genderLabel} (${((queryFace.genderProbability || 0) * 100).toFixed(0)}%)`, `[OK] Faixa etária provável: ~${queryFace.age?.toFixed(0)} anos`, `[SISTEMA] Comparando com ${allRows.length} perfis biométricos no banco...`]);
      await sleep(500);
      setScanProgress(100);
      setScanPhase("done");
      setScanLogs((prev) => [...prev, "[OK] Cruzamento de dados finalizado!", "[SISTEMA] Atualizando interface..."]);
      await sleep(200);
      setMatches(sorted);
      refreshStats();
    } catch (e) {
      toast.error(e.message || "Erro na busca");
    } finally {
      setScanning(false);
    }
  }
  const filtered = reactExports.useMemo(() => matches?.filter((m) => m.dist <= threshold) ?? [], [matches, threshold]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Busca por Face", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "rounded-2xl border border-primary/20 bg-card p-4 flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "text-primary", size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Índice facial automático" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: indexStats ? `${indexStats.indexed} vetor(es) armazenado(s) · ${indexStats.total} pessoa(s) com foto` : "Carregando estatísticas..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: reindexAll, disabled: indexing || !modelsReady, className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50 text-sm transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14, className: indexing ? "animate-spin" : "" }),
        indexing ? `Indexando ${indexProgress.done}/${indexProgress.total}...` : "Re-indexar banco manual"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "rounded-2xl border border-primary/30 bg-card p-5 glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanFace, { className: "text-primary", size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg", children: "Reconhecimento Facial de Alta Precisão" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Envie uma foto. O sistema extrairá métricas biométricas e características da pele, comparando-as com o banco de dados. Processamento local de alta performance com inteligência artificial." })
        ] })
      ] }),
      loadingModels && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-2 mb-3 bg-primary/5 p-3 rounded-lg border border-primary/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" }),
        "Carregando rede neural e estimadores de gênero/idade (~9MB)..."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_280px] gap-6 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          queryUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FaceSelector, { imageUrl: queryUrl, onPick: setQueryFace }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setQueryUrl(null);
              setQueryFace(null);
              setMatches(null);
              setScanProgress(0);
              setScanPhase("none");
              setActiveFaceMetrics(null);
            }, className: "absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center z-10 transition hover:bg-destructive/90", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileRef.current?.click(), className: "w-full aspect-video rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 28 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Enviar foto para análise" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => onFile(e.target.files?.[0] ?? null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { children: [
                "Sensibilidade (",
                threshold.toFixed(2),
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-bold", children: "Recomendado: 0.58" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0.35, max: 0.8, step: 0.01, value: threshold, onChange: (e) => setThreshold(parseFloat(e.target.value)), className: "w-full accent-[oklch(0.65_0.22_250)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mais rígido (preciso)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mais permissivo" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: scan, disabled: !queryFace || !modelsReady || scanning, className: "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold glow disabled:opacity-50 disabled:cursor-not-allowed transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScanFace, { size: 18 }),
            scanning ? "Analisando derme..." : queryFace ? "Iniciar Busca Forense" : "Selecione um rosto"
          ] }),
          queryFace && !scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Qualidade da Captura:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-primary uppercase", children: queryFace.qualityLabel })
            ] }),
            queryFace.gender && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Gênero Estimado:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                queryFace.gender === "male" ? "Masculino" : "Feminino",
                " (",
                ((queryFace.genderProbability || 0) * 100).toFixed(0),
                "%)"
              ] })
            ] }),
            queryFace.age && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Idade Forense:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "~",
                queryFace.age.toFixed(0),
                " anos"
              ] })
            ] }),
            queryFace.notes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-destructive", children: [
              "Aviso: ",
              queryFace.notes.join(", ")
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      height: 0
    }, animate: {
      opacity: 1,
      height: "auto"
    }, exit: {
      opacity: 0,
      height: 0
    }, className: "rounded-2xl border border-primary/30 bg-card/40 p-5 glow grid md:grid-cols-[280px_1fr] gap-6 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square md:aspect-auto md:h-[260px] rounded-xl overflow-hidden border border-primary/30 bg-black flex items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: queryUrl, alt: "Escaneando...", className: "h-full w-full object-cover opacity-70" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_oklch(0.65_0.22_250)]", animate: {
          top: ["0%", "98%", "0%"]
        }, transition: {
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-radial-gradient from-transparent to-black/60 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2.5 left-2.5 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded border border-primary/30 text-[9px] font-mono text-primary uppercase tracking-widest animate-pulse", children: "Biometria Ativa" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs font-mono font-bold text-primary mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mapeamento Crânio-Facial" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              scanProgress,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 bg-input rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full bg-primary", animate: {
            width: `${scanProgress}%`
          }, transition: {
            ease: "easeInOut"
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono", children: "Simetria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-base font-bold font-mono text-primary mt-0.5", children: scanProgress >= 25 && activeFaceMetrics ? `${activeFaceMetrics.symmetry}%` : "Calculando..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono", children: "Suavidade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-base font-bold font-mono text-primary mt-0.5", children: scanProgress >= 50 && activeFaceMetrics ? `${activeFaceMetrics.skinSmoothness}%` : "Calculando..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono", children: "Tom da Pele" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-1.5 mt-1", children: scanProgress >= 50 && activeFaceMetrics ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3 rounded-full border border-primary/20 shadow-sm", style: {
                backgroundColor: activeFaceMetrics.skinToneHex
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono font-bold text-primary", children: activeFaceMetrics.skinToneHex })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono font-bold text-muted-foreground", children: "Calculando..." }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono", children: "Proporção Áurea" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold font-mono text-primary mt-1", children: scanProgress >= 25 && activeFaceMetrics ? `${activeFaceMetrics.goldenRatioDev}% harmonia` : "Calculando..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono", children: "Gênero Previsto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold font-mono text-primary mt-1 truncate", children: scanProgress >= 75 && queryFace ? queryFace.gender === "male" ? "MASCULINO" : "FEMININO" : "Calculando..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono", children: "Idade Forense" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-bold font-mono text-primary mt-1", children: scanProgress >= 75 && queryFace ? `~${queryFace.age?.toFixed(0)} anos` : "Calculando..." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/80 border border-primary/25 rounded-xl p-3 font-mono text-[10px] text-primary h-[85px] overflow-y-auto space-y-0.5", children: scanLogs.map((log, idx) => {
          let colorClass = "text-muted-foreground";
          if (log.startsWith("[OK]")) colorClass = "text-primary/95 font-semibold";
          else if (log.startsWith("[DADOS]")) colorClass = "text-accent/90";
          else if (log.startsWith("[SISTEMA]")) colorClass = "text-yellow-400/90";
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: colorClass, children: log }, idx);
        }) })
      ] })
    ] }) }),
    matches && !scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      matches.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "rounded-3xl border-2 border-primary bg-card/85 p-6 glow relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 right-0 bg-primary/20 border-l border-b border-primary/30 px-3 py-1.5 rounded-bl-xl text-[10px] font-mono text-primary uppercase tracking-widest font-bold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 12 }),
          " Correspondência Principal"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5 text-xs font-semibold text-primary font-mono uppercase tracking-widest", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 14, className: "animate-pulse" }),
          "Identificação Primária Detectada"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-[1fr_160px_1fr] gap-6 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-primary/30 bg-black aspect-square h-[200px] flex items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: queryUrl, alt: "Busca", className: "h-full w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-muted-foreground font-mono", children: "Foto de Busca" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center text-center space-y-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-mono uppercase tracking-wider", children: "Confiança" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: `text-4xl font-black font-mono tracking-tighter ${matches[0].confidence >= 0.7 ? "text-primary shadow-[0_0_15px_oklch(0.65_0.22_250)]" : matches[0].confidence >= 0.55 ? "text-accent" : "text-destructive"}`, children: [
              (matches[0].confidence * 100).toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: matches[0].confidence >= 0.7 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-primary/20 text-primary border border-primary/40 text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold", children: "ALTA CONFIANÇA" }) : matches[0].confidence >= 0.55 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-accent/20 text-accent border border-accent/40 text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold", children: "MÉDIA CONFIANÇA" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-destructive/20 text-destructive border border-destructive/40 text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full font-bold", children: "BAIXA CONFIANÇA" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground font-mono leading-relaxed mt-2", children: [
              "similaridade ",
              (matches[0].sim * 100).toFixed(1),
              "%",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "distância ",
              matches[0].dist.toFixed(3)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-primary/30 bg-black aspect-square h-[200px] flex items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: matches[0].matchedUrl, alt: "Match", className: "h-full w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-muted-foreground font-mono", children: "Registro no Banco" })
          ] }) })
        ] }),
        matches[0].dist > threshold && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-2 text-xs text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Nota:" }),
            " Esta correspondência está abaixo do limite de sensibilidade configurado (",
            threshold,
            "). Exibida por ser a de maior confiança no banco."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-primary/20 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-foreground", children: matches[0].person.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mt-0.5 font-mono", children: [
              "Status: ",
              matches[0].person.status || "Sem Status Definido"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
            id: matches[0].person.id
          }, className: "flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 hover:glow transition w-full sm:w-auto justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }),
            " Abrir Ficha Investigativa"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 border-b border-border pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm font-mono text-muted-foreground uppercase tracking-wider", children: [
            "Outras Correspondências Possíveis (",
            filtered.filter((m) => m.person.id !== matches[0].person.id).length,
            ")"
          ] }),
          matches.length > filtered.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground font-mono", children: [
            matches.length - filtered.length,
            " correspondências de baixa confiança ocultas"
          ] })
        ] }),
        filtered.filter((m) => m.person.id !== matches[0].person.id).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs font-mono", children: "Nenhum outro suspeito secundário passou no teste de sensibilidade." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filtered.filter((m) => m.person.id !== matches[0].person.id).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 8
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "rounded-2xl border border-primary/20 bg-card p-4 hover:border-primary/60 hover:glow transition flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m.matchedUrl, alt: m.person.nome, className: "h-16 w-16 rounded-xl object-cover border-2 border-primary/30 bg-black shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold truncate text-sm", children: m.person.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] uppercase tracking-wider text-muted-foreground font-mono", children: m.person.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] font-mono", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Confiança" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-primary", children: [
                    (m.confidence * 100).toFixed(1),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 bg-input rounded-full mt-0.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
                  width: `${m.confidence * 100}%`
                } }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
            id: m.person.id
          }, className: "mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs hover:bg-primary/20 transition font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 12 }),
            " Abrir Ficha"
          ] })
        ] }, m.person.id + m.matchedUrl)) })
      ] })
    ] }),
    matches && matches.length === 0 && !scanning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm flex flex-col items-center gap-2 bg-card/25", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 28, className: "text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nenhuma correspondência facial encontrada no banco de dados." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Tente diminuir a sensibilidade ou re-indexar o banco de dados." })
    ] })
  ] }) });
}
export {
  Page as component
};
