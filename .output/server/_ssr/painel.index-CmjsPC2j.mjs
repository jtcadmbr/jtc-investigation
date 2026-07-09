import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { u as useAuth } from "./router-CzwYCBSY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useRealtime } from "./use-realtime-DcZylE8C.mjs";
import { u as Plus, N as Network, P as Pencil, T as Trash2, X } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function Page() {
  const {
    user
  } = useAuth();
  const [boards, setBoards] = reactExports.useState([]);
  const [counts, setCounts] = reactExports.useState({});
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [titulo, setTitulo] = reactExports.useState("");
  const [descricao, setDescricao] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const load = async () => {
    setLoading(true);
    const {
      data
    } = await supabase.from("boards").select("*").order("created_at", {
      ascending: false
    });
    setBoards(data || []);
    if (data && data.length) {
      const {
        data: nodes
      } = await supabase.from("panel_nodes").select("board_id");
      const map = {};
      (nodes || []).forEach((n) => {
        map[n.board_id] = (map[n.board_id] || 0) + 1;
      });
      setCounts(map);
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  useRealtime(["boards", "panel_nodes"], load);
  const openCreate = () => {
    setEditing(null);
    setTitulo("");
    setDescricao("");
    setShowForm(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setTitulo(b.titulo);
    setDescricao(b.descricao || "");
    setShowForm(true);
  };
  const save = async () => {
    if (!titulo.trim()) {
      toast.error("Informe um título");
      return;
    }
    if (editing) {
      const {
        error
      } = await supabase.from("boards").update({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null
      }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Painel atualizado");
    } else {
      const {
        error
      } = await supabase.from("boards").insert({
        user_id: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null
      });
      if (error) return toast.error(error.message);
      toast.success("Painel criado");
    }
    setShowForm(false);
    load();
  };
  const remove = async (b) => {
    if (!confirm(`Excluir painel "${b.titulo}"? As pessoas continuam cadastradas.`)) return;
    const {
      error
    } = await supabase.from("boards").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Painel excluído");
    load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Painéis Visuais", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Crie quantos painéis quiser e adicione apenas as pessoas que interessam a cada um." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: openCreate, className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        " Novo painel"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-12", children: "Carregando..." }) : boards.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 border border-dashed border-primary/30 rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "mx-auto mb-3 text-primary", size: 32 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Nenhum painel criado ainda." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: openCreate, className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow", children: "Criar primeiro painel" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: boards.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "group relative rounded-2xl border border-primary/30 bg-card p-4 hover:border-primary transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/painel/$id", params: {
        id: b.id
      }, className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Network, { className: "text-primary", size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold truncate", children: b.titulo })
        ] }),
        b.descricao && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mb-3", children: b.descricao }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wider text-primary", children: [
          counts[b.id] || 0,
          " no painel"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(b), className: "p-1.5 rounded-md bg-background/80 border border-border hover:border-primary", title: "Renomear", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(b), className: "p-1.5 rounded-md bg-background/80 border border-border hover:border-destructive hover:text-destructive", title: "Excluir", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
      ] })
    ] }, b.id)) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "bg-card border border-primary/30 rounded-2xl w-full max-w-md glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: editing ? "Renomear painel" : "Novo painel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowForm(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Título" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: titulo, onChange: (e) => setTitulo(e.target.value), placeholder: "Ex: Operação Alpha", className: "mt-1 w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Descrição (opcional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: descricao, onChange: (e) => setDescricao(e.target.value), rows: 3, className: "mt-1 w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none focus:border-primary resize-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowForm(false), className: "px-3 py-2 rounded-lg border border-border text-sm", children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, className: "px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow", children: "Salvar" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Page as component
};
