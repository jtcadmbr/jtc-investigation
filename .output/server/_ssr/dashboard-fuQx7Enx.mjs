import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { u as useRealtime } from "./use-realtime-DcZylE8C.mjs";
import "../_libs/sonner.mjs";
import { a as Users, U as Upload, N as Network, g as ScanFace, s as Sparkles, t as ShieldCheck, Z as Zap, u as Plus, S as Search, p as Activity, v as ArrowUpRight, w as FileImage } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";

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
function fmtRelative(iso) {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1e3);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  const days = Math.floor(s / 86400);
  if (days < 30) return `${days} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}
function Sparkline({
  data
}) {
  const w = 260;
  const h = 60;
  if (!data.length) return null;
  const max = Math.max(1, ...data);
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - v / max * (h - 4) - 2}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: w, height: h, className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "sparkFill", x1: "0", x2: "0", y1: "0", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--primary)", stopOpacity: "0.4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--primary)", stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: area, fill: "url(#sparkFill)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points, fill: "none", stroke: "var(--primary)", strokeWidth: "2" })
  ] });
}
function Page() {
  const [stats, setStats] = reactExports.useState({
    invest: 0,
    uploads: 0,
    conn: 0,
    boards: 0,
    faces: 0,
    newWeek: 0
  });
  const [recentPeople, setRecentPeople] = reactExports.useState([]);
  const [recentUploads, setRecentUploads] = reactExports.useState([]);
  const [byStatus, setByStatus] = reactExports.useState({});
  const [daily, setDaily] = reactExports.useState([]);
  const loadAll = async () => {
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString();
    const [a, b, c, d, e, weekCount, people, uploads, statusRows, monthRows] = await Promise.all([supabase.from("investigateds").select("id", {
      count: "exact",
      head: true
    }), supabase.from("uploads").select("id", {
      count: "exact",
      head: true
    }), supabase.from("connections").select("id", {
      count: "exact",
      head: true
    }), supabase.from("boards").select("id", {
      count: "exact",
      head: true
    }), supabase.from("face_embeddings").select("id", {
      count: "exact",
      head: true
    }), supabase.from("investigateds").select("id", {
      count: "exact",
      head: true
    }).gte("created_at", weekAgo), supabase.from("investigateds").select("id,nome,status,foto_url,created_at").order("created_at", {
      ascending: false
    }).limit(6), supabase.from("uploads").select("id,nome,url,mime,created_at").order("created_at", {
      ascending: false
    }).limit(5), supabase.from("investigateds").select("status"), supabase.from("investigateds").select("created_at").gte("created_at", monthAgo)]);
    setStats({
      invest: a.count ?? 0,
      uploads: b.count ?? 0,
      conn: c.count ?? 0,
      boards: d.count ?? 0,
      faces: e.count ?? 0,
      newWeek: weekCount.count ?? 0
    });
    setRecentPeople(people.data ?? []);
    setRecentUploads(uploads.data ?? []);
    const st = {};
    for (const r of statusRows.data ?? []) {
      const k = (r.status || "sem status").toLowerCase();
      st[k] = (st[k] || 0) + 1;
    }
    setByStatus(st);
    const buckets = new Array(30).fill(0);
    const now = Date.now();
    for (const r of monthRows.data ?? []) {
      const days = Math.floor((now - new Date(r.created_at).getTime()) / 864e5);
      const idx = 29 - days;
      if (idx >= 0 && idx < 30) buckets[idx]++;
    }
    setDaily(buckets);
  };
  reactExports.useEffect(() => {
    loadAll();
  }, []);
  useRealtime(["investigateds", "uploads", "connections", "boards", "face_embeddings"], loadAll);
  const statusList = reactExports.useMemo(() => Object.entries(byStatus).sort((a, b) => b[1] - a[1]).slice(0, 5), [byStatus]);
  const totalStatus = reactExports.useMemo(() => Object.values(byStatus).reduce((a, b) => a + b, 0), [byStatus]);
  const kpis = [{
    label: "Pessoas",
    value: stats.invest,
    icon: Users,
    hint: `${stats.newWeek} na semana`,
    tint: "from-emerald-500/25"
  }, {
    label: "Arquivos",
    value: stats.uploads,
    icon: Upload,
    hint: "todos os anexos",
    tint: "from-cyan-500/25"
  }, {
    label: "Conexões",
    value: stats.conn,
    icon: Network,
    hint: "vínculos entre pessoas",
    tint: "from-lime-500/25"
  }, {
    label: "Rostos indexados",
    value: stats.faces,
    icon: ScanFace,
    hint: "busca facial pronta",
    tint: "from-fuchsia-500/25"
  }, {
    label: "Painéis",
    value: stats.boards,
    icon: Sparkles,
    hint: "quadros visuais",
    tint: "from-amber-500/25"
  }, {
    label: "Sistema",
    value: "ATIVO",
    icon: ShieldCheck,
    hint: "criptografia ok",
    tint: "from-primary/25"
  }];
  const quick = [{
    to: "/investigados",
    label: "Nova pessoa",
    icon: Plus,
    desc: "Cadastrar"
  }, {
    to: "/face-search",
    label: "Buscar por face",
    icon: ScanFace,
    desc: "Foto → rosto"
  }, {
    to: "/pesquisa",
    label: "Pesquisa avançada",
    icon: Search,
    desc: "Filtros ricos"
  }, {
    to: "/uploads",
    label: "Enviar arquivo",
    icon: Upload,
    desc: "Documentos e fotos"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "relative overflow-hidden rounded-2xl border border-primary/30 bg-card cyber-grid scan-line p-6 lg:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_auto] gap-6 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary animate-pulse glow" }),
          "Central de investigação · JTCQI+"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-2 text-2xl lg:text-3xl font-bold glow-text", children: [
          stats.invest,
          " ",
          stats.invest === 1 ? "pessoa cadastrada" : "pessoas cadastradas"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground max-w-xl", children: [
          stats.newWeek > 0 ? `${stats.newWeek} nova(s) nos últimos 7 dias. ` : "Sem novos cadastros nesta semana. ",
          stats.faces,
          " vetor(es) faciais prontos para busca instantânea."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-[320px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-1", children: "Últimos 30 dias" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: daily })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: kpis.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.04
    }, className: `relative overflow-hidden rounded-xl border border-primary/20 bg-card p-4 bg-gradient-to-br ${c.tint} to-transparent`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-5 w-5 text-primary opacity-90" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-widest text-muted-foreground", children: c.hint })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold glow-text truncate", children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, transition: {
        delay: 0.1
      }, className: "lg:col-span-1 rounded-2xl border border-primary/20 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "text-primary", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Ações rápidas" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: quick.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: q.to, className: "group flex flex-col gap-1 rounded-xl border border-border p-3 hover:border-primary/60 hover:bg-primary/5 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(q.icon, { size: 16, className: "text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: q.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: q.desc })
        ] }, q.to)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 pt-4 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "text-primary", size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Por status" })
          ] }),
          statusList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sem dados ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: statusList.map(([label, n]) => {
            const pct = totalStatus ? n / totalStatus * 100 : 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize truncate", children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: n })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-input rounded-full overflow-hidden mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary to-accent", style: {
                width: `${pct}%`
              } }) })
            ] }, label);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, transition: {
        delay: 0.15
      }, className: "lg:col-span-2 rounded-2xl border border-primary/20 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "text-primary", size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Pessoas recentes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados", className: "text-xs text-primary hover:underline flex items-center gap-1", children: [
            "Ver todas ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { size: 12 })
          ] })
        ] }),
        recentPeople.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: "Nenhuma pessoa cadastrada ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: recentPeople.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
          id: p.id
        }, className: "flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/50 hover:bg-primary/5 transition", children: [
          p.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.foto_url, alt: p.nome, className: "h-11 w-11 rounded-lg object-cover border border-primary/30" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold", children: p.nome.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate text-sm", children: p.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground truncate", children: [
              p.status || "sem status",
              " · ",
              fmtRelative(p.created_at)
            ] })
          ] })
        ] }, p.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, transition: {
      delay: 0.2
    }, className: "mt-4 rounded-2xl border border-primary/20 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileImage, { className: "text-primary", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Últimos arquivos" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/uploads", className: "text-xs text-primary hover:underline flex items-center gap-1", children: [
          "Todos ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { size: 12 })
        ] })
      ] }),
      recentUploads.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-sm text-muted-foreground", children: "Nenhum arquivo enviado ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: recentUploads.map((u) => {
        const isImg = u.mime?.startsWith("image/");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: u.url ?? "#", target: "_blank", rel: "noreferrer", className: "group rounded-xl border border-border overflow-hidden hover:border-primary/60 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-input flex items-center justify-center overflow-hidden", children: isImg && u.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u.url, alt: u.nome, className: "h-full w-full object-cover group-hover:scale-105 transition" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileImage, { className: "text-muted-foreground", size: 28 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-medium truncate", children: u.nome }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground", children: fmtRelative(u.created_at) })
          ] })
        ] }, u.id);
      }) })
    ] })
  ] });
}
export {
  Page as component
};
