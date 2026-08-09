import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Upload, Network, Activity, ScanFace, Search,
  Plus, ArrowUpRight, Sparkles, ShieldCheck, FileImage, Zap,
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
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden card-premium noise p-6 lg:p-8"
      >
        <div className="absolute inset-0 aurora opacity-70" />
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute inset-0 scan-line" />
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse glow" />
              Central de investigação · JTCQI+
            </div>
            <h2 className="mt-2 text-3xl lg:text-4xl font-display font-bold gradient-text">
              {stats.invest} {stats.invest === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              {stats.newWeek > 0
                ? `${stats.newWeek} nova(s) nos últimos 7 dias. `
                : "Sem novos cadastros nesta semana. "}
              {stats.faces} vetor(es) faciais prontos para busca instantânea.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/investigados" className="btn-interactive rounded-lg bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 flex items-center gap-1.5 glow">
                <Plus size={13} /> Nova pessoa
              </Link>
              <Link to="/face-search" className="rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 hover:bg-primary/20 transition">
                <ScanFace size={13} /> Buscar por face
              </Link>
            </div>
          </div>
          <div className="relative w-full lg:w-[340px] rounded-xl border border-border/60 bg-background/40 backdrop-blur p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Ingressos · últimos 30 dias
            </div>
            <Sparkline data={daily} />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
              <span>30d atrás</span>
              <span className="text-primary font-semibold">hoje</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`relative overflow-hidden rounded-xl border border-border/70 bg-card/60 backdrop-blur p-4 bg-gradient-to-br ${c.tint} to-transparent hover-glow`}
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{c.hint}</span>
            </div>
            <div className="mt-3 text-2xl font-display font-bold truncate">{c.value}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Grid principal */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ações rápidas */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 rounded-2xl border border-primary/20 bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-primary" size={16} />
            <h3 className="font-semibold">Ações rápidas</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quick.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="group flex flex-col gap-1 rounded-xl border border-border p-3 hover:border-primary/60 hover:bg-primary/5 transition"
              >
                <q.icon size={16} className="text-primary" />
                <div className="text-sm font-semibold">{q.label}</div>
                <div className="text-[10px] text-muted-foreground">{q.desc}</div>
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-primary" size={14} />
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Por status</h4>
            </div>
            {statusList.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <div className="space-y-2">
                {statusList.map(([label, n]) => {
                  const pct = totalStatus ? (n / totalStatus) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize truncate">{label}</span>
                        <span className="text-muted-foreground">{n}</span>
                      </div>
                      <div className="h-1.5 bg-input rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Pessoas recentes */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl border border-primary/20 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="text-primary" size={16} />
              <h3 className="font-semibold">Pessoas recentes</h3>
            </div>
            <Link to="/investigados" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight size={12} />
            </Link>
          </div>
          {recentPeople.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhuma pessoa cadastrada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentPeople.map((p) => (
                <Link
                  key={p.id}
                  to="/investigados/$id"
                  params={{ id: p.id }}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/50 hover:bg-primary/5 transition"
                >
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nome} className="h-11 w-11 rounded-lg object-cover border border-primary/30" />
                  ) : (
                    <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold">
                      {p.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate text-sm">{p.nome}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                      {p.status || "sem status"} · {fmtRelative(p.created_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Uploads recentes */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="mt-4 rounded-2xl border border-primary/20 bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileImage className="text-primary" size={16} />
            <h3 className="font-semibold">Últimos arquivos</h3>
          </div>
          <Link to="/uploads" className="text-xs text-primary hover:underline flex items-center gap-1">
            Todos <ArrowUpRight size={12} />
          </Link>
        </div>
        {recentUploads.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Nenhum arquivo enviado ainda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentUploads.map((u) => {
              const isImg = u.mime?.startsWith("image/");
              return (
                <a
                  key={u.id}
                  href={u.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-border overflow-hidden hover:border-primary/60 transition"
                >
                  <div className="aspect-square bg-input flex items-center justify-center overflow-hidden">
                    {isImg && u.url ? (
                      <img src={u.url} alt={u.nome} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <FileImage className="text-muted-foreground" size={28} />
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] font-medium truncate">{u.nome}</div>
                    <div className="text-[9px] text-muted-foreground">{fmtRelative(u.created_at)}</div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
