import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import {
  Users,
  Upload,
  Network,
  ScanFace,
  Search,
  Plus,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  FileImage,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { cq, cqCount } from "@/lib/offline-cache";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | JTC CDI" },
      {
        name: "description",
        content: "Visão operacional de pessoas, arquivos, vínculos e buscas do JTC CDI.",
      },
      { property: "og:title", content: "Dashboard | JTC CDI" },
      {
        property: "og:description",
        content: "Visão operacional de pessoas, arquivos, vínculos e buscas do JTC CDI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type RecentPerson = {
  id: string;
  nome: string;
  status: string | null;
  foto_url: string | null;
  created_at: string;
};

type RecentUpload = {
  id: string;
  nome: string;
  url: string | null;
  mime: string | null;
  created_at: string;
};

const STATUS_BAR_COLORS: Record<string, string> = {
  suspeito: "from-red-400 to-red-600",
  investigado: "from-orange-400 to-orange-600",
  testemunha: "from-blue-400 to-blue-600",
  familiar: "from-yellow-300 to-yellow-500",
  contato: "from-green-400 to-green-600",
  desaparecido: "from-fuchsia-400 to-fuchsia-600",
  sem_restricao: "from-emerald-400 to-emerald-500",
  desconhecido: "from-zinc-300 to-zinc-400",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  suspeito: "bg-red-500",
  investigado: "bg-orange-500",
  testemunha: "bg-blue-500",
  familiar: "bg-yellow-400",
  contato: "bg-green-500",
  desaparecido: "bg-fuchsia-500",
  sem_restricao: "bg-emerald-400",
  desconhecido: "bg-zinc-400",
};

function statusColor(label: string): { bar: string; dot: string } {
  return {
    bar: STATUS_BAR_COLORS[label] ?? STATUS_BAR_COLORS.desconhecido,
    dot: STATUS_DOT_COLORS[label] ?? STATUS_DOT_COLORS.desconhecido,
  };
}

function labelize(s: string) {
  return s.replace(/_+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtRelative(iso: string) {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  const days = Math.floor(s / 86400);
  if (days < 30) return `${days} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = "0";
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("pt-BR");
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>{value.toLocaleString("pt-BR")}</span>;
}

function Sparkline({ data }: { data: number[] }) {
  const w = 300;
  const h = 72;
  if (!data.length) return null;
  const max = Math.max(1, ...data);
  const step = w / Math.max(1, data.length - 1);
  const range = Math.max(1, max);
  const points = data.map((v, i) => `${i * step},${h - (v / range) * (h - 8) - 4}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  const lastIdx = data.length - 1;
  const lastX = lastIdx * step;
  const lastY = h - (data[lastIdx] / range) * (h - 8) - 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkStroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sparkFill)" />
      <polyline
        points={points}
        fill="none"
        stroke="url(#sparkStroke)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--accent)" />
    </svg>
  );
}

function Page() {
  const [stats, setStats] = useState({
    invest: 0,
    uploads: 0,
    conn: 0,
    boards: 0,
    faces: 0,
    newWeek: 0,
  });
  const [recentPeople, setRecentPeople] = useState<RecentPerson[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [daily, setDaily] = useState<number[]>([]);

  const loadAll = async () => {
    const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [a, b, c, d, e, weekCount, people, uploads, statusRows, monthRows] = await Promise.all([
      cqCount("count.investigateds", () =>
        supabase.from("investigateds").select("id", { count: "exact", head: true }),
      ),
      cqCount("count.uploads", () =>
        supabase.from("uploads").select("id", { count: "exact", head: true }),
      ),
      cqCount("count.connections", () =>
        supabase.from("connections").select("id", { count: "exact", head: true }),
      ),
      cqCount("count.boards", () =>
        supabase.from("boards").select("id", { count: "exact", head: true }),
      ),
      cqCount("count.faces", () =>
        supabase.from("face_embeddings").select("id", { count: "exact", head: true }),
      ),
      cqCount("count.week", () =>
        supabase
          .from("investigateds")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo),
      ),
      cq<RecentPerson[]>("dash.people", () =>
        supabase
          .from("investigateds")
          .select("id,nome,status,foto_url,created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ),
      cq<RecentUpload[]>("dash.uploads", () =>
        supabase
          .from("uploads")
          .select("id,nome,url,mime,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ),
      cq<{ status: string | null }[]>("dash.status", () =>
        supabase.from("investigateds").select("status"),
      ),
      cq<{ created_at: string }[]>("dash.month", () =>
        supabase.from("investigateds").select("created_at").gte("created_at", monthAgo),
      ),
    ]);
    setStats({
      invest: a,
      uploads: b,
      conn: c,
      boards: d,
      faces: e,
      newWeek: weekCount,
    });
    setRecentPeople((people.data as RecentPerson[]) ?? []);
    setRecentUploads((uploads.data as RecentUpload[]) ?? []);
    const st: Record<string, number> = {};
    for (const r of (statusRows.data ?? []) as { status: string | null }[]) {
      const k = (r.status || "sem status").toLowerCase();
      st[k] = (st[k] || 0) + 1;
    }
    setByStatus(st);
    // Buckets diários dos últimos 30 dias
    const buckets = new Array(30).fill(0);
    const now = Date.now();
    for (const r of (monthRows.data ?? []) as { created_at: string }[]) {
      const days = Math.floor((now - new Date(r.created_at).getTime()) / 86400_000);
      const idx = 29 - days;
      if (idx >= 0 && idx < 30) buckets[idx]++;
    }
    setDaily(buckets);
  };

  useEffect(() => {
    loadAll();
  }, []);
  useRealtime(["investigateds", "uploads", "connections", "boards", "face_embeddings"], loadAll);

  const statusList = useMemo(
    () =>
      Object.entries(byStatus)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [byStatus],
  );
  const totalStatus = useMemo(() => Object.values(byStatus).reduce((a, b) => a + b, 0), [byStatus]);

  const kpis = [
    { label: "Pessoas", value: stats.invest, icon: Users, hint: `${stats.newWeek} na semana` },
    { label: "Arquivos", value: stats.uploads, icon: Upload, hint: "todos os anexos" },
    { label: "Conexões", value: stats.conn, icon: Network, hint: "vínculos" },
    { label: "Rostos", value: stats.faces, icon: ScanFace, hint: "busca facial" },
    { label: "Painéis", value: stats.boards, icon: Sparkles, hint: "quadros visuais" },
    { label: "Sistema ativo", value: "100%", icon: ShieldCheck, hint: "criptografia ok" },
  ];

  const quick = [
    { to: "/investigados", label: "Nova pessoa", icon: Plus, desc: "Cadastrar" },
    { to: "/face-search", label: "Buscar por face", icon: ScanFace, desc: "Foto → rosto" },
    { to: "/pesquisa", label: "Pesquisa avançada", icon: Search, desc: "Filtros ricos" },
    { to: "/uploads", label: "Enviar arquivo", icon: Upload, desc: "Documentos e fotos" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Hero — leitura principal */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium scan-line relative overflow-hidden p-6 lg:p-8"
        >
          <div className="aurora" aria-hidden />
          <div className="noise absolute inset-0" aria-hidden />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary glow animate-pulse" />
                Total de pessoas cadastradas
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-6xl leading-none tracking-tighter gradient-text lg:text-7xl">
                  <CountUp value={stats.invest} />
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary glow-text">
                  {stats.newWeek > 0 ? `+${stats.newWeek} na semana` : "estável"}
                </span>
              </div>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                {stats.faces} vetor(es) faciais prontos para busca instantânea e {stats.uploads}{" "}
                arquivos indexados.
              </p>
            </div>
            <div className="relative w-full shrink-0 md:w-80">
              <div className="glass rounded-2xl p-4">
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <Activity size={12} className="text-primary" /> Atividade
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    30 dias
                  </span>
                </div>
                <div className="mt-3">
                  <Sparkline data={daily} />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* KPI strip */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {kpis.map((c, i) => {
            const Icon = c.icon;
            const isDelta = i === 0;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.05 }}
                className="card-premium hover-lift group p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {c.label}
                    </div>
                    <div className="mt-2 font-display text-2xl leading-none">
                      {typeof c.value === "number" ? <CountUp value={c.value} /> : c.value}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={17} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`h-1 w-1 rounded-full ${isDelta ? "bg-accent glow" : "bg-primary/50"}`}
                  />
                  <span className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                    {c.hint}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Ações rápidas + Status */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card-premium p-6 lg:col-span-2">
            <h3 className="flex items-center gap-3 font-display text-sm uppercase tracking-wider">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Sparkles size={13} />
              </span>
              Ações rápidas
              <span className="h-px flex-1 bg-border" />
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quick.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="hover-lift group flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary transition-all group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground">
                    <q.icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{q.label}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      {q.desc}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="card-premium p-6">
            <h3 className="flex items-center gap-3 font-display text-sm uppercase tracking-wider">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Users size={13} />
              </span>
              Status
              <span className="h-px flex-1 bg-border" />
            </h3>
            {statusList.length === 0 ? (
              <p className="pt-6 text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {statusList.map(([label, n]) => {
                  const pct = totalStatus ? (n / totalStatus) * 100 : 0;
                  const { bar, dot } = statusColor(label);
                  return (
                    <div key={label} className="group">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                          <span className="truncate">{labelize(label)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          {n} · {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-700`}
                          style={{ width: `${Math.max(3, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Listas */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="card-premium p-6">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em]">
                <Users size={14} className="text-primary" /> Pessoas recentes
              </h4>
              <Link
                to="/investigados"
                className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:underline"
              >
                Ver todas <ArrowUpRight size={11} />
              </Link>
            </div>
            {recentPeople.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma pessoa cadastrada ainda.
              </p>
            ) : (
              <div className="mt-5 space-y-2">
                {recentPeople.map((p) => {
                  const { dot } = statusColor((p.status ?? "desconhecido").toLowerCase());
                  return (
                    <Link
                      key={p.id}
                      to="/investigados/$id"
                      params={{ id: p.id }}
                      className="hover-lift group flex items-center gap-4 rounded-xl border border-border bg-card p-3"
                    >
                      <div className="relative shrink-0">
                        {p.foto_url ? (
                          <img
                            src={p.foto_url}
                            alt={p.nome}
                            className="h-11 w-11 rounded-full border border-primary/20 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/20 font-display text-sm text-primary">
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${dot}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                          {p.nome}
                        </div>
                        <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span className="text-primary">
                            {p.status ? labelize(p.status) : "sem status"}
                          </span>
                          <span className="mx-1.5 opacity-50">·</span>
                          {fmtRelative(p.created_at)}
                        </div>
                      </div>
                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-primary"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em]">
                <FileImage size={14} className="text-primary" /> Últimos arquivos
              </h4>
              <Link
                to="/uploads"
                className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:underline"
              >
                Todos <ArrowUpRight size={11} />
              </Link>
            </div>
            {recentUploads.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum arquivo enviado ainda.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {recentUploads.map((u) => {
                  const isImg = u.mime?.startsWith("image/");
                  return (
                    <a
                      key={u.id}
                      href={u.url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60"
                    >
                      {isImg && u.url ? (
                        <img
                          src={u.url}
                          alt={u.nome}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card to-secondary">
                          <FileImage className="text-muted-foreground" size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent px-2 pb-1.5 pt-5">
                        <div className="truncate text-[8px] font-bold uppercase tracking-tight">
                          {u.nome}
                        </div>
                        <div className="text-[8px] text-muted-foreground">
                          {fmtRelative(u.created_at)}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
