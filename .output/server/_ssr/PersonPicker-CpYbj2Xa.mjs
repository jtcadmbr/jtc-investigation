import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { X, S as Search, j as User } from "../_libs/lucide-react.mjs";
function PersonPicker({
  onClose,
  onPick,
  excludeId,
  title = "Vincular pessoa"
}) {
  const [items, setItems] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    (async () => {
      const { data } = await supabase.from("investigateds").select("id,nome,foto_url,status,cidade,cpf").order("nome");
      setItems(data || []);
      setLoading(false);
    })();
  }, []);
  const filtered = reactExports.useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => i.id !== excludeId).filter((i) => !t || [i.nome, i.cpf, i.cidade].some((v) => String(v ?? "").toLowerCase().includes(t)));
  }, [items, q, excludeId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      className: "bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col glow",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold glow-text", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-9 w-9 rounded-lg border border-border flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              autoFocus: true,
              value: q,
              onChange: (e) => setQ(e.target.value),
              placeholder: "Pesquisar por nome, CPF, cidade...",
              className: "w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-8 text-sm", children: "Carregando..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-8 text-sm", children: "Nenhuma pessoa encontrada." }) : filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onPick(p),
            className: "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition text-left",
            children: [
              p.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.foto_url, alt: "", className: "h-10 w-10 rounded-full object-cover border border-primary/30" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-muted border border-primary/20 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: p.nome }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: [p.status, p.cidade, p.cpf && p.cpf !== "N" ? p.cpf : null].filter(Boolean).join(" • ") })
              ] })
            ]
          },
          p.id
        )) })
      ]
    }
  ) });
}
export {
  PersonPicker as P
};
