import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Trash2, Eye, Pencil, Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InvestigadoForm } from "@/components/InvestigadoForm";
import { useRealtime } from "@/hooks/use-realtime";
import { cq } from "@/lib/offline-cache";

export const Route = createFileRoute("/investigados/")({ component: Page });

const STATUS_COLORS: Record<string, string> = {
  suspeito: "bg-red-500/20 text-red-300 border-red-500/40",
  investigado: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  testemunha: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  familiar: "bg-yellow-500/20 text-yellow-200 border-yellow-500/40",
  contato: "bg-green-500/20 text-green-300 border-green-500/40",
  desaparecido: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
  sem_restricao: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  desconhecido: "bg-gray-500/20 text-gray-300 border-gray-500/40",
};

function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error, offline } = await cq<any[]>("investigateds.all", () =>
      supabase.from("investigateds").select("*").order("created_at", { ascending: false }),
    );
    if (error) toast.error(error.message);
    else {
      setItems(data || []);
      if (offline) toast.info("Modo offline — exibindo dados salvos no dispositivo.");
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  useRealtime(["investigateds"], load);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(i.status);
      if (!term) return matchStatus;
      const blob = [i.nome, i.cpf, i.telefone, i.email, i.cidade, i.descricao].filter(Boolean).join(" ").toLowerCase();
      return matchStatus && blob.includes(term);
    });
  }, [items, q, statusFilter]);

  const toggleStatus = (s: string) =>
    setStatusFilter((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const remove = async (id: string) => {
    if (!confirm("Excluir este registro?")) return;
    const { error } = await supabase.from("investigateds").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removido"); load(); }
  };

  return (
    <AppShell title="Pessoas">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar por nome, CPF, cidade..."
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
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium glow hover:brightness-110 transition"
        >
          <Plus size={18} /> Novo
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
          Nenhuma pessoa cadastrada. Clique em <strong className="text-primary">Novo</strong> para adicionar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="flex items-center gap-3">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nome} className="h-14 w-14 rounded-full object-cover border-2 border-primary/40" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
                      {p.nome?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{p.nome}</h3>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                {p.descricao && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Link to="/investigados/$id" params={{ id: p.id }} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs hover:bg-primary/20 transition">
                    <Eye size={14} /> Ver
                  </Link>
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="px-2 py-1.5 rounded-md border border-border hover:border-primary/40 transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(p.id)} className="px-2 py-1.5 rounded-md border border-border text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showForm && (
        <InvestigadoForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {showStatusPicker && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowStatusPicker(false)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-primary/30 rounded-2xl w-full max-w-sm glow"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Filtrar por status</h3>
              <button onClick={() => setStatusFilter([])} className="text-xs text-muted-foreground hover:text-primary">Limpar</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {Object.keys(STATUS_COLORS).map((s) => {
                const active = statusFilter.includes(s);
                return (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className={`px-3 py-2 rounded-lg border text-xs uppercase tracking-wider text-left transition ${active ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {s.replace("_", " ")}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setShowStatusPicker(false)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow">Aplicar</button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
