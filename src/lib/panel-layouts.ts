// Algoritmos de layout para o painel visual. Todos retornam mapa id → {x,y}.
// Trabalho no espaço 3000×3000 do canvas.

export type LayoutNode = {
  id: string;
  status?: string | null;
  nome?: string;
  pos_x: number;
  pos_y: number;
};

export type LayoutEdge = { from_id: string; to_id: string };

const CX = 1500;
const CY = 1500;
const NODE = 120;

export type LayoutName = "circle" | "grid" | "cluster" | "hierarchy" | "radial" | "timeline";

export const LAYOUT_LABELS: Record<LayoutName, string> = {
  circle: "Círculo",
  grid: "Grade",
  cluster: "Agrupado por status",
  hierarchy: "Hierarquia",
  radial: "Radial (força)",
  timeline: "Linha do tempo",
};

function circleAt(cx: number, cy: number, items: LayoutNode[], radius: number) {
  const out: Record<string, { x: number; y: number }> = {};
  const n = Math.max(1, items.length);
  items.forEach((it, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    out[it.id] = { x: cx + Math.cos(a) * radius - NODE / 2, y: cy + Math.sin(a) * radius - NODE / 2 };
  });
  return out;
}

function layoutCircle(nodes: LayoutNode[]) {
  const r = Math.max(220, Math.min(900, nodes.length * 26));
  return circleAt(CX, CY, nodes, r);
}

function layoutGrid(nodes: LayoutNode[]) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  const spacing = 180;
  const startX = CX - ((cols - 1) * spacing) / 2 - NODE / 2;
  const rows = Math.ceil(nodes.length / cols);
  const startY = CY - ((rows - 1) * spacing) / 2 - NODE / 2;
  const out: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    out[n.id] = { x: startX + c * spacing, y: startY + r * spacing };
  });
  return out;
}

function layoutCluster(nodes: LayoutNode[]) {
  const groups = new Map<string, LayoutNode[]>();
  for (const n of nodes) {
    const k = n.status || "desconhecido";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(n);
  }
  const keys = Array.from(groups.keys());
  const groupCount = Math.max(1, keys.length);
  const superR = Math.max(400, groupCount * 180);
  const out: Record<string, { x: number; y: number }> = {};
  keys.forEach((k, gi) => {
    const items = groups.get(k)!;
    const a = (gi / groupCount) * Math.PI * 2 - Math.PI / 2;
    const gcx = CX + Math.cos(a) * superR;
    const gcy = CY + Math.sin(a) * superR;
    const r = Math.max(120, items.length * 34);
    Object.assign(out, circleAt(gcx, gcy, items, r));
  });
  return out;
}

function layoutHierarchy(nodes: LayoutNode[]) {
  const order = ["suspeito", "investigado", "testemunha", "familiar", "contato", "desaparecido", "sem_restricao", "desconhecido"];
  const rows = new Map<string, LayoutNode[]>();
  for (const n of nodes) {
    const k = n.status || "desconhecido";
    if (!rows.has(k)) rows.set(k, []);
    rows.get(k)!.push(n);
  }
  const sortedKeys = order.filter((k) => rows.has(k)).concat(Array.from(rows.keys()).filter((k) => !order.includes(k)));
  const rowH = 200;
  const startY = CY - ((sortedKeys.length - 1) * rowH) / 2 - NODE / 2;
  const out: Record<string, { x: number; y: number }> = {};
  sortedKeys.forEach((k, ri) => {
    const items = rows.get(k)!;
    const spacing = 170;
    const startX = CX - ((items.length - 1) * spacing) / 2 - NODE / 2;
    items.forEach((n, i) => {
      out[n.id] = { x: startX + i * spacing, y: startY + ri * rowH };
    });
  });
  return out;
}

function layoutRadial(nodes: LayoutNode[], edges: LayoutEdge[]) {
  // Nó com mais conexões vai no centro; demais em anéis por distância BFS.
  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.from_id, (degree.get(e.from_id) || 0) + 1);
    degree.set(e.to_id, (degree.get(e.to_id) || 0) + 1);
  }
  const sorted = [...nodes].sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0));
  if (!sorted.length) return {};
  const center = sorted[0];
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.id, new Set());
  for (const e of edges) {
    adj.get(e.from_id)?.add(e.to_id);
    adj.get(e.to_id)?.add(e.from_id);
  }
  const rings = new Map<number, LayoutNode[]>();
  const seen = new Set<string>([center.id]);
  rings.set(0, [center]);
  let level = 0;
  let frontier = [center.id];
  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const nb of adj.get(id) || []) {
        if (!seen.has(nb)) {
          seen.add(nb);
          next.push(nb);
        }
      }
    }
    if (!next.length) break;
    level++;
    rings.set(level, next.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean));
    frontier = next;
  }
  // Nós sem conexão vão no último anel
  const disconnected = nodes.filter((n) => !seen.has(n.id));
  if (disconnected.length) {
    level++;
    rings.set(level, disconnected);
  }
  const out: Record<string, { x: number; y: number }> = {};
  out[center.id] = { x: CX - NODE / 2, y: CY - NODE / 2 };
  for (const [lvl, items] of rings) {
    if (lvl === 0) continue;
    const r = lvl * 220;
    Object.assign(out, circleAt(CX, CY, items, r));
  }
  return out;
}

function layoutTimeline(nodes: LayoutNode[]) {
  const sorted = [...nodes].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  const perRow = Math.max(1, Math.ceil(Math.sqrt(sorted.length * 3)));
  const spacingX = 180;
  const spacingY = 220;
  const rows = Math.ceil(sorted.length / perRow);
  const startY = CY - ((rows - 1) * spacingY) / 2 - NODE / 2;
  const out: Record<string, { x: number; y: number }> = {};
  sorted.forEach((n, i) => {
    const c = i % perRow;
    const r = Math.floor(i / perRow);
    const startX = CX - ((perRow - 1) * spacingX) / 2 - NODE / 2;
    out[n.id] = { x: startX + c * spacingX, y: startY + r * spacingY };
  });
  return out;
}

export function computeLayout(name: LayoutName, nodes: LayoutNode[], edges: LayoutEdge[]) {
  switch (name) {
    case "circle": return layoutCircle(nodes);
    case "grid": return layoutGrid(nodes);
    case "cluster": return layoutCluster(nodes);
    case "hierarchy": return layoutHierarchy(nodes);
    case "radial": return layoutRadial(nodes, edges);
    case "timeline": return layoutTimeline(nodes);
  }
}

export function snapToGrid(x: number, y: number, size = 20) {
  return { x: Math.round(x / size) * size, y: Math.round(y / size) * size };
}