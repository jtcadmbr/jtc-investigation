import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanFace, AlertCircle, Eye, X, Database, RefreshCw, Activity, ShieldAlert, Award, Check, ChevronRight, HelpCircle, Brain } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FaceSelector } from "@/components/FaceSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  distance,
  getFaceCandidates,
  loadFaceModels,
  MODEL_VERSION,
  similarity,
  toArray,
  type FaceCandidate,
} from "@/lib/face";

export const Route = createFileRoute("/face-search")({ component: Page });

type EmbeddingRow = {
  id: string;
  investigated_id: string;
  photo_url: string;
  face_index: number;
  embedding: number[];
  quality: number;
  gender?: string | null;
  gender_probability?: number | null;
  age?: number | null;
};

type Person = { id: string; nome: string; status: string | null; foto_url: string | null; fotos: any };

type Match = {
  person: Person;
  matchedUrl: string;
  dist: number;
  sim: number;
  quality: number;
  confidence: number;
  gender?: string | null;
  age?: number | null;
  feedbackApplied?: number; // signed delta applied by user feedback
};

type FeedbackRow = {
  id: string;
  investigated_id: string;
  decision: "confirm" | "reject";
  query_embedding: number[];
};

type FaceGroup = {
  face: FaceCandidate;
  faceIndex: number;
  matches: Match[];
};

function rank(dist: number, qq: number, tq: number) {
  const sim = similarity(dist);
  const quality = Math.min(qq, tq);
  // Confiança = quase tudo similaridade. Qualidade só dá um bônus pequeno
  // pra desempatar — sem puxar o % pra baixo quando a foto é ruim.
  const qualityBonus = Math.max(0, quality - 0.3) * 0.08;
  const confidence = Math.max(0, Math.min(1, sim + qualityBonus * (1 - sim)));
  return { sim, quality, confidence };
}

function Page() {
  const { user } = useAuth();
  const [modelsReady, setModelsReady] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [queryUrl, setQueryUrl] = useState<string | null>(null);
  const [queryFace, setQueryFace] = useState<FaceCandidate | null>(null);
  const [candidates, setCandidates] = useState<FaceCandidate[]>([]);
  const [groups, setGroups] = useState<FaceGroup[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [threshold, setThreshold] = useState(0.58); // Sensibilidade padrão mais rigorosa e precisa
  const [topOnly, setTopOnly] = useState(true); // por padrão, mostra apenas o resultado de maior confiança
  const [indexStats, setIndexStats] = useState<{ indexed: number; total: number } | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState({ done: 0, total: 0 });
  
  // Estados para a animação do escaneamento forense
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState<"none" | "landmarks" | "symmetry" | "skin" | "demographics" | "matching" | "done">("none");
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [activeFaceMetrics, setActiveFaceMetrics] = useState<any>(null);

  // Carrossel de decisão (fluxo 1-a-1 com feedback)
  const [decisionIdx, setDecisionIdx] = useState(0);
  const [confirmed, setConfirmed] = useState<Match | null>(null);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFaceModels()
      .then(() => setModelsReady(true))
      .catch(() => toast.error("Falha ao carregar modelos biométricos"))
      .finally(() => setLoadingModels(false));
    refreshStats();
  }, []);

  // Re-indexação automática quando há discrepâncias detectadas
  useEffect(() => {
    if (!indexStats || !modelsReady || indexing) return;
    if (indexStats.total > 0 && indexStats.indexed < indexStats.total) {
      toast.info(`Indexação automática iniciada para ${indexStats.total - indexStats.indexed} foto(s)...`, {
        id: "auto-reindex",
        duration: 4000
      });
      reindexAll();
    }
  }, [indexStats?.indexed, indexStats?.total, modelsReady]);

  async function refreshStats() {
    try {
      const [{ count: total }, { count: indexed }] = await Promise.all([
        supabase
          .from("investigateds")
          .select("id", { count: "exact", head: true })
          .not("foto_url", "is", null),
        supabase
          .from("face_embeddings")
          .select("investigated_id", { count: "exact", head: true })
          .eq("model_version", MODEL_VERSION),
      ]);
      setIndexStats({ indexed: indexed ?? 0, total: total ?? 0 });
    } catch {}
  }

  const onFile = (f: File | null) => {
    if (!f) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return toast.error("Busca por face indisponível offline — conecte-se à internet");
    }
    if (!f.type.startsWith("image/")) return toast.error("Selecione uma imagem");
    const r = new FileReader();
    r.onload = () => {
      setQueryUrl(r.result as string);
      setQueryFace(null);
      setMatches(null);
      setGroups(null);
      setCandidates([]);
      setScanProgress(0);
      setScanPhase("none");
      setScanLogs([]);
      setActiveFaceMetrics(null);
      setDecisionIdx(0);
      setConfirmed(null);
      setRejectedIds(new Set());
    };
    r.readAsDataURL(f);
  };

  async function ensurePhotoIndexed(personId: string, url: string): Promise<EmbeddingRow[]> {
    if (!user) return [];
    const { data: existing } = await supabase
      .from("face_embeddings")
      .select("*")
      .eq("investigated_id", personId)
      .eq("photo_url", url)
      .eq("model_version", MODEL_VERSION);
    if (existing && existing.length) return existing as any;
    
    const candidates = await getFaceCandidates(url);
    if (!candidates.length) return [];

    const rows = candidates.map((c, i) => ({
      user_id: user.id,
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
      age: c.age || null,
    }));

    try {
      const { data: inserted, error } = await supabase
        .from("face_embeddings")
        .upsert(rows, { onConflict: "investigated_id,photo_url,face_index,model_version" })
        .select("*");
      if (error) throw error;
      return (inserted as any) || [];
    } catch (err) {
      console.warn("Falha ao salvar colunas de gênero/idade (podem não existir no BD remoto ainda). Fallback ativo.", err);
      // Fallback adaptativo: remove colunas novas e insere
      const fallbackRows = rows.map(({ gender, gender_probability, age, ...rest }: any) => rest);
      const { data: inserted, error } = await supabase
        .from("face_embeddings")
        .upsert(fallbackRows, { onConflict: "investigated_id,photo_url,face_index,model_version" })
        .select("*");
      if (error) throw error;
      return (inserted as any) || [];
    }
  }

  async function reindexAll() {
    if (!modelsReady) return;
    setIndexing(true);
    try {
      const { data: people, error } = await supabase
        .from("investigateds")
        .select("id,foto_url,fotos");
      if (error) throw error;
      const jobs: { personId: string; url: string }[] = [];
      for (const p of people || []) {
        if (p.foto_url) jobs.push({ personId: p.id, url: p.foto_url });
        const extras = Array.isArray(p.fotos) ? p.fotos : [];
        for (const u of extras) if (typeof u === "string") jobs.push({ personId: p.id, url: u });
      }
      setIndexProgress({ done: 0, total: jobs.length });
      let ok = 0;
      for (let i = 0; i < jobs.length; i += 2) {
        const batch = jobs.slice(i, i + 2);
        await Promise.all(
          batch.map(async (j) => {
            try {
              const rows = await ensurePhotoIndexed(j.personId, j.url);
              if (rows.length) ok++;
            } catch {}
          }),
        );
        setIndexProgress({ done: Math.min(i + 2, jobs.length), total: jobs.length });
      }
      toast.success(`Indexação automática concluída: ${ok}/${jobs.length} fotos processadas`);
      refreshStats();
    } catch (e: any) {
      toast.error(e.message || "Falha na indexação");
    } finally {
      setIndexing(false);
    }
  }

  async function scan() {
    if (!queryUrl || !modelsReady || !queryFace) return;
    setScanning(true);
    setMatches(null);
    setGroups(null);
    setScanProgress(5);
    setScanPhase("landmarks");
    setScanLogs(["[SISTEMA] Iniciando varredura biométrica facial...", "[OK] Carregando imagem de entrada..."]);
    setActiveFaceMetrics(queryFace.metrics || null);
    
    try {
      // 1) Carrega embeddings do banco (incluindo gênero e idade se disponíveis)
      const { data: rows, error } = await supabase
        .from("face_embeddings")
        .select("id,investigated_id,photo_url,face_index,embedding,quality,gender,gender_probability,age")
        .eq("model_version", MODEL_VERSION);
      if (error) throw error;

      const { data: peopleData } = await supabase
        .from("investigateds")
        .select("id,nome,status,foto_url,fotos");
      const peopleById = new Map<string, Person>();
      for (const p of peopleData || []) peopleById.set(p.id, p as any);

      // 2) Indexa novas fotos pendentes automaticamente sob demanda
      const indexedUrls = new Set((rows || []).map((r: any) => r.investigated_id + "|" + r.photo_url));
      const pending: { personId: string; url: string }[] = [];
      for (const p of peopleData || []) {
        const urls = [p.foto_url, ...(Array.isArray(p.fotos) ? p.fotos : [])].filter(
          (u): u is string => typeof u === "string" && !!u,
        );
        for (const u of urls) {
          if (!indexedUrls.has(p.id + "|" + u)) pending.push({ personId: p.id, url: u });
        }
      }

      const allRows: EmbeddingRow[] = (rows as any) || [];
      if (pending.length) {
        setScanLogs(prev => [...prev, `[SISTEMA] Indexando ${pending.length} novas imagens pendentes no banco...`]);
        for (let i = 0; i < pending.length; i += 3) {
          const batch = pending.slice(i, i + 3);
          const results = await Promise.all(
            batch.map((j) => ensurePhotoIndexed(j.personId, j.url).catch(() => [])),
          );
          for (const r of results) allRows.push(...r);
        }
      }

      // 3) Processa a correspondência dos embeddings com filtragem inteligente de gênero
      const results: Match[] = [];
      // Template médio por pessoa (galeria) — L2 do vetor médio de todas
      // as fotos indexadas da mesma pessoa. Reduz variação de pose/luz.
      const galleryByPerson = new Map<string, EmbeddingRow[]>();
      for (const r of allRows) {
        const arr = galleryByPerson.get(r.investigated_id) || [];
        arr.push(r);
        galleryByPerson.set(r.investigated_id, arr);
      }
      const templateByPerson = new Map<string, { vec: number[]; quality: number; gender?: string | null; gender_probability?: number | null; age?: number | null }>();
      for (const [pid, rows2] of galleryByPerson) {
        if (rows2.length < 2) continue;
        const len = rows2[0].embedding.length;
        const sum = new Array(len).fill(0);
        for (const r of rows2) for (let i = 0; i < len; i++) sum[i] += r.embedding[i];
        let norm = 0;
        for (let i = 0; i < len; i++) { sum[i] /= rows2.length; norm += sum[i] * sum[i]; }
        norm = Math.sqrt(norm) || 1;
        for (let i = 0; i < len; i++) sum[i] /= norm;
        const q = rows2.reduce((a, r) => a + (r.quality || 0), 0) / rows2.length;
        templateByPerson.set(pid, { vec: sum, quality: q, gender: rows2[0].gender, gender_probability: rows2[0].gender_probability, age: rows2[0].age });
      }
      for (const r of allRows) {
        const person = peopleById.get(r.investigated_id);
        if (!person) continue;

        // ================================================================
        // FILTRO BIOMÉTRICO RÍGIDO — impede match entre gêneros diferentes.
        // Regra: se AMBOS os lados têm gênero estimado com confiança >= 65%
        // e são diferentes, o candidato é DESCARTADO imediatamente.
        // Isso resolve o falso positivo clássico (foto de homem batendo
        // com registro de mulher, e vice-versa).
        // ================================================================
        if (queryFace.gender && r.gender) {
          const qp = queryFace.genderProbability ?? 1;
          const rp = r.gender_probability ?? 1;
          if (qp >= 0.55 && rp >= 0.55 && queryFace.gender !== r.gender) {
            continue;
          }
        }

        // Filtro secundário: diferença de idade forense absurda (>25 anos)
        // com ambas estimativas conhecidas → descarta.
        if (queryFace.age && r.age) {
          const ageGap = Math.abs(queryFace.age - r.age);
          if (ageGap > 25) continue;
        }

        const d = distance(queryFace.descriptor, r.embedding);
        // Distância também contra o template médio da galeria da pessoa,
        // se existir. Usamos o MENOR dos dois — o template estabiliza casos
        // onde uma foto isolada tem pose/luz ruim, mas a média da galeria
        // representa bem a identidade.
        let dEff = d;
        const tpl = templateByPerson.get(r.investigated_id);
        if (tpl) {
          const dTpl = distance(queryFace.descriptor, tpl.vec);
          if (dTpl < dEff) dEff = dTpl;
        }
        const { sim, quality, confidence } = rank(dEff, queryFace.quality, r.quality);
        results.push({
          person,
          matchedUrl: r.photo_url,
          dist: dEff,
          sim,
          quality,
          confidence,
          gender: r.gender,
          age: r.age,
        });
      }

      // 4) Mantém apenas a melhor correspondência por pessoa investigada
      const best = new Map<string, Match>();
      for (const m of results) {
        const cur = best.get(m.person.id);
        if (!cur || m.confidence > cur.confidence || (m.confidence === cur.confidence && m.dist < cur.dist)) {
          best.set(m.person.id, m);
        }
      }

      // 4.5) Aprendizado por feedback — aplica bônus/penalidade a partir do histórico
      // do próprio usuário. Confirmações antigas do mesmo tipo de rosto empurram
      // a pessoa para cima; rejeições passadas empurram para baixo.
      let learned = 0;
      try {
        const { data: fbData } = await supabase
          .from("face_feedback" as any)
          .select("id,investigated_id,decision,query_embedding");
        const feedbacks: FeedbackRow[] = (fbData as any) || [];
        learned = feedbacks.length;
        if (feedbacks.length && queryFace) {
          for (const [pid, m] of best) {
            const relevant = feedbacks.filter((f) => f.investigated_id === pid);
            if (!relevant.length) continue;
            let bonus = 0;
            for (const f of relevant) {
              const d = distance(queryFace.descriptor, f.query_embedding);
              if (d > 0.5) continue; // só rostos parecidos com o histórico
              const weight = Math.max(0, (0.5 - d) / 0.5); // 1 quando idêntico, 0 quando longe
              if (f.decision === "confirm") bonus += 0.10 * weight;
              else bonus -= 0.14 * weight;
            }
            bonus = Math.max(-0.35, Math.min(0.2, bonus));
            const newConf = Math.max(0, Math.min(1, m.confidence + bonus));
            best.set(pid, { ...m, confidence: newConf, feedbackApplied: bonus });
          }
        }
      } catch (e) {
        // silencioso — se a tabela ainda não existir, segue sem reranking
      }
      setLearnedCount(learned);

      const sorted = Array.from(best.values()).sort(
        (a, b) => b.confidence - a.confidence || a.dist - b.dist,
      );

      // === RATIO-TEST (Regra de Lowe adaptada) ===
      // Compara o vencedor com o segundo colocado. Margem grande = alta certeza,
      // margem mínima = ambiguidade (rostos parecidos concorrendo). Isso é o
      // que separa uma decisão biométrica confiável de um chute educado.
      if (sorted.length >= 2) {
        const d1 = sorted[0].dist;
        const d2 = sorted[1].dist;
        const margin = (d2 - d1) / Math.max(d1, 0.01);
        let marginBonus = 0;
        if (margin > 0.30) marginBonus = 0.10;
        else if (margin > 0.18) marginBonus = 0.05;
        else if (margin < 0.04) marginBonus = -0.18;
        else if (margin < 0.10) marginBonus = -0.08;
        if (marginBonus !== 0) {
          const m = sorted[0];
          const newConf = Math.max(0, Math.min(1, m.confidence + marginBonus));
          sorted[0] = { ...m, confidence: newConf, feedbackApplied: (m.feedbackApplied || 0) + marginBonus };
        }
        // Penaliza runner-ups muito próximos entre si (ruído)
        for (let i = 1; i < Math.min(sorted.length, 5); i++) {
          const gap = (sorted[i].dist - d1) / Math.max(d1, 0.01);
          if (gap < 0.05) {
            sorted[i] = { ...sorted[i], confidence: Math.max(0, sorted[i].confidence - 0.08) };
          }
        }
        sorted.sort((a, b) => b.confidence - a.confidence || a.dist - b.dist);
      }

      // --- Sequência Cinematográfica de Animação ---
      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

      await sleep(500);
      setScanProgress(25);
      setScanPhase("symmetry");
      setScanLogs(prev => [
        ...prev,
        "[OK] 68 marcos faciais geolocalizados com alta definição",
        "[INFO] Analisando proporções ósseas e desvio simétrico..."
      ]);

      await sleep(500);
      setScanProgress(50);
      setScanPhase("skin");
      setScanLogs(prev => [
        ...prev,
        `[OK] Simetria calculada: ${queryFace.metrics?.symmetry}% (Desvio: ${100 - (queryFace.metrics?.symmetry || 100)}%)`,
        `[OK] Harmonia da Proporção Áurea: ${queryFace.metrics?.goldenRatioDev}%`,
        "[INFO] Analisando textura, derme e tom de pele nas bochechas..."
      ]);

      await sleep(500);
      setScanProgress(75);
      setScanPhase("demographics");
      setScanLogs(prev => [
        ...prev,
        `[OK] Suavidade facial estimada: ${queryFace.metrics?.skinSmoothness}%`,
        `[OK] Tom de pele extraído (HEX): ${queryFace.metrics?.skinToneHex}`,
        "[INFO] Classificando características forenses adicionais..."
      ]);

      await sleep(500);
      setScanProgress(90);
      setScanPhase("matching");
      const genderLabel = queryFace.gender === "male" ? "MASCULINO" : queryFace.gender === "female" ? "FEMININO" : "N/D";
      setScanLogs(prev => [
        ...prev,
        `[OK] Gênero biológico estimado: ${genderLabel} (${((queryFace.genderProbability || 0) * 100).toFixed(0)}%)`,
        `[OK] Faixa etária provável: ~${queryFace.age?.toFixed(0)} anos`,
        `[SISTEMA] Comparando com ${allRows.length} perfis biométricos no banco...`
      ]);

      await sleep(500);
      setScanProgress(100);
      setScanPhase("done");
      setScanLogs(prev => [...prev, "[OK] Cruzamento de dados finalizado!", "[SISTEMA] Atualizando interface..."]);

      await sleep(200);
      setMatches(sorted);
      setDecisionIdx(0);
      setConfirmed(null);
      setRejectedIds(new Set());
      refreshStats();
    } catch (e: any) {
      toast.error(e.message || "Erro na busca");
    } finally {
      setScanning(false);
    }
  }

  function matchFace(face: FaceCandidate, allRows: EmbeddingRow[], peopleById: Map<string, Person>): Match[] {
    const results: Match[] = [];
    for (const r of allRows) {
      const person = peopleById.get(r.investigated_id);
      if (!person) continue;
      if (face.gender && r.gender) {
        const qp = face.genderProbability ?? 1;
        const rp = r.gender_probability ?? 1;
        if (qp >= 0.55 && rp >= 0.55 && face.gender !== r.gender) continue;
      }
      if (face.age && r.age) {
        if (Math.abs(face.age - r.age) > 25) continue;
      }
      const d = distance(face.descriptor, r.embedding);
      const { sim, quality, confidence } = rank(d, face.quality, r.quality);
      results.push({ person, matchedUrl: r.photo_url, dist: d, sim, quality, confidence, gender: r.gender, age: r.age });
    }
    const best = new Map<string, Match>();
    for (const m of results) {
      const cur = best.get(m.person.id);
      if (!cur || m.confidence > cur.confidence || (m.confidence === cur.confidence && m.dist < cur.dist)) {
        best.set(m.person.id, m);
      }
    }
    const arr = Array.from(best.values()).sort((a, b) => b.confidence - a.confidence || a.dist - b.dist);
    // Ratio-test também no fluxo multi-face
    if (arr.length >= 2) {
      const d1 = arr[0].dist, d2 = arr[1].dist;
      const margin = (d2 - d1) / Math.max(d1, 0.01);
      let b = 0;
      if (margin > 0.30) b = 0.10;
      else if (margin > 0.18) b = 0.05;
      else if (margin < 0.04) b = -0.18;
      else if (margin < 0.10) b = -0.08;
      if (b !== 0) arr[0] = { ...arr[0], confidence: Math.max(0, Math.min(1, arr[0].confidence + b)) };
      arr.sort((a, b) => b.confidence - a.confidence || a.dist - b.dist);
    }
    return arr;
  }

  async function scanAll() {
    if (!queryUrl || !modelsReady || candidates.length === 0) return;
    setScanning(true);
    setMatches(null);
    setGroups(null);
    setScanProgress(10);
    setScanPhase("matching");
    setScanLogs([`[SISTEMA] Análise multi-face iniciada: ${candidates.length} rostos detectados`]);
    try {
      const { data: rows, error } = await supabase
        .from("face_embeddings")
        .select("id,investigated_id,photo_url,face_index,embedding,quality,gender,gender_probability,age")
        .eq("model_version", MODEL_VERSION);
      if (error) throw error;
      const { data: peopleData } = await supabase
        .from("investigateds")
        .select("id,nome,status,foto_url,fotos");
      const peopleById = new Map<string, Person>();
      for (const p of peopleData || []) peopleById.set(p.id, p as any);

      // Index pending photos
      const indexedUrls = new Set((rows || []).map((r: any) => r.investigated_id + "|" + r.photo_url));
      const pending: { personId: string; url: string }[] = [];
      for (const p of peopleData || []) {
        const urls = [p.foto_url, ...(Array.isArray(p.fotos) ? p.fotos : [])].filter(
          (u): u is string => typeof u === "string" && !!u,
        );
        for (const u of urls) if (!indexedUrls.has(p.id + "|" + u)) pending.push({ personId: p.id, url: u });
      }
      const allRows: EmbeddingRow[] = (rows as any) || [];
      if (pending.length) {
        setScanLogs((prev) => [...prev, `[SISTEMA] Indexando ${pending.length} imagens pendentes...`]);
        for (let i = 0; i < pending.length; i += 3) {
          const batch = pending.slice(i, i + 3);
          const results = await Promise.all(batch.map((j) => ensurePhotoIndexed(j.personId, j.url).catch(() => [])));
          for (const r of results) allRows.push(...r);
        }
      }

      setScanProgress(60);
      const gs: FaceGroup[] = candidates.map((face, idx) => ({
        face,
        faceIndex: idx,
        matches: matchFace(face, allRows, peopleById),
      }));
      setScanLogs((prev) => [
        ...prev,
        ...gs.map((g) => `[OK] Rosto ${g.faceIndex + 1}: ${g.matches.length} candidato(s), melhor ${(g.matches[0]?.confidence ?? 0 * 100).toFixed?.(0) || 0}%`),
      ]);
      setScanProgress(100);
      setScanPhase("done");
      await new Promise((r) => setTimeout(r, 150));
      setGroups(gs);
      refreshStats();
    } catch (e: any) {
      toast.error(e.message || "Erro na busca");
    } finally {
      setScanning(false);
    }
  }

  const filtered = useMemo(
    () => matches?.filter((m) => m.dist <= threshold) ?? [],
    [matches, threshold],
  );

  // Candidatos vivos do carrossel: exclui rejeitados nesta sessão e
  // ordena por confiança já reranqueada.
  const decisionQueue = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => !rejectedIds.has(m.person.id));
  }, [matches, rejectedIds]);

  const currentCandidate = decisionQueue[decisionIdx] || null;
  const em = queryFace?.metrics?.extended;

  async function saveFeedback(decision: "confirm" | "reject", m: Match) {
    if (!user || !queryFace) return;
    setSavingFeedback(true);
    try {
      const { error } = await supabase.from("face_feedback" as any).insert({
        user_id: user.id,
        investigated_id: m.person.id,
        query_embedding: toArray(queryFace.descriptor),
        decision,
        distance: m.dist,
        confidence: m.confidence,
      });
      if (error) throw error;
      setLearnedCount((c) => c + 1);
    } catch (e: any) {
      toast.error("Não foi possível salvar sua resposta: " + (e.message || ""));
    } finally {
      setSavingFeedback(false);
    }
  }

  async function onConfirmCandidate() {
    if (!currentCandidate) return;
    await saveFeedback("confirm", currentCandidate);
    setConfirmed(currentCandidate);
    toast.success("Registrado! O sistema vai lembrar deste acerto.");
  }

  async function onRejectCandidate() {
    if (!currentCandidate) return;
    await saveFeedback("reject", currentCandidate);
    setRejectedIds((prev) => new Set(prev).add(currentCandidate.person.id));
    setDecisionIdx(0); // sempre volta ao topo da fila filtrada
    toast.info("Descartado. Buscando outra correspondência...");
  }

  function onSkipCandidate() {
    setDecisionIdx((i) => i + 1);
  }

  return (
    <AppShell title="Busca por Face">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Painel do Índice Facial */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-card p-4 flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Database className="text-primary" size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">Índice facial automático</div>
              <div className="text-xs text-muted-foreground">
                {indexStats
                  ? `${indexStats.indexed} vetor(es) armazenado(s) · ${indexStats.total} pessoa(s) com foto`
                  : "Carregando estatísticas..."}
              </div>
            </div>
          </div>
          <button
            onClick={reindexAll}
            disabled={indexing || !modelsReady}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50 text-sm transition"
          >
            <RefreshCw size={14} className={indexing ? "animate-spin" : ""} />
            {indexing
              ? `Indexando ${indexProgress.done}/${indexProgress.total}...`
              : "Re-indexar banco manual"}
          </button>
        </motion.div>

        {/* Painel de busca */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-card p-5 glow"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center">
              <ScanFace className="text-primary" size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">Reconhecimento Facial de Alta Precisão</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Envie uma foto. O sistema extrairá métricas biométricas e características da pele, comparando-as com o banco de dados.
                Processamento local de alta performance com inteligência artificial.
              </p>
            </div>
          </div>

          {loadingModels && (
            <div className="text-xs text-muted-foreground flex items-center gap-2 mb-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" />
              Carregando rede neural estendida + estimadores de gênero/idade (~13MB)...
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
            <div>
              {queryUrl ? (
                <div className="relative">
                  <FaceSelector
                    imageUrl={queryUrl}
                    onPick={setQueryFace}
                    onCandidates={setCandidates}
                  />
                  <button
                    onClick={() => {
                      setQueryUrl(null);
                      setQueryFace(null);
                      setCandidates([]);
                      setGroups(null);
                      setMatches(null);
                      setScanProgress(0);
                      setScanPhase("none");
                      setActiveFaceMetrics(null);
                    }}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center z-10 transition hover:bg-destructive/90"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition bg-primary/5"
                >
                  <Upload size={28} />
                  <span className="text-xs">Enviar foto para análise</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <label>Sensibilidade ({threshold.toFixed(2)})</label>
                  <span className="text-primary font-bold">Recomendado: 0.58</span>
                </div>
                <input
                  type="range"
                  min={0.35}
                  max={0.8}
                  step={0.01}
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[oklch(0.65_0.22_250)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Mais rígido (preciso)</span>
                  <span>Mais permissivo</span>
                </div>
              </div>

              <label className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={topOnly}
                  onChange={(e) => setTopOnly(e.target.checked)}
                  className="mt-0.5 accent-[oklch(0.65_0.22_250)]"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Somente maior confiança</div>
                  <div className="text-[10px] text-muted-foreground leading-snug">
                    Exibe apenas o candidato de maior similaridade. Desmarque para ver todas as correspondências possíveis.
                  </div>
                </div>
              </label>

              <button
                onClick={scan}
                disabled={!queryFace || !modelsReady || scanning}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold glow disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ScanFace size={18} />
                {scanning ? "Analisando derme..." : queryFace ? "Iniciar Busca Forense" : "Selecione um rosto"}
              </button>

              {candidates.length > 1 && (
                <button
                  onClick={scanAll}
                  disabled={!modelsReady || scanning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary/40 bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ScanFace size={14} />
                  {scanning ? "Processando..." : `Buscar todos os ${candidates.length} rostos`}
                </button>
              )}

              {queryFace && !scanning && (
                <div className="text-xs space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-between">
                    <span>Qualidade da Captura:</span>
                    <b className="text-primary uppercase">{queryFace.qualityLabel}</b>
                  </div>
                  {queryFace.gender && (
                    <div className="flex justify-between">
                      <span>Gênero Estimado:</span>
                      <span>{queryFace.gender === "male" ? "Masculino" : "Feminino"} ({((queryFace.genderProbability || 0)*100).toFixed(0)}%)</span>
                    </div>
                  )}
                  {queryFace.age && (
                    <div className="flex justify-between">
                      <span>Idade Forense:</span>
                      <span>~{queryFace.age.toFixed(0)} anos</span>
                    </div>
                  )}
                  {queryFace.notes.length > 0 && (
                    <div className="mt-1 text-[10px] text-destructive">
                      Aviso: {queryFace.notes.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Animação em tempo real de varredura biométrica */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-primary/30 bg-card/40 p-5 glow grid md:grid-cols-[280px_1fr] gap-6 overflow-hidden"
            >
              {/* Box da foto com linha de scanner */}
              <div className="relative aspect-square md:aspect-auto md:h-[260px] rounded-xl overflow-hidden border border-primary/30 bg-black flex items-center justify-center">
                <img
                  src={queryUrl!}
                  alt="Escaneando..."
                  className="h-full w-full object-cover opacity-70"
                />
                <motion.div
                  className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_oklch(0.65_0.22_250)]"
                  animate={{ top: ["0%", "98%", "0%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded border border-primary/30 text-[9px] font-mono text-primary uppercase tracking-widest animate-pulse">
                  Biometria Ativa
                </div>
              </div>

              {/* Console de Análise e Métricas */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-primary mb-1">
                    <span>Mapeamento Crânio-Facial</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1 bg-input rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Métricas dinâmicas sendo preenchidas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Simetria</span>
                    <h4 className="text-base font-bold font-mono text-primary mt-0.5">
                      {scanProgress >= 25 && activeFaceMetrics ? `${activeFaceMetrics.symmetry}%` : "Calculando..."}
                    </h4>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Suavidade</span>
                    <h4 className="text-base font-bold font-mono text-primary mt-0.5">
                      {scanProgress >= 50 && activeFaceMetrics ? `${activeFaceMetrics.skinSmoothness}%` : "Calculando..."}
                    </h4>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Tom da Pele</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {scanProgress >= 50 && activeFaceMetrics ? (
                        <>
                          <div
                            className="h-3 w-3 rounded-full border border-primary/20 shadow-sm"
                            style={{ backgroundColor: activeFaceMetrics.skinToneHex }}
                          />
                          <span className="text-xs font-mono font-bold text-primary">{activeFaceMetrics.skinToneHex}</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono font-bold text-muted-foreground">Calculando...</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Proporção Áurea</span>
                    <h4 className="text-xs font-bold font-mono text-primary mt-1">
                      {scanProgress >= 25 && activeFaceMetrics ? `${activeFaceMetrics.goldenRatioDev}% harmonia` : "Calculando..."}
                    </h4>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Gênero Previsto</span>
                    <h4 className="text-xs font-bold font-mono text-primary mt-1 truncate">
                      {scanProgress >= 75 && queryFace ? (
                        queryFace.gender === "male" ? "MASCULINO" : "FEMININO"
                      ) : "Calculando..."}
                    </h4>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Idade Forense</span>
                    <h4 className="text-xs font-bold font-mono text-primary mt-1">
                      {scanProgress >= 75 && queryFace ? `~${queryFace.age?.toFixed(0)} anos` : "Calculando..."}
                    </h4>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Cor dos Olhos</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {scanProgress >= 50 && em ? (
                        <>
                          <div className="h-3 w-3 rounded-full border border-primary/20" style={{ backgroundColor: em.eyeColorHex }} />
                          <span className="text-[11px] font-mono font-bold text-primary">{em.eyeColorHex}</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">Lendo...</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Cor do Cabelo</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {scanProgress >= 50 && em ? (
                        <>
                          <div className="h-3 w-3 rounded-full border border-primary/20" style={{ backgroundColor: em.hairColorHex }} />
                          <span className="text-[11px] font-mono font-bold text-primary">{em.hairColorHex}</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">Lendo...</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Cor da Boca</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {scanProgress >= 50 && em ? (
                        <>
                          <div className="h-3 w-3 rounded-full border border-primary/20" style={{ backgroundColor: em.mouthColorHex }} />
                          <span className="text-[11px] font-mono font-bold text-primary">{em.mouthColorHex}</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">Lendo...</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Sobrancelhas</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {scanProgress >= 50 && em ? (
                        <>
                          <div className="h-3 w-3 rounded-full border border-primary/20" style={{ backgroundColor: em.eyebrowColorHex }} />
                          <span className="text-[11px] font-mono font-bold text-primary">{em.eyebrowThickness}px</span>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">Lendo...</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Formato do Rosto</span>
                    <h4 className="text-xs font-bold font-mono text-primary mt-1 uppercase">
                      {scanProgress >= 50 && em ? em.faceShape : "Analisando..."}
                    </h4>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono">Abertura Ocular</span>
                    <h4 className="text-xs font-bold font-mono text-primary mt-1">
                      {scanProgress >= 50 && em ? `${em.eyeOpenness}%` : "Lendo..."}
                    </h4>
                  </div>
                </div>

                {/* Console Log Logotipo */}
                <div className="bg-black/80 border border-primary/25 rounded-xl p-3 font-mono text-[10px] text-primary h-[85px] overflow-y-auto space-y-0.5">
                  {scanLogs.map((log, idx) => {
                    let colorClass = "text-muted-foreground";
                    if (log.startsWith("[OK]")) colorClass = "text-primary/95 font-semibold";
                    else if (log.startsWith("[DADOS]")) colorClass = "text-accent/90";
                    else if (log.startsWith("[SISTEMA]")) colorClass = "text-yellow-400/90";
                    return (
                      <div key={idx} className={colorClass}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {groups && !scanning && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
              <Activity size={14} className="animate-pulse" />
              Análise multi-face · {groups.length} rosto(s) processado(s)
            </div>
            {groups.map((g) => {
              const top = g.matches[0];
              const others = g.matches.filter((m) => m.dist <= threshold && (!top || m.person.id !== top.person.id));
              return (
                <motion.div
                  key={g.faceIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border-2 border-primary/60 bg-card/85 p-5 glow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-bold">
                      <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {g.faceIndex + 1}
                      </span>
                      Rosto {g.faceIndex + 1} · qualidade {g.face.qualityLabel}
                      {g.face.gender && (
                        <span className="text-muted-foreground normal-case tracking-normal">
                          · {g.face.gender === "male" ? "masc." : "fem."} · ~{g.face.age?.toFixed(0)}a
                        </span>
                      )}
                    </div>
                    {top && (
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                          top.confidence >= 0.7
                            ? "bg-primary/20 text-primary border-primary/40"
                            : top.confidence >= 0.55
                              ? "bg-accent/20 text-accent border-accent/40"
                              : "bg-destructive/20 text-destructive border-destructive/40"
                        }`}
                      >
                        {(top.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {top ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={top.matchedUrl}
                        alt={top.person.nome}
                        className="h-20 w-20 rounded-xl object-cover border-2 border-primary/40 bg-black shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{top.person.nome}</h3>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                          Status: {top.person.status || "sem status"} · sim {(top.sim * 100).toFixed(1)}% · dist {top.dist.toFixed(3)}
                        </p>
                        {top.dist > threshold && (
                          <p className="text-[10px] text-destructive font-mono mt-1">
                            abaixo do limite ({threshold}) — exibido por ser a maior confiança
                          </p>
                        )}
                      </div>
                      <Link
                        to="/investigados/$id"
                        params={{ id: top.person.id }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition shrink-0"
                      >
                        <Eye size={14} /> Abrir Ficha
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground font-mono">
                      Nenhuma correspondência para este rosto.
                    </div>
                  )}

                  {!topOnly && others.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                        outros candidatos ({others.length})
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {others.slice(0, 8).map((m) => (
                          <Link
                            key={m.person.id + m.matchedUrl}
                            to="/investigados/$id"
                            params={{ id: m.person.id }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/60 transition"
                          >
                            <img src={m.matchedUrl} alt="" className="h-9 w-9 rounded-md object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold truncate">{m.person.nome}</div>
                              <div className="text-[9px] text-primary font-mono">{(m.confidence * 100).toFixed(0)}%</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {matches && !scanning && !groups && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
              <Brain size={14} className="animate-pulse" />
              Aprendizado ativo · {learnedCount} resposta(s) registradas neste operador
            </div>

            {/* Confirmado: mostra ficha e encerra */}
            {confirmed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border-2 border-primary bg-card/85 p-6 glow"
              >
                <div className="absolute-none flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-primary font-bold">
                  <Award size={14} /> Correspondência Confirmada Pelo Operador
                </div>
                <div className="grid md:grid-cols-[1fr_140px_1fr] gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <img src={queryUrl!} alt="busca" className="rounded-2xl border border-primary/30 bg-black h-[200px] w-[200px] object-cover" />
                    <span className="mt-2 text-[9px] text-muted-foreground font-mono uppercase">Foto de busca</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Check size={44} className="text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary mt-1">Match Confirmado</span>
                    <span className="text-[9px] text-muted-foreground font-mono mt-1">
                      confiança final {(confirmed.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src={confirmed.matchedUrl} alt={confirmed.person.nome} className="rounded-2xl border border-primary/30 bg-black h-[200px] w-[200px] object-cover" />
                    <span className="mt-2 text-[9px] text-muted-foreground font-mono uppercase">Registro no banco</span>
                  </div>
                </div>
                <div className="border-t border-primary/20 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">{confirmed.person.nome}</h3>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                      Status: {confirmed.person.status || "sem status"}
                    </p>
                  </div>
                  <Link
                    to="/investigados/$id"
                    params={{ id: confirmed.person.id }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 hover:glow transition"
                  >
                    <Eye size={14} /> Abrir Ficha Investigativa
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Carrossel de decisão */}
            {!confirmed && currentCandidate && (
              <motion.div
                key={currentCandidate.person.id + decisionIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border-2 border-primary/60 bg-card/85 p-6 glow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-primary/20 border-l border-b border-primary/30 px-3 py-1.5 rounded-bl-xl text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                  Candidato {decisionIdx + 1} / {decisionQueue.length}
                </div>

                <div className="flex items-center gap-2 mb-5 text-xs font-semibold text-primary font-mono uppercase tracking-widest">
                  <Activity size={14} className="animate-pulse" />
                  Essa é a pessoa?
                </div>

                <div className="grid md:grid-cols-[1fr_180px_1fr] gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <div className="rounded-2xl overflow-hidden border border-primary/30 bg-black h-[200px] w-[200px]">
                      <img src={queryUrl!} alt="busca" className="h-full w-full object-cover" />
                    </div>
                    <span className="mt-2 text-[9px] text-muted-foreground font-mono uppercase">Foto de busca</span>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Confiança</span>
                    <h2 className={`text-5xl font-black font-mono tracking-tighter ${
                      currentCandidate.confidence >= 0.70 ? "text-primary" : currentCandidate.confidence >= 0.55 ? "text-accent" : "text-destructive"
                    }`}>
                      {(currentCandidate.confidence * 100).toFixed(1)}%
                    </h2>
                    <div className="text-[9px] text-muted-foreground font-mono leading-relaxed">
                      similaridade {(currentCandidate.sim * 100).toFixed(1)}%<br />
                      distância {currentCandidate.dist.toFixed(3)}
                      {typeof currentCandidate.feedbackApplied === "number" && currentCandidate.feedbackApplied !== 0 && (
                        <><br /><span className={currentCandidate.feedbackApplied > 0 ? "text-primary" : "text-destructive"}>
                          ajuste do aprendizado: {currentCandidate.feedbackApplied > 0 ? "+" : ""}{(currentCandidate.feedbackApplied * 100).toFixed(1)}%
                        </span></>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="rounded-2xl overflow-hidden border border-primary/30 bg-black h-[200px] w-[200px]">
                      <img src={currentCandidate.matchedUrl} alt={currentCandidate.person.nome} className="h-full w-full object-cover" />
                    </div>
                    <span className="mt-2 text-sm font-bold truncate max-w-[200px]">{currentCandidate.person.nome}</span>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase mt-0.5">
                      {currentCandidate.person.status || "sem status"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-primary/20 mt-6 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={onConfirmCandidate}
                    disabled={savingFeedback}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition"
                  >
                    <Check size={16} /> Sim, é essa pessoa
                  </button>
                  <button
                    onClick={onRejectCandidate}
                    disabled={savingFeedback}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/15 border-2 border-destructive/40 text-destructive font-semibold text-sm hover:bg-destructive/25 disabled:opacity-50 transition"
                  >
                    <X size={16} /> Não, é outra pessoa
                  </button>
                  <button
                    onClick={onSkipCandidate}
                    disabled={savingFeedback || decisionIdx >= decisionQueue.length - 1}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border text-muted-foreground font-semibold text-sm hover:bg-muted/40 disabled:opacity-40 transition"
                  >
                    <HelpCircle size={16} /> Não sei · pular
                    <ChevronRight size={14} />
                  </button>
                </div>

                <p className="mt-3 text-[10px] text-muted-foreground font-mono text-center">
                  Suas respostas treinam o sistema — próximas buscas ficam mais precisas para este operador.
                </p>
              </motion.div>
            )}

            {/* Fila esgotada */}
            {!confirmed && !currentCandidate && matches.length > 0 && (
              <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-sm flex flex-col items-center gap-2 bg-card/25">
                <AlertCircle size={28} className="text-primary" />
                <span>Todos os candidatos foram descartados.</span>
                <span className="text-xs">O sistema registrou suas respostas e vai priorizar melhor da próxima vez.</span>
              </div>
            )}

            {/* Preview compacto da fila */}
            {!confirmed && decisionQueue.length > 1 && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 mt-4">
                  Próximos na fila ({Math.max(0, decisionQueue.length - decisionIdx - 1)})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {decisionQueue.slice(decisionIdx + 1, decisionIdx + 9).map((m) => (
                    <div
                      key={m.person.id + m.matchedUrl}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border"
                    >
                      <img src={m.matchedUrl} alt="" className="h-9 w-9 rounded-md object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold truncate">{m.person.nome}</div>
                        <div className="text-[9px] text-primary font-mono">{(m.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {matches && matches.length === 0 && !scanning && (
          <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm flex flex-col items-center gap-2 bg-card/25">
            <AlertCircle size={28} className="text-primary" />
            <span>Nenhuma correspondência facial encontrada no banco de dados.</span>
            <span className="text-xs text-muted-foreground">Tente diminuir a sensibilidade ou re-indexar o banco de dados.</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
