import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { INVESTIGACAO_STATUS, PRIORIDADES, gerarNumero, logHistorico } from "@/lib/investigacoes";
import { formatDateBR, brToISO, isoToBR } from "@/lib/format";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

export function InvestigacaoForm({
  user,
  initial,
  onClose,
  onSaved,
}: {
  user: User;
  initial?: any;
  onClose: () => void;
  onSaved: (investigacao: any) => void;
}) {
  const [form, setForm] = useState<any>({ status: "em_apuracao", prioridade: "media" });
  const [dataBR, setDataBR] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const base = initial ?? { status: "em_apuracao", prioridade: "media" };
    setForm(base);
    setDataBR(
      initial?.data_abertura
        ? isoToBR(initial.data_abertura)
        : new Date().toLocaleDateString("pt-BR"),
    );
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.titulo?.trim()) return toast.error("Título é obrigatório");
    setSaving(true);

    const payload: any = {
      titulo: form.titulo.trim(),
      descricao: form.descricao?.trim() || null,
      observacoes: form.observacoes?.trim() || null,
      status: form.status,
      prioridade: form.prioridade,
      data_abertura: brToISO(dataBR),
      user_id: user.id,
    };

    if (initial?.id) {
      const { data, error } = await supabase
        .from("investigacoes")
        .update(payload)
        .eq("id", initial.id)
        .select()
        .maybeSingle();
      setSaving(false);
      if (error || !data) return toast.error(error?.message || "Erro ao salvar");

      const diffs: string[] = [];
      if (initial.status !== data.status)
        diffs.push(
          `Status: ${INVESTIGACAO_STATUS[initial.status]?.label ?? initial.status} → ${INVESTIGACAO_STATUS[data.status]?.label ?? data.status}`,
        );
      if (initial.prioridade !== data.prioridade)
        diffs.push(
          `Prioridade: ${PRIORIDADES[initial.prioridade]?.label ?? initial.prioridade} → ${PRIORIDADES[data.prioridade]?.label ?? data.prioridade}`,
        );
      if (initial.titulo !== data.titulo) diffs.push("Título atualizado");
      if ((initial.descricao ?? null) !== data.descricao) diffs.push("Descrição atualizada");

      const tipo =
        diffs.length === 1 && diffs[0].startsWith("Status")
          ? "status"
          : diffs.length === 1 && diffs[0].startsWith("Prioridade")
            ? "prioridade"
            : "edicao";
      if (diffs.length) await logHistorico(user, data.id, tipo, diffs.join(" • "));

      toast.success("Investigação atualizada");
      onSaved(data);
      return;
    }

    let saved: any = null;
    for (let attempts = 0; attempts < 5 && !saved; attempts++) {
      const numero = await gerarNumero(user.id);
      const { data, error } = await supabase
        .from("investigacoes")
        .insert({ ...payload, numero })
        .select()
        .maybeSingle();
      if (error) {
        if (/duplicate|unique/i.test(error.message || "")) continue;
        setSaving(false);
        return toast.error(error.message);
      }
      saved = data;
    }

    if (!saved) {
      setSaving(false);
      return toast.error("Não foi possível gerar um número único para a investigação");
    }

    await logHistorico(user, saved.id, "criacao", `Investigação aberta — ${saved.titulo}`);
    setSaving(false);
    toast.success(`Investigação ${saved.numero} criada`);
    onSaved(saved);
  };

  return (
    <ModalShell
      title={initial?.id ? "Editar investigação" : "Nova investigação"}
      subtitle={initial?.id ? initial.numero : "O número será gerado automaticamente"}
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
      <div className="space-y-4">
        <div>
          <label className="text-[11px] text-muted-foreground">Título da investigação *</label>
          <input
            value={form.titulo ?? ""}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ex: Desaparecimento da Rua das Flores"
            className={baseCls}
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Descrição inicial</label>
          <textarea
            rows={4}
            value={form.descricao ?? ""}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Contexto do caso, local, fatos conhecidos até aqui..."
            className={`${baseCls} resize-y`}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Data de abertura</label>
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
            <label className="text-[11px] text-muted-foreground">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={baseCls}
            >
              {Object.entries(INVESTIGACAO_STATUS).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Prioridade</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.entries(PRIORIDADES).map(([value, meta]) => (
              <button
                key={value}
                type="button"
                onClick={() => set("prioridade", value)}
                className={`px-3 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${
                  form.prioridade === value
                    ? "border-primary bg-primary/20 text-primary glow"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Observações</label>
          <textarea
            rows={3}
            value={form.observacoes ?? ""}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Notas gerais da investigação..."
            className={`${baseCls} resize-y`}
          />
        </div>
      </div>
    </ModalShell>
  );
}
