import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import "../_libs/sonner.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { S as Search, k as Funnel, X } from "../_libs/lucide-react.mjs";

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
const FIELD_WEIGHTS = [{
  key: "nome",
  weight: 10,
  label: "Nome"
}, {
  key: "cpf",
  weight: 9,
  label: "CPF"
}, {
  key: "rg",
  weight: 7,
  label: "RG"
}, {
  key: "telefone",
  weight: 6,
  label: "Telefone"
}, {
  key: "email",
  weight: 5,
  label: "E-mail"
}, {
  key: "cidade",
  weight: 4,
  label: "Cidade"
}, {
  key: "endereco",
  weight: 3,
  label: "Endereço"
}, {
  key: "estado",
  weight: 2,
  label: "Estado"
}, {
  key: "nome_mae",
  weight: 5,
  label: "Mãe"
}, {
  key: "nome_pai",
  weight: 5,
  label: "Pai"
}, {
  key: "avo_materna",
  weight: 3,
  label: "Avó materna"
}, {
  key: "avo_materno",
  weight: 3,
  label: "Avô materno"
}, {
  key: "avo_paterna",
  weight: 3,
  label: "Avó paterna"
}, {
  key: "avo_paterno",
  weight: 3,
  label: "Avô paterno"
}, {
  key: "irmaos",
  weight: 3,
  label: "Irmãos"
}, {
  key: "irmas",
  weight: 3,
  label: "Irmãs"
}, {
  key: "tios",
  weight: 2,
  label: "Tios"
}, {
  key: "tias",
  weight: 2,
  label: "Tias"
}, {
  key: "instagram",
  weight: 3,
  label: "Instagram"
}, {
  key: "facebook",
  weight: 3,
  label: "Facebook"
}, {
  key: "tiktok",
  weight: 3,
  label: "TikTok"
}, {
  key: "twitter",
  weight: 2,
  label: "Twitter/X"
}, {
  key: "youtube",
  weight: 2,
  label: "YouTube"
}, {
  key: "linkedin",
  weight: 2,
  label: "LinkedIn"
}, {
  key: "outras_redes",
  weight: 2,
  label: "Outras redes"
}, {
  key: "descricao",
  weight: 2,
  label: "Descrição"
}, {
  key: "observacoes",
  weight: 2,
  label: "Observações"
}];
const STATUSES = ["suspeito", "investigado", "testemunha", "familiar", "contato", "desaparecido", "sem_restricao", "desconhecido"];
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9@.\s]/g, " ");
function fieldValueText(row, key) {
  const v = row[key];
  if (v == null || v === "N") return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    return v.map((it) => {
      if (!it) return "";
      if (typeof it === "string") return it;
      return [it.valor, it.obs, it.label].filter(Boolean).join(" ");
    }).join(" ");
  }
  return "";
}
function scoreRow(row, tokens) {
  if (tokens.length === 0) return {
    score: 0,
    matches: []
  };
  let total = 0;
  const matches = [];
  const extraFields = [{
    key: "telefones",
    weight: 6,
    label: "Telefone"
  }, {
    key: "emails",
    weight: 5,
    label: "E-mail"
  }, {
    key: "documentos",
    weight: 2,
    label: "Documento"
  }];
  const allFields = [...FIELD_WEIGHTS, ...extraFields];
  for (const t of tokens) {
    let tokenScore = 0;
    for (const f of allFields) {
      const raw = fieldValueText(row, f.key);
      if (!raw) continue;
      const n = normalize(raw);
      if (n.includes(t)) {
        const wordBoundary = new RegExp(`(^|\\s)${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(n);
        tokenScore = Math.max(tokenScore, f.weight * (wordBoundary ? 1.5 : 1));
        if (!matches.includes(f.label)) matches.push(f.label);
      }
    }
    if (tokenScore === 0) return {
      score: 0,
      matches: []
    };
    total += tokenScore;
  }
  return {
    score: total,
    matches
  };
}
function Page() {
  const [all, setAll] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState([]);
  const [withPhoto, setWithPhoto] = reactExports.useState(false);
  const [withCPF, setWithCPF] = reactExports.useState(false);
  const [showFilters, setShowFilters] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.from("investigateds").select("*").then(({
      data
    }) => setAll(data || []));
  }, []);
  const results = reactExports.useMemo(() => {
    const tokens = normalize(q).split(/\s+/).filter((t) => t.length >= 2);
    const filtered = all.filter((r) => {
      if (status.length && !status.includes(r.status)) return false;
      if (withPhoto && !r.foto_url) return false;
      if (withCPF && (!r.cpf || r.cpf === "N")) return false;
      return true;
    });
    if (!tokens.length && (status.length || withPhoto || withCPF)) {
      return filtered.map((r) => ({
        row: r,
        score: 0,
        matches: []
      })).sort((a, b) => a.row.nome.localeCompare(b.row.nome));
    }
    if (!tokens.length) return [];
    return filtered.map((row) => ({
      row,
      ...scoreRow(row, tokens)
    })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  }, [all, q, status, withPhoto, withCPF]);
  const toggleStatus = (s) => setStatus((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const activeFilters = status.length + (withPhoto ? 1 : 0) + (withCPF ? 1 : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Pesquisa Avançada", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-primary", size: 20 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, value: q, onChange: (e) => setQ(e.target.value), placeholder: "Digite várias palavras — nome, CPF, telefone, cidade, mãe, rede social...", className: "w-full pl-12 pr-32 py-4 rounded-2xl bg-card border border-primary/30 text-lg focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none glow" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowFilters((v) => !v), className: `absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${activeFilters ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 14 }),
        " Filtros ",
        activeFilters > 0 && `(${activeFilters})`
      ] })
    ] }),
    showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      height: 0
    }, animate: {
      opacity: 1,
      height: "auto"
    }, className: "mt-4 rounded-xl border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-muted-foreground mb-2", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleStatus(s), className: `px-3 py-1 rounded-full text-[11px] border uppercase tracking-wider ${status.includes(s) ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`, children: s.replace("_", " ") }, s)),
          status.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStatus([]), className: "px-2 py-1 rounded-full text-[11px] text-destructive hover:underline flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 }),
            " limpar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWithPhoto((v) => !v), className: `px-3 py-1.5 rounded-lg text-xs border ${withPhoto ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`, children: "Somente com foto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWithCPF((v) => !v), className: `px-3 py-1.5 rounded-lg text-xs border ${withCPF ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`, children: "Somente com CPF" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-xs text-muted-foreground", children: q || activeFilters ? `${results.length} resultado(s)` : "Digite algo para pesquisar ou aplique filtros" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
      results.map(({
        row: r,
        matches,
        score
      }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        x: -8
      }, animate: {
        opacity: 1,
        x: 0
      }, transition: {
        delay: Math.min(i * 0.02, 0.3)
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
        id: r.id
      }, className: "flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/60 hover:glow transition", children: [
        r.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.foto_url, alt: "", className: "h-12 w-12 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary", children: r.nome[0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: r.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: r.cidade || r.telefone || r.descricao || "" }),
          matches.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: matches.slice(0, 5).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20", children: m }, m)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-primary", children: r.status }),
          score > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            "score ",
            Math.round(score)
          ] })
        ] })
      ] }) }, r.id)),
      (q || activeFilters) && results.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-8", children: "Nenhum resultado." })
    ] })
  ] });
}
export {
  Page as component
};
