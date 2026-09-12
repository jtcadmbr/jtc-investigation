import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { RELATO_TIPOS, VERIFICACAO, logHistorico } from "@/lib/investigacoes";
import { formatDateBR, brToISO, isoToBR } from "@/lib/format";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

export function RelatoForm({
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
  const [form, setForm] = useState<any>({
    tipo: "informacao_nao_verificada",
    status_verificacao: "nao_verificado",
  });
  const [dataBR, setDataBR] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(
      initial ?? {
        tipo: "informacao_nao_verificada",
        status_verificacao: "nao_verificado",
      },
    );
    setDataBR(initial?.data ? isoToBR(initial.data) : "");
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.texto?.trim()) return toast.error("O texto do relato é obrigatório");
    setSaving(true);

    const payload: any = {
      ...form,
      texto: form.texto.trim(),
      autor_fonte: form.autor_fonte?.trim() || null,
      hora: form.hora?.trim() || null,
      observacoes: form.observacoes?.trim() || null,
      data: brToISO(dataBR),
      user_id: user.id,
      investigacao_id: investigacaoId,
    };

    const { data, error } = initial?.id
      ? await supabase.from("relatos").update(payload).eq("id", initial.id).select().maybeSingle()
      : await supabase.from("relatos").insert(payload).select().maybeSingle();
    setSaving(false);
    if (error || !data) return toast.error(error?.message || "Erro ao salvar");

    const tipoLabel = RELATO_TIPOS[data.tipo] ?? data.tipo;
    const autor = data.autor_fonte ? ` — ${data.autor_fonte}` : "";
    await logHistorico(
      user,
      investigacaoId,
      initial?.id ? "edicao" : "relato",
      initial?.id
        ? `Relato atualizado (${tipoLabel})${autor}`
        : `Relato registrado (${tipoLabel})${autor}`,
    );
    toast.success(initial?.id ? "Relato atualizado" : "Relato registrado");
    onSaved();
  };

  return (
    <ModalShell
      title={initial?.id ? "Editar relato" : "Registrar relato"}
      onClose={onClose}
      maxWidth="max-w-2xl"
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
        <div className="grid sm:grid-cols-3 gap-3">
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
            <label className="text-[11px] text-muted-foreground">Hora</label>
            <input
              value={form.hora ?? ""}
              onChange={(e) => set("hora", e.target.value)}
              placeholder="Ex: 14h30"
              className={baseCls}
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Autor / fonte</label>
            <input
              value={form.autor_fonte ?? ""}
              onChange={(e) => set("autor_fonte", e.target.value)}
              placeholder="Quem trouxe a informação"
              className={baseCls}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Tipo da informação</label>
            <select
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value)}
              className={baseCls}
            >
              {Object.entries(RELATO_TIPOS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Status de verificação</label>
            <select
              value={form.status_verificacao}
              onChange={(e) => set("status_verificacao", e.target.value)}
              className={baseCls}
            >
              {Object.entries(VERIFICACAO).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Texto completo *</label>
          <textarea
            rows={5}
            value={form.texto ?? ""}
            onChange={(e) => set("texto", e.target.value)}
            placeholder="Conteúdo da informação, o mais completo possível..."
            className={`${baseCls} resize-y`}
          />
        </div>

        {form.tipo === "informacao_nao_verificada" && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
            <TriangleAlert size={14} className="shrink-0 mt-0.5" />
            <span>
              Informação não verificada: registrada como veio, mas{" "}
              <strong>não significa que seja verdadeira</strong>. É preciso cruzar e confirmar antes
              de usar.
            </span>
          </div>
        )}

        <div>
          <label className="text-[11px] text-muted-foreground">Observações</label>
          <textarea
            rows={2}
            value={form.observacoes ?? ""}
            onChange={(e) => set("observacoes", e.target.value)}
            className={`${baseCls} resize-y`}
          />
        </div>
      </div>
    </ModalShell>
  );
}
