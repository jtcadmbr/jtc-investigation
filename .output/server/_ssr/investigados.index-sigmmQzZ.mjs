import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { I as InvestigadoForm } from "./InvestigadoForm-Ca30UKxm.mjs";
import { u as useRealtime } from "./use-realtime-DcZylE8C.mjs";
import { S as Search, k as Funnel, u as Plus, l as Eye, P as Pencil, T as Trash2 } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";

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
import "../_libs/react-easy-crop.mjs";
import "../_libs/normalize-wheel.mjs";
import "./PersonPicker-CpYbj2Xa.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const STATUS_COLORS = {
  suspeito: "bg-red-500/20 text-red-300 border-red-500/40",
  investigado: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  testemunha: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  familiar: "bg-yellow-500/20 text-yellow-200 border-yellow-500/40",
  contato: "bg-green-500/20 text-green-300 border-green-500/40",
  desaparecido: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
  sem_restricao: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  desconhecido: "bg-gray-500/20 text-gray-300 border-gray-500/40"
};
function Page() {
  const [items, setItems] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState([]);
  const [showStatusPicker, setShowStatusPicker] = reactExports.useState(false);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const load = async () => {
    setLoading(true);
    const {
      data,
      error
    } = await supabase.from("investigateds").select("*").order("created_at", {
      ascending: false
    });
    if (error) toast.error(error.message);
    else setItems(data || []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  useRealtime(["investigateds"], load);
  const filtered = reactExports.useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(i.status);
      if (!term) return matchStatus;
      const blob = [i.nome, i.cpf, i.telefone, i.email, i.cidade, i.descricao].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && blob.includes(term);
    });
  }, [items, q, statusFilter]);
  const toggleStatus = (s) => setStatusFilter((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const remove = async (id) => {
    if (!confirm("Excluir este registro?")) return;
    const {
      error
    } = await supabase.from("investigateds").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removido");
      load();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Pessoas", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 18 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Pesquisar por nome, CPF, cidade...", className: "w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowStatusPicker(true), className: "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-input border border-border text-sm hover:border-primary transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 16 }),
        statusFilter.length === 0 ? "Todos status" : `${statusFilter.length} selecionado(s)`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setEditing(null);
        setShowForm(true);
      }, className: "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium glow hover:brightness-110 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 18 }),
        " Novo"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-12", children: "Carregando..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl", children: [
      "Nenhuma pessoa cadastrada. Clique em ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-primary", children: "Novo" }),
      " para adicionar."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filtered.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      scale: 0.95
    }, transition: {
      delay: i * 0.02
    }, className: "group relative rounded-2xl border border-primary/20 bg-card p-5 hover:border-primary/60 hover:glow transition-all", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        p.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.foto_url, alt: p.nome, className: "h-14 w-14 rounded-full object-cover border-2 border-primary/40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary", children: p.nome?.[0]?.toUpperCase() ?? "?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold truncate", children: p.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[p.status]}`, children: p.status })
        ] })
      ] }),
      p.descricao && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground line-clamp-2", children: p.descricao }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
          id: p.id
        }, className: "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs hover:bg-primary/20 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }),
          " Ver"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setEditing(p);
          setShowForm(true);
        }, className: "px-2 py-1.5 rounded-md border border-border hover:border-primary/40 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(p.id), className: "px-2 py-1.5 rounded-md border border-border text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
      ] })
    ] }, p.id)) }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(InvestigadoForm, { initial: editing, onClose: () => setShowForm(false), onSaved: () => {
      setShowForm(false);
      load();
    } }),
    showStatusPicker && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => setShowStatusPicker(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, onClick: (e) => e.stopPropagation(), className: "bg-card border border-primary/30 rounded-2xl w-full max-w-sm glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Filtrar por status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatusFilter([]), className: "text-xs text-muted-foreground hover:text-primary", children: "Limpar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 grid grid-cols-2 gap-2", children: Object.keys(STATUS_COLORS).map((s) => {
        const active = statusFilter.includes(s);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleStatus(s), className: `px-3 py-2 rounded-lg border text-xs uppercase tracking-wider text-left transition ${active ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`, children: s.replace("_", " ") }, s);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowStatusPicker(false), className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow", children: "Aplicar" }) })
    ] }) })
  ] });
}
export {
  Page as component
};
