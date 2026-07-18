import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { Plus, Search, X, Link2, ArrowLeft, Download, Undo2, Grid3x3, Maximize2, ZoomIn, ZoomOut, Layout, Sparkles, Focus } from "lucide-react";
import { toPng } from "html-to-image";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useRealtime } from "@/hooks/use-realtime";
import { computeLayout, LAYOUT_LABELS, snapToGrid, type LayoutName } from "@/lib/panel-layouts";

export const Route = createFileRoute("/painel/$id")({ component: Page });

const STATUS_COLOR: Record<string, string> = {
  suspeito: "#ef4444",
  investigado: "#f97316",
  testemunha: "#3b82f6",
  familiar: "#eab308",
  contato: "#22c55e",
  desaparecido: "#d946ef",
  sem_restricao: "#10b981",
  desconhecido: "#94a3b8",
};

const EDGE_COLORS = ["#22c55e", "#ef4444", "#f97316", "#eab308", "#3b82f6", "#d946ef", "#06b6d4", "#ffffff"];
const DEFAULT_EDGE = "#22c55e";

type Node = {
  node_id: string;
  id: string; // investigated id
  nome: string;
  foto_url: string | null;
  status: string;
  pos_x: number;
  pos_y: number;
};

function Page() {
  const { id: boardId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState<{ titulo: string } | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [linking, setLinking] = useState<string | null>(null);
  const draggingRef = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState(1);
  const [editingEdge, setEditingEdge] = useState<any | null>(null);
  const [viewingEdge, setViewingEdge] = useState<any | null>(null);
  const edgeClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transformRef = useRef<any>(null);
  const [snap, setSnap] = useState<boolean>(() => localStorage.getItem("panel:snap") === "1");
  const [nodeSize, setNodeSize] = useState<"S" | "M" | "L">(
    () => (localStorage.getItem("panel:nodeSize") as any) || "M",
  );
  const [showLayouts, setShowLayouts] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [applying, setApplying] = useState(false);
  const historyRef = useRef<Node[][]>([]);
  const pushHistory = (snap: Node[]) => {
    historyRef.current.push(snap.map((n) => ({ ...n })));
    if (historyRef.current.length > 30) historyRef.current.shift();
  };
  useEffect(() => localStorage.setItem("panel:snap", snap ? "1" : "0"), [snap]);
  useEffect(() => localStorage.setItem("panel:nodeSize", nodeSize), [nodeSize]);

  const SIZE_PX = nodeSize === "S" ? 90 : nodeSize === "L" ? 150 : 120;
  const AVATAR_PX = nodeSize === "S" ? 44 : nodeSize === "L" ? 78 : 64;

  useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.clientWidth ?? window.innerWidth;
      // Layout was made for ~desktop width. Shrink proportionally on smaller screens
      // so configured node/line positions look the same, just closer together.
      const s = Math.min(1, Math.max(0.3, w / 1200));
      setInitialScale(s);
      setScale(s);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const load = async () => {
    const [b, pn, conn] = await Promise.all([
      supabase.from("boards").select("titulo").eq("id", boardId).maybeSingle(),
      supabase
        .from("panel_nodes")
        .select("id, pos_x, pos_y, investigated_id, investigateds(id, nome, foto_url, status)")
        .eq("board_id", boardId),
      supabase.from("connections").select("*").eq("board_id", boardId),
    ]);
    if (!b.data) {
      toast.error("Painel não encontrado");
      navigate({ to: "/painel" });
      return;
    }
    setBoard(b.data);
    setNodes(
      ((pn.data as any[]) || [])
        .filter((r) => r.investigateds)
        .map((r) => ({
          node_id: r.id,
          id: r.investigateds.id,
          nome: r.investigateds.nome,
          foto_url: r.investigateds.foto_url,
          status: r.investigateds.status,
          pos_x: r.pos_x,
          pos_y: r.pos_y,
        })),
    );
    setEdges(conn.data || []);
  };
  useEffect(() => {
    load();
  }, [boardId]);
  useRealtime(["panel_nodes", "connections", "investigateds", "boards"], load);

  useEffect(() => {
    if (!showAdd) return;
    supabase
      .from("investigateds")
      .select("id, nome, foto_url, status")
      .then(({ data }) => setCandidates(data || []));
  }, [showAdd]);

  const presentIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const filteredCandidates = useMemo(
    () =>
      candidates
        .filter((c) => !presentIds.has(c.id))
        .filter((c) => c.nome.toLowerCase().includes(q.toLowerCase())),
    [candidates, q, presentIds],
  );

  const onDragStart = (e: React.PointerEvent, n: Node) => {
    if (linking) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    draggingRef.current = {
      id: n.id,
      offX: (e.clientX - rect.left) / scale,
      offY: (e.clientY - rect.top) / scale,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = draggingRef.current;
    if (!d || !boardRef.current) return;
    const board = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - board.left) / scale - d.offX;
    const y = (e.clientY - board.top) / scale - d.offY;
    setNodes((prev) => prev.map((n) => (n.id === d.id ? { ...n, pos_x: x, pos_y: y } : n)));
  };
  const onDragEnd = async () => {
    const d = draggingRef.current;
    draggingRef.current = null;
    if (!d) return;
    const n = nodes.find((x) => x.id === d.id);
    if (n) {
      let { pos_x, pos_y } = n;
      if (snap) {
        const s = snapToGrid(pos_x, pos_y, 20);
        pos_x = s.x; pos_y = s.y;
        setNodes((prev) => prev.map((x) => (x.id === n.id ? { ...x, pos_x, pos_y } : x)));
      }
      pushHistory(nodes);
      await supabase.from("panel_nodes").update({ pos_x, pos_y }).eq("id", n.node_id);
    }
  };

  async function applyLayout(name: LayoutName) {
    if (!nodes.length) return;
    setApplying(true);
    pushHistory(nodes);
    try {
      const positions = computeLayout(
        name,
        nodes.map((n) => ({ id: n.id, status: n.status, nome: n.nome, pos_x: n.pos_x, pos_y: n.pos_y })),
        edges.map((e) => ({ from_id: e.from_id, to_id: e.to_id })),
      );
      const updated = nodes.map((n) => {
        const p = positions[n.id];
        return p ? { ...n, pos_x: p.x, pos_y: p.y } : n;
      });
      setNodes(updated);
      await Promise.all(
        updated.map((n) =>
          supabase.from("panel_nodes").update({ pos_x: n.pos_x, pos_y: n.pos_y }).eq("id", n.node_id),
        ),
      );
      toast.success(`Layout aplicado: ${LAYOUT_LABELS[name]}`);
      setShowLayouts(false);
      setTimeout(fitView, 150);
    } catch (e: any) {
      toast.error("Falha ao aplicar layout: " + (e.message || ""));
    } finally {
      setApplying(false);
    }
  }

  async function undo() {
    const prev = historyRef.current.pop();
    if (!prev) return toast.info("Nada para desfazer");
    setNodes(prev);
    await Promise.all(
      prev.map((n) =>
        supabase.from("panel_nodes").update({ pos_x: n.pos_x, pos_y: n.pos_y }).eq("id", n.node_id),
      ),
    );
  }

  function fitView() {
    if (!transformRef.current || !nodes.length) return;
    const minX = Math.min(...nodes.map((n) => n.pos_x));
    const maxX = Math.max(...nodes.map((n) => n.pos_x + SIZE_PX));
    const minY = Math.min(...nodes.map((n) => n.pos_y));
    const maxY = Math.max(...nodes.map((n) => n.pos_y + SIZE_PX));
    const w = maxX - minX;
    const h = maxY - minY;
    const cw = containerRef.current?.clientWidth ?? window.innerWidth;
    const ch = containerRef.current?.clientHeight ?? 700;
    const scaleX = (cw - 60) / w;
    const scaleY = (ch - 60) / h;
    const s = Math.max(0.2, Math.min(1.5, Math.min(scaleX, scaleY)));
    const cx = minX + w / 2;
    const cy = minY + h / 2;
    const tx = cw / 2 - cx * s;
    const ty = ch / 2 - cy * s;
    try {
      transformRef.current.setTransform(tx, ty, s, 400, "easeOut");
    } catch {}
  }

  async function exportPng() {
    if (!boardRef.current) return;
    try {
      toast.info("Gerando imagem...");
      const dataUrl = await toPng(boardRef.current, {
        backgroundColor: "#0a0a0a",
        cacheBust: true,
        pixelRatio: 1.5,
        filter: (el) => !(el instanceof HTMLElement && el.dataset.exportIgnore === "1"),
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${board?.titulo || "painel"}.png`;
      a.click();
      toast.success("Painel exportado!");
    } catch (e: any) {
      toast.error("Falha ao exportar: " + (e.message || ""));
    }
  }

  const highlightMatch = (n: Node) =>
    highlight.trim() && n.nome.toLowerCase().includes(highlight.trim().toLowerCase());

  const addToPanel = async (investigatedId: string) => {
    const pos_x = 200 + Math.random() * 200;
    const pos_y = 200 + Math.random() * 200;
    const { data, error } = await supabase
      .from("panel_nodes")
      .insert({
        user_id: user!.id,
        board_id: boardId,
        investigated_id: investigatedId,
        pos_x,
        pos_y,
      })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    const cand = candidates.find((c) => c.id === investigatedId);
    if (cand && data)
      setNodes((p) => [
        ...p,
        { node_id: data.id, id: cand.id, nome: cand.nome, foto_url: cand.foto_url, status: cand.status, pos_x, pos_y },
      ]);
    setShowAdd(false);
  };

  const removeNode = async (n: Node) => {
    if (!confirm(`Remover "${n.nome}" deste painel?`)) return;
    await supabase.from("panel_nodes").delete().eq("id", n.node_id);
    await supabase
      .from("connections")
      .delete()
      .eq("board_id", boardId)
      .or(`from_id.eq.${n.id},to_id.eq.${n.id}`);
    setNodes((p) => p.filter((x) => x.id !== n.id));
    setEdges((p) => p.filter((e) => e.from_id !== n.id && e.to_id !== n.id));
  };

  const onNodeClick = async (id: string) => {
    if (!linking) {
      setLinking(id);
      return;
    }
    if (linking === id) {
      setLinking(null);
      return;
    }
    const dup = edges.find(
      (e) =>
        (e.from_id === linking && e.to_id === id) ||
        (e.from_id === id && e.to_id === linking),
    );
    if (dup) {
      setLinking(null);
      return;
    }
    const { data, error } = await supabase
      .from("connections")
      .insert({ user_id: user!.id, from_id: linking, to_id: id, board_id: boardId })
      .select()
      .single();
    if (error) toast.error(error.message);
    else if (data) setEdges((p) => [...p, data]);
    setLinking(null);
  };

  const saveEdge = async (id: string, patch: { rotulo?: string; cor?: string; texto?: string }) => {
    const { error } = await supabase.from("connections").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setEdges((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEdge = async (id: string) => {
    await supabase.from("connections").delete().eq("id", id);
    setEdges((p) => p.filter((e) => e.id !== id));
    setEditingEdge(null);
  };

  return (
    <AppShell title={board?.titulo || "Painel"}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Link
          to="/painel"
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm hover:border-primary"
        >
          <ArrowLeft size={14} /> Painéis
        </Link>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow"
        >
          <Plus size={16} /> Adicionar ao painel
        </button>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${linking ? "border-primary text-primary glow" : "border-border text-muted-foreground"}`}
        >
          <Link2 size={16} />{" "}
          {linking ? "Clique em outro nó para conectar..." : "Clique em um nó para conectar"}
        </div>
      </div>

      {/* === EDITOR TOOLBAR === */}
      <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-xl border border-primary/20 bg-card/50 backdrop-blur">
        <div className="relative">
          <button
            onClick={() => setShowLayouts((v) => !v)}
            disabled={applying || nodes.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 text-sm hover:border-primary disabled:opacity-40"
          >
            <Layout size={14} /> Layouts <Sparkles size={12} className="text-primary" />
          </button>
          {showLayouts && (
            <div className="absolute z-30 mt-1 w-56 rounded-xl border border-primary/30 bg-card shadow-xl glow overflow-hidden">
              {(Object.keys(LAYOUT_LABELS) as LayoutName[]).map((k) => (
                <button
                  key={k}
                  onClick={() => applyLayout(k)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 border-b border-border last:border-0"
                >
                  {LAYOUT_LABELS[k]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
          <button onClick={() => transformRef.current?.zoomIn(0.2)} title="Zoom +" className="p-1.5 rounded-md hover:bg-primary/10 border border-transparent hover:border-primary/30">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => transformRef.current?.zoomOut(0.2)} title="Zoom -" className="p-1.5 rounded-md hover:bg-primary/10 border border-transparent hover:border-primary/30">
            <ZoomOut size={14} />
          </button>
          <button onClick={fitView} title="Enquadrar tudo" className="p-1.5 rounded-md hover:bg-primary/10 border border-transparent hover:border-primary/30">
            <Maximize2 size={14} />
          </button>
          <button onClick={() => transformRef.current?.resetTransform(300, "easeOut")} title="Resetar zoom" className="p-1.5 rounded-md hover:bg-primary/10 border border-transparent hover:border-primary/30">
            <Focus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
          <button
            onClick={() => setSnap((s) => !s)}
            title="Encaixar na grade"
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-xs ${snap ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
          >
            <Grid3x3 size={12} /> Grade
          </button>
          <div className="flex items-center gap-0.5 rounded-md border border-border overflow-hidden">
            {(["S", "M", "L"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setNodeSize(s)}
                className={`px-2 py-1 text-[11px] font-semibold ${nodeSize === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-primary/10"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
          <button onClick={undo} title="Desfazer" className="p-1.5 rounded-md hover:bg-primary/10 border border-transparent hover:border-primary/30">
            <Undo2 size={14} />
          </button>
          <button onClick={exportPng} title="Exportar PNG" className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs border border-border hover:border-primary">
            <Download size={12} /> PNG
          </button>
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
          <input
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Destacar no painel..."
            className="pl-7 pr-3 py-1.5 bg-input border border-border rounded-md text-xs outline-none focus:border-primary w-48"
          />
        </div>

        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {nodes.length} nós · {edges.length} conexões
        </div>
      </div>

      <div ref={containerRef} className="relative h-[70vh] rounded-2xl border border-primary/30 bg-card overflow-hidden cyber-grid">
        <TransformWrapper
          ref={transformRef}
          minScale={0.2}
          maxScale={2.5}
          initialScale={initialScale}
          key={initialScale}
          limitToBounds={false}
          onTransform={(ref: any) => setScale(ref.state.scale)}
          doubleClick={{ disabled: true }}
          panning={{ excluded: ["panel-node"] }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: 3000, height: 3000 }}
          >
            <div ref={boardRef} className="relative" style={{ width: 3000, height: 3000 }}>
              <svg className="absolute inset-0 pointer-events-none" width={3000} height={3000}>
                {edges.map((e) => {
                  const a = nodes.find((n) => n.id === e.from_id);
                  const b = nodes.find((n) => n.id === e.to_id);
                  if (!a || !b) return null;
                  const half = SIZE_PX / 2;
                  const x1 = a.pos_x + half, y1 = a.pos_y + half;
                  const x2 = b.pos_x + half, y2 = b.pos_y + half;
                  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                  const color = e.cor || DEFAULT_EDGE;
                  return (
                    <g
                      key={e.id}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => {
                        if (edgeClickTimer.current) return;
                        edgeClickTimer.current = setTimeout(() => {
                          edgeClickTimer.current = null;
                          setViewingEdge(e);
                        }, 220);
                      }}
                      onDoubleClick={() => {
                        if (edgeClickTimer.current) {
                          clearTimeout(edgeClickTimer.current);
                          edgeClickTimer.current = null;
                        }
                        setViewingEdge(null);
                        setEditingEdge(e);
                      }}
                    >
                      <line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={color}
                        strokeWidth={2.5}
                        className="animated-edge"
                      />
                      {e.rotulo && (
                        <g>
                          <rect
                            x={mx - Math.min(e.rotulo.length * 4 + 8, 120)}
                            y={my - 11}
                            width={Math.min(e.rotulo.length * 8 + 16, 240)}
                            height={22}
                            rx={6}
                            fill="rgba(10,10,10,0.85)"
                            stroke={color}
                            strokeWidth={1}
                          />
                          <text
                            x={mx} y={my + 4}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={600}
                            fill={color}
                          >
                            {e.rotulo.length > 28 ? e.rotulo.slice(0, 28) + "…" : e.rotulo}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {nodes.map((n) => (
                <div
                  key={n.id}
                  className="panel-node absolute select-none"
                  style={{ left: n.pos_x, top: n.pos_y, touchAction: "none" }}
                  onPointerDown={(e) => onDragStart(e, n)}
                  onPointerMove={onDragMove}
                  onPointerUp={onDragEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeClick(n.id);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    removeNode(n);
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-xl border-2 bg-card p-2 text-center shadow-xl transition-all ${linking === n.id ? "border-primary glow pulse-glow" : ""} ${highlight && !highlightMatch(n) ? "opacity-25" : ""} ${highlightMatch(n) ? "ring-2 ring-primary glow" : ""}`}
                    style={{ width: SIZE_PX, borderColor: linking === n.id ? undefined : STATUS_COLOR[n.status] }}
                  >
                    {n.foto_url ? (
                      <img
                        src={n.foto_url}
                        alt={n.nome}
                        className="mx-auto rounded-full object-cover border-2"
                        style={{ width: AVATAR_PX, height: AVATAR_PX, borderColor: STATUS_COLOR[n.status] }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div
                        className="mx-auto rounded-full bg-muted border-2 flex items-center justify-center font-bold"
                        style={{ width: AVATAR_PX, height: AVATAR_PX, borderColor: STATUS_COLOR[n.status], color: STATUS_COLOR[n.status] }}
                      >
                        {n.nome[0]}
                      </div>
                    )}
                    <div className="mt-2 text-xs font-semibold truncate">{n.nome}</div>
                    <div
                      className="text-[9px] uppercase tracking-wider"
                      style={{ color: STATUS_COLOR[n.status] }}
                    >
                      {n.status}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Arraste para mover. Clique em um nó e depois em outro para conectar. <b>Um clique</b> numa
        linha mostra o texto completo, <b>dois cliques</b> abrem a edição. Clique com o botão direito
        num nó para tirá-lo do painel.
      </p>

      {viewingEdge && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingEdge(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border rounded-2xl w-full max-w-md glow"
            style={{ borderColor: viewingEdge.cor || DEFAULT_EDGE }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold" style={{ color: viewingEdge.cor || DEFAULT_EDGE }}>
                {viewingEdge.rotulo || "Conexão"}
              </h3>
              <button onClick={() => setViewingEdge(null)}><X size={18} /></button>
            </div>
            <div className="p-4 text-sm whitespace-pre-wrap min-h-[80px]">
              {viewingEdge.texto?.trim()
                ? viewingEdge.texto
                : <span className="text-muted-foreground italic">Sem texto. Dê dois cliques na linha para adicionar.</span>}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => { setEditingEdge(viewingEdge); setViewingEdge(null); }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow"
              >
                Editar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editingEdge && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingEdge(null)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-primary/30 rounded-2xl w-full max-w-md glow"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Editar conexão</h3>
              <button onClick={() => setEditingEdge(null)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Título (aparece na linha)</label>
                <input
                  autoFocus
                  defaultValue={editingEdge.rotulo ?? ""}
                  onChange={(e) => (editingEdge.rotulo = e.target.value)}
                  placeholder="Ex: irmão, sócio, devedor..."
                  className="mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Texto completo (aparece com 1 clique)</label>
                <textarea
                  defaultValue={editingEdge.texto ?? ""}
                  onChange={(e) => (editingEdge.texto = e.target.value)}
                  placeholder="Descreva a relação, contexto, observações..."
                  rows={4}
                  className="mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Cor da linha</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EDGE_COLORS.map((c) => {
                    const active = (editingEdge.cor || DEFAULT_EDGE) === c;
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          setEditingEdge({ ...editingEdge, cor: c });
                          saveEdge(editingEdge.id, { cor: c });
                        }}
                        className={`h-8 w-8 rounded-full border-2 transition ${active ? "scale-110 ring-2 ring-white/60" : "border-transparent"}`}
                        style={{ background: c, borderColor: active ? "#fff" : "transparent" }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => removeEdge(editingEdge.id)}
                className="px-3 py-2 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/10"
              >
                Remover
              </button>
              <button
                onClick={() => {
                  saveEdge(editingEdge.id, { rotulo: editingEdge.rotulo ?? "", texto: editingEdge.texto ?? "" });
                  setEditingEdge(null);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/30 rounded-2xl w-full max-w-md glow"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Adicionar ao painel</h3>
              <button onClick={() => setShowAdd(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 bg-input border border-border rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {filteredCandidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addToPanel(c.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/30 transition text-left"
                  >
                    {c.foto_url ? (
                      <img
                        src={c.foto_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        {c.nome[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm">{c.nome}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.status}
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCandidates.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Nenhum disponível
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
