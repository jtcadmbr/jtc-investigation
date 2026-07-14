import { Human, type Config, type FaceResult } from "@vladmandic/human";

// Human hospeda os modelos aqui (CDN estável do autor)
const MODEL_URL = "https://vladmandic.github.io/human-models/models/";

// bump this when the pipeline changes so cached vectors get re-indexed
export const MODEL_VERSION = "human-3-mobilefacenet-1024-v1";

export type FaceMetrics = {
  symmetry: number;
  skinSmoothness: number;
  skinToneHex: string;
  goldenRatioDev: number;
  forensicFeatures: {
    interocularDist: number;
    noseWidth: number;
    mouthWidth: number;
    jawWidth: number;
  };
  extended?: {
    eyeColorHex: string;
    eyeOpenness: number;
    mouthColorHex: string;
    lipThickness: number;
    eyebrowColorHex: string;
    eyebrowThickness: number;
    hairColorHex: string;
    faceShape: "oval" | "redondo" | "quadrado" | "longo" | "coração";
  };
};

export type FaceCandidate = {
  descriptor: Float32Array;
  score: number;
  quality: number;
  qualityLabel: "boa" | "média" | "baixa";
  box: { x: number; y: number; width: number; height: number };
  center: { x: number; y: number };
  canvasSize: { width: number; height: number };
  imageSize: { width: number; height: number };
  notes: string[];
  gender?: "male" | "female";
  genderProbability?: number;
  age?: number;
  metrics?: FaceMetrics;
};

const humanConfig: Partial<Config> = {
  modelBasePath: MODEL_URL,
  backend: "webgl",
  cacheSensitivity: 0,
  warmup: "none",
  debug: false,
  filter: {
    enabled: true,
    equalization: true,
    return: true,
  } as any,
  face: {
    enabled: true,
    detector: { rotation: true, maxDetected: 20, minConfidence: 0.18, return: false, iouThreshold: 0.25 },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
    gear: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
  segmentation: { enabled: false },
};

let human: Human | null = null;
let loadingPromise: Promise<Human> | null = null;

export function loadFaceModels(): Promise<Human> {
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const h = new Human(humanConfig);
      await h.load();
      human = h;
      return h;
    })();
  }
  return loadingPromise;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function qualityLabel(q: number): FaceCandidate["qualityLabel"] {
  if (q >= 0.62) return "boa";
  if (q >= 0.38) return "média";
  return "baixa";
}

function prepareCanvas(img: HTMLImageElement, enhanced = false): HTMLCanvasElement {
  const MAX = 1920;
  const MIN = 900;
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
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (enhanced) ctx.filter = "contrast(1.18) brightness(1.06) saturate(0.95)";
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}

function flipCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext("2d")!;
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
}

function averageDescriptors(a: Float32Array, b: Float32Array): Float32Array {
  const len = Math.min(a.length, b.length);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) out[i] = (a[i] + b[i]) / 2;
  return l2normalize(out);
}

// MediaPipe FaceMesh (468 pts) canonical indices used by Human
const IDX = {
  noseTop: 168,
  noseTip: 1,
  chin: 152,
  forehead: 10,
  leftFace: 234,   // silhouette left
  rightFace: 454,  // silhouette right
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  noseLeft: 129,
  noseRight: 358,
  mouthLeft: 61,
  mouthRight: 291,
  jawLeft: 172,
  jawRight: 397,
  leftCheek: 234,
  rightCheek: 454,
  midCheekL: 205,
  midCheekR: 425,
  leftEyeTop: 159,
  leftEyeBottom: 145,
  rightEyeTop: 386,
  rightEyeBottom: 374,
  leftIris: 468,
  rightIris: 473,
  upperLipTop: 13,
  lowerLipBottom: 14,
  upperLipOuter: 0,
  lowerLipOuter: 17,
  leftBrowInner: 55,
  leftBrowOuter: 70,
  leftBrowTop: 105,
  rightBrowInner: 285,
  rightBrowOuter: 300,
  rightBrowTop: 334,
};

type Pt = { x: number; y: number };
function pt(mesh: number[][], i: number): Pt {
  const p = mesh[i];
  return { x: p[0], y: p[1] };
}
function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function computeMetricsFromMesh(
  mesh: number[][],
  canvas: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number },
): FaceMetrics {
  // Nose axis (vertical center line)
  const noseTop = pt(mesh, IDX.noseTop);
  const noseTip = pt(mesh, IDX.noseTip);
  const axisX = (noseTop.x + noseTip.x) / 2;

  const pairs: [number, number][] = [
    [IDX.leftEyeOuter, IDX.rightEyeOuter],
    [IDX.leftEyeInner, IDX.rightEyeInner],
    [IDX.noseLeft, IDX.noseRight],
    [IDX.mouthLeft, IDX.mouthRight],
    [IDX.jawLeft, IDX.jawRight],
    [IDX.leftFace, IDX.rightFace],
  ];

  let totalDiff = 0;
  let count = 0;
  for (const [l, r] of pairs) {
    const pl = pt(mesh, l);
    const pr = pt(mesh, r);
    const dl = Math.abs(pl.x - axisX);
    const dr = Math.abs(pr.x - axisX);
    const avg = (dl + dr) / 2;
    if (avg > 0) {
      totalDiff += Math.abs(dl - dr) / avg;
      count++;
    }
  }
  const symmetry = Math.max(0, Math.min(100, Math.round((1 - totalDiff / (count || 1)) * 100)));

  const faceHeight = dist(pt(mesh, IDX.forehead), pt(mesh, IDX.chin));
  const faceWidth = dist(pt(mesh, IDX.leftFace), pt(mesh, IDX.rightFace));
  const ratio = faceHeight / (faceWidth || 1);
  const goldenRatio = 1.618;
  const deviation = Math.abs(ratio - goldenRatio) / goldenRatio;
  const goldenRatioDev = Math.max(0, Math.min(100, Math.round((1 - deviation) * 100)));

  const leftEyeC: Pt = {
    x: (pt(mesh, IDX.leftEyeOuter).x + pt(mesh, IDX.leftEyeInner).x) / 2,
    y: (pt(mesh, IDX.leftEyeOuter).y + pt(mesh, IDX.leftEyeInner).y) / 2,
  };
  const rightEyeC: Pt = {
    x: (pt(mesh, IDX.rightEyeOuter).x + pt(mesh, IDX.rightEyeInner).x) / 2,
    y: (pt(mesh, IDX.rightEyeOuter).y + pt(mesh, IDX.rightEyeInner).y) / 2,
  };
  const interocularDist = Math.round(dist(leftEyeC, rightEyeC));
  const noseWidth = Math.round(dist(pt(mesh, IDX.noseLeft), pt(mesh, IDX.noseRight)));
  const mouthWidth = Math.round(dist(pt(mesh, IDX.mouthLeft), pt(mesh, IDX.mouthRight)));
  const jawWidth = Math.round(dist(pt(mesh, IDX.jawLeft), pt(mesh, IDX.jawRight)));

  let skinSmoothness = 88;
  let skinToneHex = "#C8A080";
  try {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const sampleSize = Math.max(4, Math.round(box.width * 0.07));
      const readAvg = (cx: number, cy: number) => {
        const x = Math.max(0, Math.min(canvas.width - sampleSize, Math.round(cx - sampleSize / 2)));
        const y = Math.max(0, Math.min(canvas.height - sampleSize, Math.round(cy - sampleSize / 2)));
        return ctx.getImageData(x, y, sampleSize, sampleSize).data;
      };
      const s1 = readAvg(pt(mesh, IDX.midCheekL).x, pt(mesh, IDX.midCheekL).y);
      const s2 = readAvg(pt(mesh, IDX.midCheekR).x, pt(mesh, IDX.midCheekR).y);
      let rSum = 0, gSum = 0, bSum = 0, n = 0;
      const brights: number[] = [];
      const process = (data: Uint8ClampedArray) => {
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; n++;
          brights.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
      };
      process(s1); process(s2);
      if (n > 0) {
        const aR = Math.round(rSum / n), aG = Math.round(gSum / n), aB = Math.round(bSum / n);
        const toHex = (c: number) => c.toString(16).padStart(2, "0");
        skinToneHex = `#${toHex(aR)}${toHex(aG)}${toHex(aB)}`.toUpperCase();
        const avgB = brights.reduce((a, b) => a + b, 0) / brights.length;
        const variance = brights.reduce((a, b) => a + (b - avgB) ** 2, 0) / brights.length;
        skinSmoothness = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 2.3)));
      }
    }
  } catch {}

  return {
    symmetry,
    skinSmoothness,
    skinToneHex,
    goldenRatioDev,
    forensicFeatures: { interocularDist, noseWidth, mouthWidth, jawWidth },
  };
}

// Backwards-compat export (unused with Human but kept in case)
export function computeFaceMetrics(): FaceMetrics {
  return {
    symmetry: 0, skinSmoothness: 0, skinToneHex: "#000000", goldenRatioDev: 0,
    forensicFeatures: { interocularDist: 0, noseWidth: 0, mouthWidth: 0, jawWidth: 0 },
  };
}

function l2normalize(v: Float32Array): Float32Array {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  s = Math.sqrt(s);
  if (s <= 0) return v;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / s;
  return out;
}

function analyze(f: FaceResult, canvas: HTMLCanvasElement, img: HTMLImageElement): FaceCandidate | null {
  if (!f.embedding || !f.box) return null;
  const [x, y, width, height] = f.box;
  const faceSize = Math.min(width, height);
  const short = Math.min(canvas.width, canvas.height);
  const touchesEdge = x < 4 || y < 4 || x + width > canvas.width - 4 || y + height > canvas.height - 4;
  const score = f.score ?? f.faceScore ?? 0.5;
  const sq = clamp01((score - 0.28) / 0.62);
  const sz = clamp01((faceSize - 78) / 190);
  const rq = clamp01((faceSize / short - 0.08) / 0.24);
  const edge = touchesEdge ? 0.12 : 0;
  const quality = clamp01(sq * 0.5 + sz * 0.32 + rq * 0.18 - edge);
  const notes: string[] = [];
  if (faceSize < 95) notes.push("rosto pequeno");
  if (score < 0.42) notes.push("detecção fraca");
  if (touchesEdge) notes.push("rosto cortado");

  let metrics: FaceMetrics | undefined;
  if (f.mesh && f.mesh.length >= 468) {
    try {
      metrics = computeMetricsFromMesh(f.mesh as number[][], canvas, { x, y, width, height });
    } catch {}
  }

  const gender = f.gender === "male" || f.gender === "female" ? f.gender : undefined;
  const genderProbability = typeof f.genderScore === "number" ? f.genderScore : undefined;

  return {
    descriptor: l2normalize(Float32Array.from(f.embedding)),
    score,
    quality,
    qualityLabel: qualityLabel(quality),
    box: { x, y, width, height },
    center: { x: x + width / 2, y: y + height / 2 },
    canvasSize: { width: canvas.width, height: canvas.height },
    imageSize: { width: img.naturalWidth, height: img.naturalHeight },
    notes,
    gender,
    genderProbability,
    age: typeof f.age === "number" ? f.age : undefined,
    metrics,
  };
}

async function detectOn(canvas: HTMLCanvasElement, img: HTMLImageElement): Promise<FaceCandidate[]> {
  const h = await loadFaceModels();
  const res = await h.detect(canvas);
  const list: FaceCandidate[] = [];
  for (const f of res.face || []) {
    const c = analyze(f, canvas, img);
    if (c) list.push(c);
  }
  return list;
}

function dedupe(list: FaceCandidate[]) {
  const sorted = [...list].sort((a, b) => b.quality - a.quality || b.score - a.score);
  const kept: FaceCandidate[] = [];
  for (const c of sorted) {
    const dup = kept.some((k) => {
      const dx = k.center.x - c.center.x;
      const dy = k.center.y - c.center.y;
      const tol = Math.max(k.box.width, c.box.width) * 0.4;
      return Math.hypot(dx, dy) < tol;
    });
    if (!dup) kept.push(c);
  }
  return kept;
}

export async function getFaceCandidates(url: string): Promise<FaceCandidate[]> {
  try {
    const img = await loadImage(url);
    const normal = prepareCanvas(img);
    let list = await detectOn(normal, img);
    if (!list.length) {
      const enh = prepareCanvas(img, true);
      list = await detectOn(enh, img);
    }
    const deduped = dedupe(list);
    if (!deduped.length) return deduped;

    // TTA (test-time augmentation): descritor do rosto original é fundido
    // com o descritor do mesmo rosto na imagem espelhada horizontalmente.
    // Reduz sensibilidade a pose/iluminação lateral e melhora precisão do
    // matching sem exigir reindexação do banco (média em espaço L2 mantém
    // compatibilidade com embeddings já armazenados).
    try {
      const flipped = flipCanvas(normal);
      const flipList = await detectOn(flipped, img);
      if (flipList.length) {
        for (const c of deduped) {
          const mirrorX = normal.width - c.center.x;
          let best: FaceCandidate | null = null;
          let bestD = Infinity;
          for (const f of flipList) {
            const dx = f.center.x - mirrorX;
            const dy = f.center.y - c.center.y;
            const d = Math.hypot(dx, dy);
            const tol = Math.max(c.box.width, f.box.width) * 0.35;
            if (d < tol && d < bestD) {
              bestD = d;
              best = f;
            }
          }
          if (best) c.descriptor = averageDescriptors(c.descriptor, best.descriptor);
        }
      }
    } catch {}

    return deduped;
  } catch {
    return [];
  }
}

export async function getBestDescriptor(url: string): Promise<Float32Array | null> {
  const list = await getFaceCandidates(url);
  if (!list.length) return null;
  list.sort((a, b) => b.quality - a.quality || b.score - a.score);
  return list[0].descriptor;
}

export async function getAllDescriptors(url: string): Promise<Float32Array[]> {
  return (await getFaceCandidates(url)).map((r) => r.descriptor);
}

export async function getDescriptor(url: string): Promise<Float32Array | null> {
  return getBestDescriptor(url);
}

// Cosine distance on L2-normalized embeddings: 1 - dot(a,b), in [0..2]
export function distance(a: Float32Array | number[], b: Float32Array | number[]): number {
  const A = a instanceof Float32Array ? a : Float32Array.from(a);
  const B = b instanceof Float32Array ? b : Float32Array.from(b);
  const len = Math.min(A.length, B.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < len; i++) {
    dot += A[i] * B[i];
    na += A[i] * A[i];
    nb += B[i] * B[i];
  }
  const denom = Math.sqrt(na * nb) || 1;
  const cos = dot / denom;
  return Math.max(0, 1 - cos);
}

// Curva recalibrada para Human/MobileFaceNet (1024-d, L2-normalizado).
// Na prática, mesma pessoa cai em cosine-distance 0.15–0.45 dependendo de
// idade/pose/iluminação, e pessoas diferentes ficam acima de ~0.6.
// A curva antiga era severa demais e derrubava match legítimo pra ~60%.
//   d ≤ 0.15  → 100%   (praticamente idêntica)
//   d ≈ 0.30  → ~93%   (mesma pessoa, condições OK)
//   d ≈ 0.40  → ~80%   (mesma pessoa, condições ruins)
//   d ≈ 0.50  → ~60%   (dúvida)
//   d ≥ 0.72  → 0%     (diferente)
export function similarity(d: number): number {
  const LOW = 0.15;
  const HIGH = 0.72;
  if (d <= LOW) return 1;
  if (d >= HIGH) return 0;
  const x = (d - LOW) / (HIGH - LOW);
  const s = 1 - x * x;
  return Math.max(0, Math.min(1, s));
}

export function toArray(f: Float32Array): number[] {
  return Array.from(f);
}
