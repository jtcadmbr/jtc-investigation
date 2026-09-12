import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Video, CheckCheck, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CameraForm } from "./CameraForm";
import { EmptyHint } from "./ui";
import { fmtData, logHistorico } from "@/lib/investigacoes";

export function TabCameras({
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

  const remove = async (c: any) => {
    if (!confirm(`Excluir a câmera "${c.local}"?`)) return;
    const { error } = await supabase.from("cameras_investigacao").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    await logHistorico(user, investigacaoId, "edicao", `Câmera removida — ${c.local}`);
    toast.success("Câmera excluída");
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          Câmeras de possíveis imagens do fato — {items.length} registrada(s)
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow hover:brightness-110 transition"
        >
          <Plus size={16} /> Registrar câmera
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyHint>
          Nenhuma câmera do local registrada. Pense em câmeras de comércios, prédios e vias
          próximas.
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-primary/20 bg-card p-4 hover:border-primary/50 transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <Video size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{c.local}</h4>
                  <span
                    className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      c.existe_gravacao
                        ? "border-green-500/40 bg-green-500/10 text-green-300"
                        : "border-red-500/40 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {c.existe_gravacao ? "Há gravação" : "Sem gravação"}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {c.data && (
                  <p className="flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" /> {fmtData(c.data)}
                  </p>
                )}
                {c.horario_aproximado && (
                  <p className="flex items-center gap-1.5">
                    <CheckCheck size={12} className="text-primary" /> {c.horario_aproximado}
                  </p>
                )}
                {c.observacoes && (
                  <p className="flex items-start gap-1.5">
                    <MapPin size={12} className="text-primary shrink-0 mt-0.5" /> {c.observacoes}
                  </p>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditing(c);
                    setShowForm(true);
                  }}
                  className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(c)}
                  className="h-8 w-8 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CameraForm
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
