import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NotaForm } from "./NotaForm";
import { EmptyHint } from "./ui";
import { fmtDataHora, logHistorico } from "@/lib/investigacoes";

export function TabAnotacoes({
  investigacaoId,
  user,
  items,
  refresh,
}: {
  investigacaoId: string;
  user: User;
  items: any[];
  refresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const remove = async (n: any) => {
    if (!confirm("Excluir esta anotação?")) return;
    const { error } = await supabase.from("notas_investigacao").delete().eq("id", n.id);
    if (error) return toast.error(error.message);
    await logHistorico(user, investigacaoId, "edicao", "Anotação removida");
    toast.success("Anotação excluída");
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {items.length} anotação(ões) — hipóteses, pendências e lembretes
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow hover:brightness-110 transition"
        >
          <Plus size={16} /> Nova anotação
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyHint>Nenhuma anotação criada ainda.</EmptyHint>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((n) => (
            <div key={n.id} className="rounded-2xl border border-primary/20 bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300 shrink-0">
                  <StickyNote size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                      {n.autor ?? "anônimo"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {fmtDataHora(n.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap break-words">{n.texto}</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditing(n);
                        setShowForm(true);
                      }}
                      className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(n)}
                      className="h-8 w-8 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <NotaForm
          user={user}
          investigacaoId={investigacaoId}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
