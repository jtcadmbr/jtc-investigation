import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { u as useAuth, R as Route$b } from "./router-CzwYCBSY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useRealtime } from "./use-realtime-DcZylE8C.mjs";
import { P as PersonPicker } from "./PersonPicker-CpYbj2Xa.mjs";
import { A as ArrowLeft, F as Folder, S as Search, U as Upload, a as Users, b as FolderOpen, c as Film, d as FileText, C as Check, X, e as FolderInput, P as Pencil, D as Download, T as Trash2 } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";

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
function tipoOf(mime) {
  if (mime.startsWith("image/")) return "imagem";
  if (mime.startsWith("video/")) return "video";
  return "documento";
}
function Page() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const search = Route$b.useSearch();
  const activePessoa = search.pessoa || null;
  const tab = search.tab || (activePessoa ? "pastas" : "todos");
  const [items, setItems] = reactExports.useState([]);
  const [people, setPeople] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [uploading, setUploading] = reactExports.useState(false);
  const [moving, setMoving] = reactExports.useState(null);
  const fileInput = reactExports.useRef(null);
  const load = async () => {
    setLoading(true);
    const [{
      data: up
    }, {
      data: pp
    }] = await Promise.all([supabase.from("uploads").select("*").order("created_at", {
      ascending: false
    }), supabase.from("investigateds").select("id,nome,foto_url").order("nome")]);
    setItems(up || []);
    setPeople(pp || []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  useRealtime(["uploads"], load);
  const peopleMap = reactExports.useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const activePerson = activePessoa ? peopleMap[activePessoa] : null;
  const filtered = reactExports.useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = items;
    if (activePessoa) list = list.filter((i) => i.investigated_id === activePessoa);
    else if (tab === "pastas") list = list.filter((i) => !i.investigated_id);
    if (t) list = list.filter((i) => i.nome.toLowerCase().includes(t));
    return list;
  }, [items, q, tab, activePessoa]);
  const folders = reactExports.useMemo(() => {
    const map = {};
    for (const it of items) if (it.investigated_id) map[it.investigated_id] = (map[it.investigated_id] || 0) + 1;
    return people.filter((p) => map[p.id]).map((p) => ({
      ...p,
      count: map[p.id]
    })).sort((a, b) => b.count - a.count);
  }, [items, people]);
  const orphanCount = reactExports.useMemo(() => items.filter((i) => !i.investigated_id).length, [items]);
  const onPick = () => fileInput.current?.click();
  const handleFiles = async (files) => {
    if (!files || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("uploads").upload(path, file);
      if (up.error) {
        toast.error(up.error.message);
        continue;
      }
      const {
        data: pub
      } = supabase.storage.from("uploads").getPublicUrl(path);
      await supabase.from("uploads").insert({
        user_id: user.id,
        nome: file.name,
        tipo: tipoOf(file.type),
        mime: file.type,
        tamanho: file.size,
        storage_path: path,
        url: pub.publicUrl,
        investigated_id: activePessoa || null
      });
    }
    setUploading(false);
    toast.success(activePerson ? `Enviado para pasta de ${activePerson.nome}` : "Arquivos enviados");
    load();
  };
  const remove = async (it) => {
    if (!confirm("Excluir arquivo?")) return;
    await supabase.storage.from("uploads").remove([it.storage_path]);
    await supabase.from("uploads").delete().eq("id", it.id);
    toast.success("Removido");
    load();
  };
  const moveToPerson = async (personId) => {
    if (!moving) return;
    const {
      error
    } = await supabase.from("uploads").update({
      investigated_id: personId
    }).eq("id", moving.id);
    if (error) toast.error(error.message);
    else {
      const person = personId ? peopleMap[personId] : null;
      toast.success(person ? `Movido para pasta de ${person.nome}` : "Removido da pasta");
    }
    setMoving(null);
    load();
  };
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editingName, setEditingName] = reactExports.useState("");
  const splitName = (full) => {
    const i = full.lastIndexOf(".");
    if (i <= 0) return {
      base: full,
      ext: ""
    };
    return {
      base: full.slice(0, i),
      ext: full.slice(i)
    };
  };
  const startRename = (it) => {
    setEditingId(it.id);
    setEditingName(splitName(it.nome).base);
  };
  const cancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };
  const confirmRename = async (it) => {
    const {
      ext
    } = splitName(it.nome);
    const base = editingName.trim();
    if (!base) {
      toast.error("Nome não pode ficar vazio");
      return;
    }
    const newName = base + ext;
    if (newName === it.nome) {
      cancelRename();
      return;
    }
    const {
      error
    } = await supabase.from("uploads").update({
      nome: newName
    }).eq("id", it.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Renomeado");
      cancelRename();
      load();
    }
  };
  const setTab = (t) => navigate({
    to: "/uploads",
    search: {
      tab: t
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: activePerson ? `Pasta • ${activePerson.nome}` : "Uploads", children: [
    activePerson && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
      to: "/uploads",
      search: {
        tab: "pastas"
      }
    }), className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
      " Voltar às pastas"
    ] }),
    !activePerson && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("todos"), className: `px-4 py-2 rounded-lg text-sm border ${tab === "todos" ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`, children: [
        "Todos os arquivos (",
        items.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("pastas"), className: `px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${tab === "pastas" ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { size: 14 }),
        " Pastas por pessoa (",
        folders.length,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 18 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Pesquisar arquivos...", className: "w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInput, type: "file", multiple: true, className: "hidden", onChange: (e) => handleFiles(e.target.files) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onPick, disabled: uploading, className: "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium glow disabled:opacity-60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 18 }),
        " ",
        uploading ? "Enviando..." : activePerson ? `Enviar para ${activePerson.nome.split(" ")[0]}` : "Enviar arquivos"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-12", children: "Carregando..." }) : tab === "pastas" && !activePessoa ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: [
        orphanCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("pastas"), className: "group text-left rounded-xl border border-dashed border-border bg-card p-4 hover:border-primary/60 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-lg bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { size: 22, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm truncate", children: "Sem pasta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              orphanCount,
              " arquivo(s)"
            ] })
          ] })
        ] }) }),
        folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/uploads", search: {
          pessoa: f.id
        }, className: "group text-left rounded-xl border border-primary/20 bg-card p-4 hover:border-primary/60 hover:glow transition", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          f.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.foto_url, alt: "", className: "h-12 w-12 rounded-lg object-cover border border-primary/30" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm truncate flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 12, className: "text-primary" }),
              " ",
              f.nome
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              f.count,
              " arquivo(s)"
            ] })
          ] })
        ] }) }, f.id)),
        folders.length === 0 && orphanCount === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl", children: "Nenhuma pasta. Envie arquivos e mova para pastas por pessoa." })
      ] }),
      tab === "pastas" && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs uppercase tracking-widest text-primary mb-3", children: "Arquivos sem pasta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileGrid, { items: filtered, peopleMap, editingId, editingName, setEditingName, startRename, cancelRename, confirmRename, onMove: setMoving, onRemove: remove, splitName })
      ] })
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl", children: activePerson ? `Nenhum arquivo na pasta de ${activePerson.nome} ainda.` : "Nenhum arquivo." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileGrid, { items: filtered, peopleMap, editingId, editingName, setEditingName, startRename, cancelRename, confirmRename, onMove: setMoving, onRemove: remove, splitName }),
    moving && /* @__PURE__ */ jsxRuntimeExports.jsx(PersonPicker, { title: `Mover "${moving.nome}" para pasta`, onClose: () => setMoving(null), onPick: (p) => moveToPerson(p.id) })
  ] });
}
function FileGrid({
  items,
  peopleMap,
  editingId,
  editingName,
  setEditingName,
  startRename,
  cancelRename,
  confirmRename,
  onMove,
  onRemove,
  splitName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: items.map((it) => {
    const owner = it.investigated_id ? peopleMap[it.investigated_id] : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, exit: {
      opacity: 0
    }, className: "group relative rounded-xl border border-primary/20 bg-card overflow-hidden hover:border-primary/60 hover:glow transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-muted flex items-center justify-center overflow-hidden", children: [
        it.tipo === "imagem" ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.url, alt: it.nome, className: "w-full h-full object-cover", loading: "lazy" }) : it.tipo === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "h-12 w-12 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-primary" }),
        owner && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/uploads", search: {
          pessoa: owner.id
        }, className: "absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-primary border border-primary/30 flex items-center gap-1 max-w-[85%] truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { size: 9 }),
          " ",
          owner.nome
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
        editingId === it.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, value: editingName, onChange: (e) => setEditingName(e.target.value), onKeyDown: (e) => {
            if (e.key === "Enter") confirmRename(it);
            if (e.key === "Escape") cancelRename();
          }, className: "flex-1 min-w-0 px-1.5 py-0.5 text-xs rounded bg-input border border-primary outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: splitName(it.nome).ext }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirmRename(it), className: "p-1 rounded hover:bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: cancelRename, className: "p-1 rounded hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs truncate cursor-text", title: it.nome, onDoubleClick: () => startRename(it), children: it.nome }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase text-muted-foreground", children: it.tipo }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onMove(it), className: "p-1 rounded hover:bg-primary/10 text-primary", title: "Mover para pasta", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderInput, { size: 12 }) }),
            editingId !== it.id && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => startRename(it), className: "p-1 rounded hover:bg-primary/10 text-primary", title: "Renomear", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: it.url, target: "_blank", rel: "noreferrer", className: "p-1 rounded hover:bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 12 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRemove(it), className: "p-1 rounded hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
          ] })
        ] })
      ] })
    ] }, it.id);
  }) }) });
}
export {
  Page as component
};
