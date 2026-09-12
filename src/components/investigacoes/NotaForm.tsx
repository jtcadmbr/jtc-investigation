import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { logHistorico } from "@/lib/investigacoes";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

export function NotaForm({
  user,
  investigacaoId,
  initial,
  onClose,
  onSaved,
}: {
  user: User;
  investigacaoId: string;
  initial?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTexto(initial?.texto ?? "");
  }, [initial]);

  const submit = async () => {
    if (!texto.trim()) return toast.error("O texto da anotação é obrigatório");
    setSaving(true);

    const { error } = initial?.id
      ? await supabase
          .from("notas_investigacao")
          .update({ texto: texto.trim() })
          .eq("id", initial.id)
      : await supabase.from("notas_investigacao").insert({
          texto: texto.trim(),
          autor: user.email ?? user.id,
          user_id: user.id,
          investigacao_id: investigacaoId,
        });
    setSaving(false);
    if (error) return toast.error(error.message);

    await logHistorico(
      user,
      investigacaoId,
      initial?.id ? "edicao" : "nota",
      initial?.id ? "Anotação atualizada" : "Anotação adicionada",
    );
    toast.success(initial?.id ? "Anotação atualizada" : "Anotação adicionada");
    onSaved();
  };

  return (
    <ModalShell
      title={initial?.id ? "Editar anotação" : "Nova anotação"}
      onClose={onClose}
      maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow disabled:opacity-60"
          >
            <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </>
      }
    >
      <div>
        <label className="text-[11px] text-muted-foreground">Texto *</label>
        <textarea
          rows={6}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Anote hipóteses, pendências, lembretes..."
          className={`${baseCls} resize-y`}
        />
      </div>
    </ModalShell>
  );
}
