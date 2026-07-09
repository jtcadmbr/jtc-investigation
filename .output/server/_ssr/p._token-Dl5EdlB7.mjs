import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { b as Route$1 } from "./router-CzwYCBSY.mjs";
import "../_libs/sonner.mjs";
import { q as ShieldAlert, O as Clock } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";

import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/unenv.mjs";


import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const FIELD_LABELS = {
  status: "Status",
  cpf: "CPF",
  rg: "RG",
  idade: "Idade",
  data_nascimento: "Data de Nascimento",
  endereco: "Endereço",
  cidade: "Cidade",
  estado: "Estado",
  pais: "País",
  descricao: "Descrição",
  observacoes: "Observações",
  nome_mae: "Mãe",
  nome_pai: "Pai",
  avo_materna: "Avó Materna",
  avo_materno: "Avô Materno",
  avo_paterna: "Avó Paterna",
  avo_paterno: "Avô Paterno",
  irmaos: "Irmãos",
  irmas: "Irmãs",
  tios: "Tios",
  tias: "Tias",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  twitter: "X / Twitter",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  outras_redes: "Outras Redes"
};
function formatExpiry(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expirado";
  const h = Math.floor(ms / 36e5);
  if (h < 24) return `expira em ${h}h`;
  const d = Math.floor(h / 24);
  return `expira em ${d} dia${d > 1 ? "s" : ""}`;
}
function Page() {
  const {
    token
  } = Route$1.useParams();
  const [state, setState] = reactExports.useState("loading");
  const [link, setLink] = reactExports.useState(null);
  const [person, setPerson] = reactExports.useState(null);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: l
      } = await supabase.from("share_links").select("*").eq("token", token).maybeSingle();
      if (!l) {
        setState("notfound");
        return;
      }
      if (new Date(l.expires_at).getTime() <= Date.now()) {
        setState("expired");
        return;
      }
      const {
        data: p
      } = await supabase.from("investigateds").select("*").eq("id", l.investigated_id).maybeSingle();
      if (!p) {
        setState("notfound");
        return;
      }
      setLink(l);
      setPerson(p);
      setState("ok");
    })();
  }, [token]);
  if (state === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background text-muted-foreground", children: "Carregando..." });
  }
  if (state === "expired" || state === "notfound") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mx-auto text-destructive", size: 48 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-xl font-semibold", children: state === "expired" ? "Este link expirou" : "Link inválido" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: state === "expired" ? "O período de visualização deste link já terminou." : "Não foi possível encontrar este link compartilhado." })
    ] }) });
  }
  const fields = Array.isArray(link.fields) ? link.fields : [];
  const showField = (k) => fields.includes(k);
  const entries = Object.entries(FIELD_LABELS).filter(([k]) => showField(k) && person[k]);
  const showFotos = showField("fotos") && Array.isArray(person.fotos) && person.fotos.length > 0;
  const showDocs = showField("documentos") && Array.isArray(person.documentos) && person.documentos.length > 0;
  const showTel = showField("telefones") && Array.isArray(person.telefones) && person.telefones.length > 0;
  const showEmails = showField("emails") && Array.isArray(person.emails) && person.emails.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-primary", children: "Ficha compartilhada" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
        " ",
        formatExpiry(link.expires_at)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "rounded-2xl border border-primary/30 bg-card p-6 glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start gap-6", children: [
        showField("foto_url") && person.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: person.foto_url, alt: person.nome, className: "h-32 w-32 rounded-full object-cover border-4 border-primary/50 glow" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 w-32 rounded-full bg-muted border-4 border-primary/40 flex items-center justify-center text-5xl font-bold text-primary", children: person.nome?.[0]?.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold glow-text", children: person.nome }),
          showField("status") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-1 text-xs px-2 py-1 rounded-full border border-primary/30 text-primary uppercase tracking-wider", children: person.status })
        ] })
      ] }),
      (entries.length > 0 || showTel || showEmails) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8", children: [
        entries.filter(([k]) => k !== "status").map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm break-words", children: String(person[k]) })
        ] }, k)),
        showTel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Telefones" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 text-sm space-y-0.5", children: person.telefones.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            t.valor,
            t.obs ? ` — ${t.obs}` : ""
          ] }, i)) })
        ] }),
        showEmails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "E-mails" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 text-sm space-y-0.5", children: person.emails.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            t.valor,
            t.obs ? ` — ${t.obs}` : ""
          ] }, i)) })
        ] })
      ] }),
      showFotos && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: "Galeria de fotos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2", children: person.fotos.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: u, target: "_blank", rel: "noreferrer", className: "aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u, alt: `Foto ${i + 1}`, className: "w-full h-full object-cover", loading: "lazy" }) }, i)) })
      ] }),
      showDocs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: "Documentos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: person.documentos.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: d.url, target: "_blank", rel: "noreferrer", className: "rounded-lg overflow-hidden border border-border hover:border-primary transition block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.url, alt: d.label || `Documento ${i + 1}`, className: "w-full h-full object-cover", loading: "lazy" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs text-muted-foreground border-t border-border truncate", children: d.label || `Documento ${i + 1}` })
        ] }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] text-muted-foreground mt-6", children: "JTCQI+ — visualização restrita pelo proprietário do registro." })
  ] }) });
}
export {
  Page as component
};
