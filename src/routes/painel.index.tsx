import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Network, Trash2, Pencil, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { cq } from "@/lib/offline-cache";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useRealtime } from "@/hooks/use-realtime";

export const Route = createFileRoute("/painel/")({ component: Page });

type Board = {
  id: string;
  titulo: string;
  descricao: string | null;
  created_at: string;
};

function Page() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Board | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await cq<Board[]>("boards.all", () =>
      supabase.from("boards").select("*").order("created_at", { ascending: false }));
    setBoards((data as Board[]) || []);
    if (data && data.length) {
      const { data: nodes } = await cq<any[]>("panel_nodes.board_ids", () =>
        supabase.from("panel_nodes").select("board_id"));
      const map: Record<string, number> = {};
      (nodes || []).forEach((n: any) => {
        map[n.board_id] = (map[n.board_id] || 0) + 1;
      });
      setCounts(map);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  useRealtime(["boards", "panel_nodes"], load);

  const openCreate = () => {
    setEditing(null);
    setTitulo("");
    setDescricao("");
    setShowForm(true);
  };
  const openEdit = (b: Board) => {
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
      const { error } = await supabase
        .from("boards")
        .update({ titulo: titulo.trim(), descricao: descricao.trim() || null })
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Painel atualizado");
    } else {
      const { error } = await supabase.from("boards").insert({
        user_id: user!.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
      });
      if (error) return toast.error(error.message);
      toast.success("Painel criado");
    }
    setShowForm(false);
    load();
  };

  const remove = async (b: Board) => {
    if (!confirm(`Excluir painel "${b.titulo}"? As pessoas continuam cadastradas.`))
      return;
    const { error } = await supabase.from("boards").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Painel excluído");
    load();
  };

  return (
    <AppShell title="Painéis Visuais">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Crie quantos painéis quiser e adicione apenas as pessoas que interessam a cada um.
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow"
        >
          <Plus size={16} /> Novo painel
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : boards.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-primary/30 rounded-2xl">
          <Network className="mx-auto mb-3 text-primary" size={32} />
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum painel criado ainda.
          </p>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow"
          >
            Criar primeiro painel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boards.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-2xl border border-primary/30 bg-card p-4 hover:border-primary transition"
            >
              <Link
                to="/painel/$id"
                params={{ id: b.id }}
                className="block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Network className="text-primary" size={18} />
                  <h3 className="font-semibold truncate">{b.titulo}</h3>
                </div>
                {b.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {b.descricao}
                  </p>
                )}
                <div className="text-[10px] uppercase tracking-wider text-primary">
                  {counts[b.id] || 0} no painel
                </div>
              </Link>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => openEdit(b)}
                  className="p-1.5 rounded-md bg-background/80 border border-border hover:border-primary"
                  title="Renomear"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => remove(b)}
                  className="p-1.5 rounded-md bg-background/80 border border-border hover:border-destructive hover:text-destructive"
                  title="Excluir"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/30 rounded-2xl w-full max-w-md glow"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">
                {editing ? "Renomear painel" : "Novo painel"}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Título
                </label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Operação Alpha"
                  className="mt-1 w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Descrição (opcional)
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 bg-input border border-border rounded-lg text-sm outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-lg border border-border text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm glow"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
