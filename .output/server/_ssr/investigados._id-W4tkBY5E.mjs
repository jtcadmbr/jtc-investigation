import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { I as InvestigadoForm } from "./InvestigadoForm-Ca30UKxm.mjs";
import { c as Route, u as useAuth } from "./router-CzwYCBSY.mjs";
import { A as ArrowLeft, P as Pencil, Q as Share2, T as Trash2, H as Link2, b as FolderOpen, X, V as Link$1, C as Check, W as Copy } from "../_libs/lucide-react.mjs";
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
import "../_libs/react-easy-crop.mjs";
import "../_libs/normalize-wheel.mjs";
import "./PersonPicker-CpYbj2Xa.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const FIELD_OPTIONS = [
  { key: "foto_url", label: "Foto principal" },
  { key: "fotos", label: "Galeria de fotos" },
  { key: "documentos", label: "Documentos" },
  { key: "status", label: "Status" },
  { key: "cpf", label: "CPF" },
  { key: "rg", label: "RG" },
  { key: "idade", label: "Idade" },
  { key: "data_nascimento", label: "Data de nascimento" },
  { key: "telefones", label: "Telefones" },
  { key: "emails", label: "E-mails" },
  { key: "endereco", label: "Endereço" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
  { key: "pais", label: "País" },
  { key: "descricao", label: "Descrição" },
  { key: "observacoes", label: "Observações" },
  { key: "nome_mae", label: "Mãe" },
  { key: "nome_pai", label: "Pai" },
  { key: "avo_materna", label: "Avó materna" },
  { key: "avo_materno", label: "Avô materno" },
  { key: "avo_paterna", label: "Avó paterna" },
  { key: "avo_paterno", label: "Avô paterno" },
  { key: "irmaos", label: "Irmãos" },
  { key: "irmas", label: "Irmãs" },
  { key: "tios", label: "Tios" },
  { key: "tias", label: "Tias" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "twitter", label: "X / Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "outras_redes", label: "Outras redes" }
];
const DURATIONS = [
  { label: "1 hora", hours: 1 },
  { label: "24 horas", hours: 24 },
  { label: "7 dias", hours: 24 * 7 },
  { label: "30 dias", hours: 24 * 30 },
  { label: "1 ano", hours: 24 * 365 }
];
function randomToken() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
}
function ShareDialog({ investigatedId, nome, onClose }) {
  const { user } = useAuth();
  const [selected, setSelected] = reactExports.useState(["foto_url", "status"]);
  const [hours, setHours] = reactExports.useState(24);
  const [generating, setGenerating] = reactExports.useState(false);
  const [link, setLink] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  const toggle = (k) => setSelected((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);
  const generate = async () => {
    if (!user) return;
    if (selected.length === 0) return toast.error("Selecione pelo menos um campo");
    setGenerating(true);
    const token = randomToken();
    const expires_at = new Date(Date.now() + hours * 3600 * 1e3).toISOString();
    const { error } = await supabase.from("share_links").insert({
      user_id: user.id,
      investigated_id: investigatedId,
      token,
      fields: selected,
      expires_at
    });
    setGenerating(false);
    if (error) return toast.error(error.message);
    const url = `${window.location.origin}/p/${token}`;
    setLink(url);
    toast.success("Link gerado");
  };
  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      className: "bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col glow",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-5 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold glow-text", children: "Compartilhar ficha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: nome })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-5 space-y-5", children: link ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Link público criado. Qualquer pessoa com o link pode ver os campos selecionados até expirar." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-input border border-primary/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { size: 16, className: "text-primary shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 text-xs break-all", children: link }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: copy, className: "h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 shrink-0", children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14, className: "text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setLink(null);
                setSelected(["foto_url", "status"]);
              },
              className: "text-xs text-primary hover:underline",
              children: "Gerar outro link"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "O que mostrar?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: FIELD_OPTIONS.map((f) => {
              const active = selected.includes(f.key);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => toggle(f.key),
                  className: `px-3 py-1.5 rounded-full text-xs border transition ${active ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`,
                  children: f.label
                },
                f.key
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-2", children: [
              selected.length,
              " campo(s) selecionado(s) — o nome sempre aparece."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Por quanto tempo o link fica ativo?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: DURATIONS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setHours(d.hours),
                className: `px-3 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${hours === d.hours ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`,
                children: d.label
              },
              d.hours
            )) })
          ] })
        ] }) }),
        !link && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-t border-border flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-4 py-2 rounded-lg border border-border text-sm hover:border-primary/40", children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: generate,
              disabled: generating,
              className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow disabled:opacity-60",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { size: 16 }),
                " ",
                generating ? "Gerando..." : "Gerar link"
              ]
            }
          )
        ] })
      ]
    }
  ) });
}
const FIELD_LABELS = {
  cpf: "CPF",
  rg: "RG",
  idade: "Idade",
  data_nascimento: "Data de Nascimento",
  telefone: "Telefone",
  email: "E-mail",
  endereco: "Endereço",
  cidade: "Cidade",
  estado: "Estado",
  pais: "País",
  descricao: "Descrição",
  observacoes: "Observações",
  nome_mae: "Nome da Mãe",
  nome_pai: "Nome do Pai",
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
function Page() {
  const {
    id
  } = Route.useParams();
  const navigate = useNavigate();
  const [item, setItem] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(false);
  const [sharing, setSharing] = reactExports.useState(false);
  const [connOut, setConnOut] = reactExports.useState([]);
  const [connIn, setConnIn] = reactExports.useState([]);
  const [folderFiles, setFolderFiles] = reactExports.useState([]);
  const load = async () => {
    const {
      data,
      error
    } = await supabase.from("investigateds").select("*").eq("id", id).maybeSingle();
    if (error) toast.error(error.message);
    setItem(data);
    const [{
      data: out
    }, {
      data: inn
    }, {
      data: files
    }] = await Promise.all([supabase.from("connections").select("rotulo,to_id,investigateds!connections_to_id_fkey(id,nome,foto_url)").eq("from_id", id), supabase.from("connections").select("rotulo,from_id,investigateds!connections_from_id_fkey(id,nome,foto_url)").eq("to_id", id), supabase.from("uploads").select("*").eq("investigated_id", id).order("created_at", {
      ascending: false
    })]);
    setConnOut(out || []);
    setConnIn(inn || []);
    setFolderFiles(files || []);
  };
  reactExports.useEffect(() => {
    load();
  }, [id]);
  const remove = async () => {
    if (!confirm("Excluir este registro?")) return;
    const {
      error
    } = await supabase.from("investigateds").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removido");
      navigate({
        to: "/investigados"
      });
    }
  };
  if (!item) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Pessoa", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-12", children: "Carregando..." }) });
  const entries = Object.entries(FIELD_LABELS).filter(([k]) => item[k]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: "Ficha", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados", className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
      " Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 12
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "rounded-2xl border border-primary/30 bg-card p-6 glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start gap-6", children: [
        item.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.foto_url, alt: item.nome, className: "h-32 w-32 rounded-full object-cover border-4 border-primary/50 glow" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 w-32 rounded-full bg-muted border-4 border-primary/40 flex items-center justify-center text-5xl font-bold text-primary", children: item.nome?.[0]?.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold glow-text", children: item.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-1 text-xs px-2 py-1 rounded-full border border-primary/30 text-primary uppercase tracking-wider", children: item.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing(true), className: "flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }),
              " Editar"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSharing(true), className: "flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14 }),
              " Compartilhar"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: remove, className: "flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive text-sm hover:bg-destructive/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
              " Excluir"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8", children: entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm col-span-full", children: "Nenhuma informação adicional cadastrada." }) : entries.map(([k, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-background/40 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm break-words", children: String(item[k]) })
      ] }, k)) }),
      Array.isArray(item.fotos) && item.fotos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: "Galeria de fotos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2", children: item.fotos.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: u, target: "_blank", rel: "noreferrer", className: "aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u, alt: `Foto ${i + 1}`, className: "w-full h-full object-cover", loading: "lazy" }) }, i)) })
      ] }),
      Array.isArray(item.documentos) && item.documentos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: "Documentos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: item.documentos.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: d.url, target: "_blank", rel: "noreferrer", className: "rounded-lg overflow-hidden border border-border hover:border-primary transition block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.url, alt: d.label || `Documento ${i + 1}`, className: "w-full h-full object-cover", loading: "lazy" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-xs text-muted-foreground border-t border-border truncate", children: d.label || `Documento ${i + 1}` })
        ] }, i)) })
      ] }),
      (connOut.length > 0 || connIn.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 12 }),
          " Vínculos familiares"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
          connOut.map((c, i) => c.investigateds && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
            id: c.investigateds.id
          }, className: "flex items-center gap-3 p-2 rounded-lg border border-border bg-background/40 hover:border-primary/60 transition", children: [
            c.investigateds.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.investigateds.foto_url, className: "h-9 w-9 rounded-full object-cover", alt: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-muted flex items-center justify-center text-primary text-sm font-bold", children: c.investigateds.nome[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm truncate", children: c.investigateds.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-primary", children: c.rotulo })
            ] })
          ] }, `o${i}`)),
          connIn.map((c, i) => c.investigateds && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/investigados/$id", params: {
            id: c.investigateds.id
          }, className: "flex items-center gap-3 p-2 rounded-lg border border-border bg-background/40 hover:border-primary/60 transition", children: [
            c.investigateds.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.investigateds.foto_url, className: "h-9 w-9 rounded-full object-cover", alt: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-muted flex items-center justify-center text-primary text-sm font-bold", children: c.investigateds.nome[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm truncate", children: c.investigateds.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: [
                "tem esta pessoa como ",
                c.rotulo
              ] })
            ] })
          ] }, `i${i}`))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs uppercase tracking-widest text-primary flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 12 }),
            " Pasta de arquivos (",
            folderFiles.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/uploads", search: {
            pessoa: id
          }, className: "text-[11px] text-primary hover:underline", children: "abrir pasta →" })
        ] }),
        folderFiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground italic", children: "Nenhum arquivo nesta pasta. Vá em Uploads e mova arquivos para esta pessoa." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2", children: folderFiles.slice(0, 12).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: f.url, target: "_blank", rel: "noreferrer", className: "aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center hover:border-primary transition", children: f.tipo === "imagem" ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.url, alt: f.nome, className: "w-full h-full object-cover", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] p-1 text-center text-muted-foreground truncate", children: f.nome }) }, f.id)) })
      ] })
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(InvestigadoForm, { initial: item, onClose: () => setEditing(false), onSaved: () => {
      setEditing(false);
      load();
    } }),
    sharing && /* @__PURE__ */ jsxRuntimeExports.jsx(ShareDialog, { investigatedId: item.id, nome: item.nome, onClose: () => setSharing(false) })
  ] });
}
export {
  Page as component
};
