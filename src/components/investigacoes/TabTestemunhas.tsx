import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserRound, EyeOff, Eye, Ear } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TestemunhaForm } from "./TestemunhaForm";
import { EmptyHint } from "./ui";
import { fmtData, logHistorico } from "@/lib/investigacoes";

function TriLabel({ value, sim, nao }: { value: boolean | null; sim: string; nao: string }) {
  if (value === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${
        value
          ? "border-green-500/40 bg-green-500/10 text-green-300"
          : "border-red-500/40 bg-red-500/10 text-red-300"
      }`}
    >
      {value ? sim : nao}
    </span>
  );
}

export function TabTestemunhas({
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

  const remove = async (t: any) => {
    if (!confirm(`Excluir a testemunha "${t.nome}"?`)) return;
    const { error } = await supabase.from("testemunhas").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    await logHistorico(user, investigacaoId, "edicao", `Testemunha removida — ${t.nome}`);
    toast.success("Testemunha excluída");
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {items.length} testemunha(s) registradas na investigação
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow hover:brightness-110 transition"
        >
          <Plus size={16} /> Adicionar testemunha
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyHint>
          Nenhuma testemunha registrada. Use{" "}
          <strong className="text-primary">Adicionar testemunha</strong>.
        </EmptyHint>
      ) : (
        <div className="space-y-4">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl border border-primary/20 bg-card p-5">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="h-10 w-10 rounded-full bg-muted border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <UserRound size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{t.nome}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {t.idade != null && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-wider">
                        {t.idade} anos
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-wider">
                      Relato: {fmtData(t.data_relato)}
                    </span>
                    <TriLabel
                      value={t.estava_presente}
                      sim="Estava presente"
                      nao="Não estava presente"
                    />
                    <TriLabel
                      value={t.viu_pessoalmente}
                      sim="Viu pessoalmente"
                      nao="Não viu pessoalmente"
                    />
                    <TriLabel
                      value={t.ouviu_pessoalmente}
                      sim="Ouviu pessoalmente"
                      nao="Não ouviu pessoalmente"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(t);
                      setShowForm(true);
                    }}
                    className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="h-8 w-8 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {t.local_estava && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <span className="text-[10px] uppercase tracking-widest text-primary">
                    Local onde estava:{" "}
                  </span>
                  {t.local_estava}
                </p>
              )}

              {t.relato && (
                <div className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 p-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Relato completo
                  </p>
                  <p className="text-sm italic">{t.relato}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {t.o_que_lembra && (
                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary">
                      <Eye size={11} /> O que lembra
                    </div>
                    <p className="mt-1 text-xs">{t.o_que_lembra}</p>
                  </div>
                )}
                {t.o_que_nao_tem_certeza && (
                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <EyeOff size={11} /> O que não tem certeza
                    </div>
                    <p className="mt-1 text-xs">{t.o_que_nao_tem_certeza}</p>
                  </div>
                )}
              </div>

              {t.observacoes && (
                <div className="mt-3 rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <Ear size={11} /> Observações
                  </div>
                  <p className="mt-1 text-xs">{t.observacoes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TestemunhaForm
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
