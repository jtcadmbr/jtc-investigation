import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { logHistorico } from "@/lib/investigacoes";
import { formatDateBR, brToISO, isoToBR } from "@/lib/format";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

export function CameraForm({
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
  const [form, setForm] = useState<any>({ existe_gravacao: false });
  const [dataBR, setDataBR] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ?? { existe_gravacao: false });
    setDataBR(initial?.data ? isoToBR(initial.data) : "");
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.local?.trim()) return toast.error("Local da câmera é obrigatório");
    setSaving(true);

    const payload: any = {
      ...form,
      local: form.local.trim(),
      observacoes: form.observacoes?.trim() || null,
      horario_aproximado: form.horario_aproximado?.trim() || null,
      data: brToISO(dataBR),
      existe_gravacao: !!form.existe_gravacao,
      user_id: user.id,
      investigacao_id: investigacaoId,
    };

    const { data, error } = initial?.id
      ? await supabase
          .from("cameras_investigacao")
          .update(payload)
          .eq("id", initial.id)
          .select()
          .maybeSingle()
      : await supabase.from("cameras_investigacao").insert(payload).select().maybeSingle();
    setSaving(false);
    if (error || !data) return toast.error(error?.message || "Erro ao salvar");

    await logHistorico(
      user,
      investigacaoId,
      initial?.id ? "edicao" : "camera",
      initial?.id ? `Câmera atualizada — ${data.local}` : `Câmera registrada — ${data.local}`,
    );
    toast.success(initial?.id ? "Câmera atualizada" : "Câmera registrada");
    onSaved();
  };

  return (
    <ModalShell
      title={initial?.id ? "Editar câmera" : "Registrar câmera"}
      onClose={onClose}
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
      <div className="space-y-4">
        <div>
          <label className="text-[11px] text-muted-foreground">Local da câmera *</label>
          <input
            value={form.local ?? ""}
            onChange={(e) => set("local", e.target.value)}
            placeholder="Ex: Graal General Osório — câmera do caixa"
            className={baseCls}
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Existe gravação?</label>
          <div className="flex gap-1.5 mt-1">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => set("existe_gravacao", v)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  form.existe_gravacao === v
                    ? "border-primary bg-primary/20 text-primary glow"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {v ? "Sim" : "Não"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Data</label>
            <input
              inputMode="numeric"
              maxLength={10}
              value={dataBR}
              onChange={(e) => setDataBR(formatDateBR(e.target.value))}
              placeholder="dd/mm/aaaa"
              className={baseCls}
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Horário aproximado</label>
            <input
              value={form.horario_aproximado ?? ""}
              onChange={(e) => set("horario_aproximado", e.target.value)}
              placeholder="Ex: entre 13h e 14h"
              className={baseCls}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Observações</label>
          <textarea
            rows={3}
            value={form.observacoes ?? ""}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Ângulo, identificação da câmera, quem solicitou as imagens..."
            className={`${baseCls} resize-y`}
          />
        </div>
      </div>
    </ModalShell>
  );
}
