import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TriangleAlert, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RelatoForm } from "./RelatoForm";
import { EmptyHint, VerificacaoBadge } from "./ui";
import { RELATO_TIPOS, fmtData, fmtDataHora, logHistorico } from "@/lib/investigacoes";

export function TabRelatos({
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

  const remove = async (r: any) => {
    if (!confirm("Excluir este relato?")) return;
    const { error } = await supabase.from("relatos").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    await logHistorico(
      user,
      investigacaoId,
      "edicao",
      `Relato removido (${RELATO_TIPOS[r.tipo] ?? r.tipo})`,
    );
    toast.success("Relato excluído");
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {items.length} relato(s) registrado(s) na investigação
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow hover:brightness-110 transition"
        >
          <Plus size={16} /> Registrar relato
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyHint>
          Nenhum relato registrado. O primeiro relato pode ser a informação mais importante do caso.
        </EmptyHint>
      ) : (
        <div className="space-y-4">
          {items.map((r) => {
            const naoVerificada = r.tipo === "informacao_nao_verificada";
            return (
              <div key={r.id} className="rounded-2xl border border-primary/20 bg-card p-5">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary uppercase tracking-wider">
                    {RELATO_TIPOS[r.tipo] ?? r.tipo}
                  </span>
                  <VerificacaoBadge status={r.status_verificacao} />
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={11} />
                    {r.data ? fmtData(r.data) : "sem data"}
                    {r.hora ? ` • ${r.hora}` : ""}
                  </span>
                </div>

                {r.autor_fonte && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="text-[10px] uppercase tracking-widest text-primary">
                      Autor / fonte:{" "}
                    </span>
                    {r.autor_fonte}
                  </p>
                )}

                <p className="mt-2 text-sm whitespace-pre-wrap">{r.texto}</p>

                {naoVerificada && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
                    <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Esta informação <strong>não foi verificada</strong> — pode não ser verdadeira.
                      Use com cautela até confirmar.
                    </span>
                  </div>
                )}

                {r.observacoes && (
                  <div className="mt-3 rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Observações
                    </div>
                    <p className="mt-1 text-xs">{r.observacoes}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {fmtDataHora(r.created_at)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setShowForm(true);
                      }}
                      className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="h-8 w-8 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <RelatoForm
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
