import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Upload, Network, ScanFace, Search,
  Plus, ArrowUpRight, Sparkles, ShieldCheck, FileImage,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/dashboard")({ component: Page });

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

function Sparkline({ data }: { data: number[] }) {
  const w = 260;
  const h = 60;
  if (!data.length) return null;
  const max = Math.max(1, ...data);
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg width={w} height={h} className="w-full">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sparkFill)" />
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="2" />
    </svg>
  );
}

function Page() {
  const [stats, setStats] = useState({
    invest: 0, uploads: 0, conn: 0, boards: 0, faces: 0, newWeek: 0,
  });
  const [recentPeople, setRecentPeople] = useState<RecentPerson[]>([]);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [daily, setDaily] = useState<number[]>([]);

  const loadAll = async () => {
    const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [a, b, c, d, e, weekCount, people, uploads, statusRows, monthRows] = await Promise.all([
      supabase.from("investigateds").select("id", { count: "exact", head: true }),
      supabase.from("uploads").select("id", { count: "exact", head: true }),
      supabase.from("connections").select("id", { count: "exact", head: true }),
      supabase.from("boards").select("id", { count: "exact", head: true }),
      supabase.from("face_embeddings").select("id", { count: "exact", head: true }),
      supabase.from("investigateds").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("investigateds").select("id,nome,status,foto_url,created_at").order("created_at", { ascending: false }).limit(6),
      supabase.from("uploads").select("id,nome,url,mime,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("investigateds").select("status"),
      supabase.from("investigateds").select("created_at").gte("created_at", monthAgo),
    ]);
    setStats({
      invest: a.count ?? 0,
      uploads: b.count ?? 0,
      conn: c.count ?? 0,
      boards: d.count ?? 0,
      faces: e.count ?? 0,
      newWeek: weekCount.count ?? 0,
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

  useEffect(() => { loadAll(); }, []);
  useRealtime(["investigateds", "uploads", "connections", "boards", "face_embeddings"], loadAll);

  const statusList = useMemo(
    () => Object.entries(byStatus).sort((a, b) => b[1] - a[1]).slice(0, 5),
    [byStatus],
  );
  const totalStatus = useMemo(() => Object.values(byStatus).reduce((a, b) => a + b, 0), [byStatus]);

  const kpis = [
    { label: "Pessoas", value: stats.invest, icon: Users, hint: `${stats.newWeek} na semana`, tint: "from-emerald-500/25" },
    { label: "Arquivos", value: stats.uploads, icon: Upload, hint: "todos os anexos", tint: "from-cyan-500/25" },
    { label: "Conexões", value: stats.conn, icon: Network, hint: "vínculos entre pessoas", tint: "from-lime-500/25" },
    { label: "Rostos indexados", value: stats.faces, icon: ScanFace, hint: "busca facial pronta", tint: "from-fuchsia-500/25" },
    { label: "Painéis", value: stats.boards, icon: Sparkles, hint: "quadros visuais", tint: "from-amber-500/25" },
    { label: "Sistema", value: "ATIVO", icon: ShieldCheck, hint: "criptografia ok", tint: "from-primary/25" },
  ];

  const quick = [
    { to: "/investigados", label: "Nova pessoa", icon: Plus, desc: "Cadastrar" },
    { to: "/face-search", label: "Buscar por face", icon: ScanFace, desc: "Foto → rosto" },
    { to: "/pesquisa", label: "Pesquisa avançada", icon: Search, desc: "Filtros ricos" },
    { to: "/uploads", label: "Enviar arquivo", icon: Upload, desc: "Documentos e fotos" },
  ];

  return (
    <AppShell title="Dashboard">
      <div className="overflow-hidden rounded-xl border border-border bg-background/40 shadow-[0_0_50px_-12px_oklch(0.54_0.23_285/0.25)]">
        {/* Hero — leitura principal */}
        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative border-b border-border bg-gradient-to-b from-card/40 to-transparent p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary font-sans">
                Total de pessoas cadastradas
              </h2>
              <div className="mt-2 flex flex-wrap items-baseline gap-4">
                <span className="font-display text-5xl lg:text-6xl tracking-tighter">{stats.invest}</span>
                <span className="rounded border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
                  {stats.newWeek > 0 ? `+${stats.newWeek} na semana` : "estável"}
                </span>
              </div>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                {stats.faces} vetor(es) faciais prontos para busca instantânea.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Sparkline data={daily} />
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase text-primary">
                <span>30d atrás</span>
                <span>histórico 30 dias</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* KPI strip */}
        <section className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="group bg-background p-5 transition-colors hover:bg-card"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                <c.icon className="h-3 w-3" />
                {c.label}
              </div>
              <div className="mt-1 font-display text-xl truncate">{c.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{c.hint}</div>
            </motion.div>
          ))}
        </section>

        {/* Ações rápidas + Status */}
        <section className="flex flex-col gap-8 p-6 lg:flex-row lg:p-8">
          <div className="flex-1 space-y-5">
            <h3 className="flex items-center gap-3 font-display text-sm uppercase tracking-wider">
              Ações rápidas <span className="h-px flex-1 bg-border" />
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quick.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate">{q.label}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{q.desc}</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary transition-colors group-hover:bg-primary">
                    <q.icon size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full space-y-5 lg:w-80">
            <h3 className="flex items-center gap-3 font-display text-sm uppercase tracking-wider">
              Status <span className="h-px flex-1 bg-border" />
            </h3>
            {statusList.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <div className="space-y-4">
                {statusList.map(([label, n]) => {
                  const pct = totalStatus ? (n / totalStatus) * 100 : 0;
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="truncate text-primary">{label}</span>
                        <span>{n}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary glow" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Listas */}
        <section className="grid grid-cols-1 gap-8 border-t border-border bg-card/20 p-6 lg:grid-cols-2 lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xs uppercase tracking-[0.2em]">Pessoas recentes</h4>
              <Link to="/investigados" className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:underline">
                Ver todas <ArrowUpRight size={11} />
              </Link>
            </div>
            {recentPeople.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma pessoa cadastrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {recentPeople.map((p) => (
                  <Link
                    key={p.id}
                    to="/investigados/$id"
                    params={{ id: p.id }}
                    className="flex items-center gap-4 rounded border border-border bg-card p-3 transition-colors hover:bg-secondary"
                  >
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={p.nome} className="h-10 w-10 rounded border border-primary/20 object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/20 bg-background text-xs font-bold text-primary">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.nome}</div>
                      <div className="truncate text-[10px] uppercase text-primary">
                        {p.status || "sem status"} · {fmtRelative(p.created_at)}
                      </div>
                    </div>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent glow" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xs uppercase tracking-[0.2em]">Últimos arquivos</h4>
              <Link to="/uploads" className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:underline">
                Todos <ArrowUpRight size={11} />
              </Link>
            </div>
            {recentUploads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhum arquivo enviado ainda.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {recentUploads.map((u) => {
                  const isImg = u.mime?.startsWith("image/");
                  return (
                    <a
                      key={u.id}
                      href={u.url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-square rounded border border-border bg-background p-1 transition-colors hover:border-primary"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded bg-card">
                        {isImg && u.url ? (
                          <img src={u.url} alt={u.nome} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileImage className="text-muted-foreground" size={22} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-1.5 pb-1 pt-4">
                          <div className="truncate text-[8px] font-bold uppercase tracking-tighter">{u.nome}</div>
                          <div className="text-[8px] text-muted-foreground">{fmtRelative(u.created_at)}</div>
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
