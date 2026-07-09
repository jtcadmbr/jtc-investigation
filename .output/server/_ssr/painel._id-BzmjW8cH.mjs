import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { T as TransformWrapper, a as TransformComponent } from "../_libs/react-zoom-pan-pinch.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import { a as Route$2, u as useAuth } from "./router-CzwYCBSY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useRealtime } from "./use-realtime-DcZylE8C.mjs";
import { A as ArrowLeft, u as Plus, H as Link2, X, S as Search } from "../_libs/lucide-react.mjs";
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
const STATUS_COLOR = {
  suspeito: "#ef4444",
  investigado: "#f97316",
  testemunha: "#3b82f6",
  familiar: "#eab308",
  contato: "#22c55e",
  desaparecido: "#d946ef",
  sem_restricao: "#10b981",
  desconhecido: "#94a3b8"
};
const EDGE_COLORS = ["#22c55e", "#ef4444", "#f97316", "#eab308", "#3b82f6", "#d946ef", "#06b6d4", "#ffffff"];
const DEFAULT_EDGE = "#22c55e";
function Page() {
  const {
    id: boardId
  } = Route$2.useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [board, setBoard] = reactExports.useState(null);
  const [nodes, setNodes] = reactExports.useState([]);
  const [edges, setEdges] = reactExports.useState([]);
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [candidates, setCandidates] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [linking, setLinking] = reactExports.useState(null);
  const draggingRef = reactExports.useRef(null);
  const boardRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [scale, setScale] = reactExports.useState(1);
  const [initialScale, setInitialScale] = reactExports.useState(1);
  const [editingEdge, setEditingEdge] = reactExports.useState(null);
  const [viewingEdge, setViewingEdge] = reactExports.useState(null);
  const edgeClickTimer = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.clientWidth ?? window.innerWidth;
      const s = Math.min(1, Math.max(0.3, w / 1200));
      setInitialScale(s);
      setScale(s);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  const load = async () => {
    const [b, pn, conn] = await Promise.all([supabase.from("boards").select("titulo").eq("id", boardId).maybeSingle(), supabase.from("panel_nodes").select("id, pos_x, pos_y, investigated_id, investigateds(id, nome, foto_url, status)").eq("board_id", boardId), supabase.from("connections").select("*").eq("board_id", boardId)]);
    if (!b.data) {
      toast.error("Painel não encontrado");
      navigate({
        to: "/painel"
      });
      return;
    }
    setBoard(b.data);
    setNodes((pn.data || []).filter((r) => r.investigateds).map((r) => ({
      node_id: r.id,
      id: r.investigateds.id,
      nome: r.investigateds.nome,
      foto_url: r.investigateds.foto_url,
      status: r.investigateds.status,
      pos_x: r.pos_x,
      pos_y: r.pos_y
    })));
    setEdges(conn.data || []);
  };
  reactExports.useEffect(() => {
    load();
  }, [boardId]);
  useRealtime(["panel_nodes", "connections", "investigateds", "boards"], load);
  reactExports.useEffect(() => {
    if (!showAdd) return;
    supabase.from("investigateds").select("id, nome, foto_url, status").then(({
      data
    }) => setCandidates(data || []));
  }, [showAdd]);
  const presentIds = reactExports.useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const filteredCandidates = reactExports.useMemo(() => candidates.filter((c) => !presentIds.has(c.id)).filter((c) => c.nome.toLowerCase().includes(q.toLowerCase())), [candidates, q, presentIds]);
  const onDragStart = (e, n) => {
    if (linking) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    draggingRef.current = {
      id: n.id,
      offX: (e.clientX - rect.left) / scale,
      offY: (e.clientY - rect.top) / scale
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e) => {
    const d = draggingRef.current;
    if (!d || !boardRef.current) return;
    const board2 = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - board2.left) / scale - d.offX;
    const y = (e.clientY - board2.top) / scale - d.offY;
    setNodes((prev) => prev.map((n) => n.id === d.id ? {
      ...n,
      pos_x: x,
      pos_y: y
    } : n));
  };
  const onDragEnd = async () => {
    const d = draggingRef.current;
    draggingRef.current = null;
    if (!d) return;
    const n = nodes.find((x) => x.id === d.id);
    if (n) await supabase.from("panel_nodes").update({
      pos_x: n.pos_x,
      pos_y: n.pos_y
    }).eq("id", n.node_id);
  };
  const addToPanel = async (investigatedId) => {
    const pos_x = 200 + Math.random() * 200;
    const pos_y = 200 + Math.random() * 200;
    const {
      data,
      error
    } = await supabase.from("panel_nodes").insert({
      user_id: user.id,
      board_id: boardId,
      investigated_id: investigatedId,
      pos_x,
      pos_y
    }).select("id").single();
    if (error) return toast.error(error.message);
    const cand = candidates.find((c) => c.id === investigatedId);
    if (cand && data) setNodes((p) => [...p, {
      node_id: data.id,
      id: cand.id,
      nome: cand.nome,
      foto_url: cand.foto_url,
      status: cand.status,
      pos_x,
      pos_y
    }]);
    setShowAdd(false);
  };
  const removeNode = async (n) => {
    if (!confirm(`Remover "${n.nome}" deste painel?`)) return;
    await supabase.from("panel_nodes").delete().eq("id", n.node_id);
    await supabase.from("connections").delete().eq("board_id", boardId).or(`from_id.eq.${n.id},to_id.eq.${n.id}`);
    setNodes((p) => p.filter((x) => x.id !== n.id));
    setEdges((p) => p.filter((e) => e.from_id !== n.id && e.to_id !== n.id));
  };
  const onNodeClick = async (id) => {
    if (!linking) {
      setLinking(id);
      return;
    }
    if (linking === id) {
      setLinking(null);
      return;
    }
    const dup = edges.find((e) => e.from_id === linking && e.to_id === id || e.from_id === id && e.to_id === linking);
    if (dup) {
      setLinking(null);
      return;
    }
    const {
      data,
      error
    } = await supabase.from("connections").insert({
      user_id: user.id,
      from_id: linking,
      to_id: id,
      board_id: boardId
    }).select().single();
    if (error) toast.error(error.message);
    else if (data) setEdges((p) => [...p, data]);
    setLinking(null);
  };
  const saveEdge = async (id, patch) => {
    const {
      error
    } = await supabase.from("connections").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setEdges((p) => p.map((e) => e.id === id ? {
      ...e,
      ...patch
    } : e));
  };
  const removeEdge = async (id) => {
    await supabase.from("connections").delete().eq("id", id);
    setEdges((p) => p.filter((e) => e.id !== id));
    setEditingEdge(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { title: board?.titulo || "Painel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/painel", className: "flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm hover:border-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 14 }),
        " Painéis"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAdd(true), className: "flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
        " Adicionar ao painel"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${linking ? "border-primary text-primary glow" : "border-border text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 16 }),
        " ",
        linking ? "Clique em outro nó para conectar..." : "Clique em um nó para conectar"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: "relative h-[70vh] rounded-2xl border border-primary/30 bg-card overflow-hidden cyber-grid", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransformWrapper, { minScale: 0.2, maxScale: 2.5, initialScale, limitToBounds: false, onTransform: (ref) => setScale(ref.state.scale), doubleClick: {
      disabled: true
    }, panning: {
      excluded: ["panel-node"]
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TransformComponent, { wrapperStyle: {
      width: "100%",
      height: "100%"
    }, contentStyle: {
      width: 3e3,
      height: 3e3
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: boardRef, className: "relative", style: {
      width: 3e3,
      height: 3e3
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "absolute inset-0 pointer-events-none", width: 3e3, height: 3e3, children: edges.map((e) => {
        const a = nodes.find((n) => n.id === e.from_id);
        const b = nodes.find((n) => n.id === e.to_id);
        if (!a || !b) return null;
        const x1 = a.pos_x + 60, y1 = a.pos_y + 60;
        const x2 = b.pos_x + 60, y2 = b.pos_y + 60;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const color = e.cor || DEFAULT_EDGE;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "pointer-events-auto cursor-pointer", onClick: () => {
          if (edgeClickTimer.current) return;
          edgeClickTimer.current = setTimeout(() => {
            edgeClickTimer.current = null;
            setViewingEdge(e);
          }, 220);
        }, onDoubleClick: () => {
          if (edgeClickTimer.current) {
            clearTimeout(edgeClickTimer.current);
            edgeClickTimer.current = null;
          }
          setViewingEdge(null);
          setEditingEdge(e);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1, y1, x2, y2, stroke: color, strokeWidth: 2.5, className: "animated-edge" }),
          e.rotulo && /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: mx - Math.min(e.rotulo.length * 4 + 8, 120), y: my - 11, width: Math.min(e.rotulo.length * 8 + 16, 240), height: 22, rx: 6, fill: "rgba(10,10,10,0.85)", stroke: color, strokeWidth: 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: mx, y: my + 4, textAnchor: "middle", fontSize: 11, fontWeight: 600, fill: color, children: e.rotulo.length > 28 ? e.rotulo.slice(0, 28) + "…" : e.rotulo })
          ] })
        ] }, e.id);
      }) }),
      nodes.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "panel-node absolute select-none", style: {
        left: n.pos_x,
        top: n.pos_y,
        touchAction: "none"
      }, onPointerDown: (e) => onDragStart(e, n), onPointerMove: onDragMove, onPointerUp: onDragEnd, onClick: (e) => {
        e.stopPropagation();
        onNodeClick(n.id);
      }, onContextMenu: (e) => {
        e.preventDefault();
        removeNode(n);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { whileHover: {
        scale: 1.05
      }, className: `w-[120px] rounded-xl border-2 bg-card p-2 text-center shadow-xl ${linking === n.id ? "border-primary glow pulse-glow" : ""}`, style: {
        borderColor: linking === n.id ? void 0 : STATUS_COLOR[n.status]
      }, children: [
        n.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: n.foto_url, alt: n.nome, className: "h-16 w-16 mx-auto rounded-full object-cover border-2", style: {
          borderColor: STATUS_COLOR[n.status]
        } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 mx-auto rounded-full bg-muted border-2 flex items-center justify-center font-bold", style: {
          borderColor: STATUS_COLOR[n.status],
          color: STATUS_COLOR[n.status]
        }, children: n.nome[0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs font-semibold truncate", children: n.nome }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-wider", style: {
          color: STATUS_COLOR[n.status]
        }, children: n.status })
      ] }) }, n.id))
    ] }) }) }, initialScale) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
      "Arraste para mover. Clique em um nó e depois em outro para conectar. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Um clique" }),
      " numa linha mostra o texto completo, ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "dois cliques" }),
      " abrem a edição. Clique com o botão direito num nó para tirá-lo do painel."
    ] }),
    viewingEdge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => setViewingEdge(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, onClick: (e) => e.stopPropagation(), className: "bg-card border rounded-2xl w-full max-w-md glow", style: {
      borderColor: viewingEdge.cor || DEFAULT_EDGE
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", style: {
          color: viewingEdge.cor || DEFAULT_EDGE
        }, children: viewingEdge.rotulo || "Conexão" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewingEdge(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm whitespace-pre-wrap min-h-[80px]", children: viewingEdge.texto?.trim() ? viewingEdge.texto : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Sem texto. Dê dois cliques na linha para adicionar." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        setEditingEdge(viewingEdge);
        setViewingEdge(null);
      }, className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow", children: "Editar" }) })
    ] }) }),
    editingEdge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4", onClick: () => setEditingEdge(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, onClick: (e) => e.stopPropagation(), className: "bg-card border border-primary/30 rounded-2xl w-full max-w-md glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Editar conexão" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditingEdge(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: "Título (aparece na linha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, defaultValue: editingEdge.rotulo ?? "", onChange: (e) => editingEdge.rotulo = e.target.value, placeholder: "Ex: irmão, sócio, devedor...", className: "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: "Texto completo (aparece com 1 clique)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { defaultValue: editingEdge.texto ?? "", onChange: (e) => editingEdge.texto = e.target.value, placeholder: "Descreva a relação, contexto, observações...", rows: 4, className: "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: "Cor da linha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: EDGE_COLORS.map((c) => {
            const active = (editingEdge.cor || DEFAULT_EDGE) === c;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setEditingEdge({
                ...editingEdge,
                cor: c
              });
              saveEdge(editingEdge.id, {
                cor: c
              });
            }, className: `h-8 w-8 rounded-full border-2 transition ${active ? "scale-110 ring-2 ring-white/60" : "border-transparent"}`, style: {
              background: c,
              borderColor: active ? "#fff" : "transparent"
            } }, c);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeEdge(editingEdge.id), className: "px-3 py-2 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/10", children: "Remover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          saveEdge(editingEdge.id, {
            rotulo: editingEdge.rotulo ?? "",
            texto: editingEdge.texto ?? ""
          });
          setEditingEdge(null);
        }, className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow", children: "Salvar" })
      ] })
    ] }) }),
    showAdd && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "bg-card border border-primary/30 rounded-2xl w-full max-w-md glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Adicionar ao painel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAdd(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar...", className: "w-full pl-9 pr-3 py-2 bg-input border border-border rounded-lg text-sm outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-72 overflow-y-auto space-y-1", children: [
          filteredCandidates.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => addToPanel(c.id), className: "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/30 transition text-left", children: [
            c.foto_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.foto_url, alt: "", className: "h-8 w-8 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs", children: c.nome[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: c.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: c.status })
            ] })
          ] }, c.id)),
          filteredCandidates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: "Nenhum disponível" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Page as component
};
