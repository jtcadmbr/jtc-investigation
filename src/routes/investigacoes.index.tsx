import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Trash2, Eye, Pencil, Filter, Microscope } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InvestigacaoForm } from "@/components/investigacoes/InvestigacaoForm";
import { StatusBadge, PrioridadeBadge } from "@/components/investigacoes/ui";
import { useRealtime } from "@/hooks/use-realtime";
import { useAuth } from "@/lib/auth";
import { cq } from "@/lib/offline-cache";
import { INVESTIGACAO_STATUS, fmtData } from "@/lib/investigacoes";

export const Route = createFileRoute("/investigacoes/")({ component: Page });

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error, offline } = await cq<any[]>("investigacoes.all", () =>
      supabase.from("investigacoes").select("*").order("created_at", { ascending: false }),
    );
    if (error) toast.error(error.message);
    else {
      setItems(data || []);
      if (offline) toast.info("Modo offline — exibindo dados salvos no dispositivo.");
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  useRealtime(["investigacoes"], load);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(i.status);
      if (!term) return matchStatus;
      const blob = [i.numero, i.titulo, i.descricao].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && blob.includes(term);
    });
  }, [items, q, statusFilter]);

  const toggleStatus = (s: string) =>
    setStatusFilter((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const remove = async (id: string) => {
    if (!confirm("Excluir esta investigação e todos os dados vinculados?")) return;
    const { error } = await supabase.from("investigacoes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Investigação excluída");
      load();
    }
  };

  return (
    <AppShell title="Investigações">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por número, título, descrição..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none text-sm"
          />
        </div>
        <button
          onClick={() => setShowStatusPicker(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-input border border-border text-sm hover:border-primary transition"
        >
          <Filter size={16} />
          {statusFilter.length === 0 ? "Todos status" : `${statusFilter.length} selecionado(s)`}
        </button>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium glow hover:brightness-110 transition"
        >
          <Plus size={18} /> Nova investigação
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 border border-dashed border-border rounded-xl text-center px-4">
          <Microscope size={28} className="text-primary mb-3" />
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma investigação aberta. Clique em{" "}
              <strong className="text-primary">Nova investigação</strong> para começar.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nenhum caso encontrado com os filtros atuais.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
                className="group relative rounded-2xl border border-primary/20 bg-card p-5 hover:border-primary/60 hover:glow transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary font-mono tracking-wider">
                    {p.numero}
                  </span>
                  <StatusBadge status={p.status} />
                </div>

                <h3 className="mt-3 font-semibold line-clamp-2">{p.titulo}</h3>
                <div className="mt-2">
                  <PrioridadeBadge prioridade={p.prioridade} />
                </div>

                {p.descricao && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>
                )}

                <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Aberta em {p.data_abertura ? fmtData(p.data_abertura) : fmtData(p.created_at)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => navigate({ to: "/investigacoes/$id", params: { id: p.id } })}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs hover:bg-primary/20 transition"
                  >
                    <Eye size={14} /> Abrir
                  </button>
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                    className="px-2 py-1.5 rounded-md border border-border hover:border-primary/40 transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="px-2 py-1.5 rounded-md border border-border text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showForm && user && (
        <InvestigacaoForm
          user={user}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={(inv) => {
            setShowForm(false);
            load();
            if (inv?.id) navigate({ to: "/investigacoes/$id", params: { id: inv.id } });
          }}
        />
      )}

      {showStatusPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowStatusPicker(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-primary/30 rounded-2xl w-full max-w-sm glow"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Filtrar por status</h3>
              <button
                onClick={() => setStatusFilter([])}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Limpar
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 gap-2">
              {Object.entries(INVESTIGACAO_STATUS).map(([s, meta]) => {
                const active = statusFilter.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition ${active ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setShowStatusPicker(false)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow"
              >
                Aplicar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
