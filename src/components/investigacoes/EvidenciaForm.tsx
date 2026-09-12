import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { EVIDENCIA_TIPOS, VERIFICACAO, logHistorico, uploadArquivo } from "@/lib/investigacoes";
import { formatDateBR, brToISO, isoToBR } from "@/lib/format";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

function tipoFromMime(mime: string, fallback: string): string {
  if (mime.startsWith("image/")) return "foto";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  const name = fallback.toLowerCase();
  if (name.endsWith(".pdf") || /\.(docx?|xlsx?|txt|rtf)$/i.test(name)) return "documento";
  return "outros";
}

export function EvidenciaForm({
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
  const [form, setForm] = useState<any>({ status_verificacao: "nao_verificado", tipo: "outros" });
  const [dataBR, setDataBR] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ?? { status_verificacao: "nao_verificado", tipo: "outros" });
    setDataBR(initial?.data ? isoToBR(initial.data) : "");
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const onPickFile = (f: File | null) => {
    setFile(f);
    if (!f) return;
    if (!form.nome?.trim()) set("nome", f.name);
    set("tipo", tipoFromMime(f.type, f.name));
  };

  const submit = async () => {
    if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
    if (!file && !form.url?.trim() && !initial?.url)
      return toast.error("Anexe um arquivo ou informe uma URL");
    setSaving(true);

    const payload: any = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      descricao: form.descricao?.trim() || null,
      origem: form.origem?.trim() || null,
      status_verificacao: form.status_verificacao,
      data: brToISO(dataBR),
    };

    if (file) {
      const up = await uploadArquivo(user, file);
      if (!up) {
        setSaving(false);
        return toast.error("Falha no upload do arquivo");
      }
      payload.url = up.url;
      payload.storage_path = up.storage_path;
      payload.mime = up.mime || null;
    } else if (form.url?.trim()) {
      payload.url = form.url.trim();
    }

    let res;
    if (initial?.id) {
      res = await supabase
        .from("evidencias")
        .update(payload)
        .eq("id", initial.id)
        .select()
        .maybeSingle();
    } else {
      res = await supabase
        .from("evidencias")
        .insert({
          ...payload,
          user_id: user.id,
          investigacao_id: investigacaoId,
          adicionado_por: user.email ?? user.id,
        })
        .select()
        .maybeSingle();
    }
    setSaving(false);
    if (res.error || !res.data) return toast.error(res.error?.message || "Erro ao salvar");

    await logHistorico(
      user,
      investigacaoId,
      initial?.id ? "edicao" : "evidencia",
      initial?.id
        ? `Evidência atualizada — ${res.data.nome}`
        : `Evidência adicionada — ${res.data.nome}`,
    );
    toast.success(initial?.id ? "Evidência atualizada" : "Evidência adicionada");
    onSaved();
  };

  const preview = file
    ? URL.createObjectURL(file)
    : initial?.url && (initial.tipo === "foto" || initial.mime?.startsWith("image/"))
      ? initial.url
      : null;
  const showFileInput = !file && !initial?.url;

  return (
    <ModalShell
      title={initial?.id ? "Editar evidência" : "Adicionar evidência"}
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
          <label className="text-[11px] text-muted-foreground">
            Arquivo (foto, vídeo, áudio, documento)
          </label>
          <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-6 text-sm text-primary hover:bg-primary/10 transition">
            <Paperclip size={16} />
            {file
              ? file.name
              : initial?.url && !file
                ? "Arquivo já anexado — escolha outro para substituir"
                : "Clique para anexar um arquivo"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {preview && file && (
            <div className="mt-2">
              <img
                src={preview}
                alt=""
                className="max-h-40 rounded-lg border border-border object-contain"
              />
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Nome *</label>
            <input
              value={form.nome ?? ""}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: Foto da praça às 14h"
              className={baseCls}
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value)}
              className={baseCls}
            >
              {Object.entries(EVIDENCIA_TIPOS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
            <label className="text-[11px] text-muted-foreground">Origem</label>
            <input
              value={form.origem ?? ""}
              onChange={(e) => set("origem", e.target.value)}
              placeholder="De onde veio (câmera, pessoa, local...)"
              className={baseCls}
            />
          </div>
        </div>

        {!file && (
          <div>
            <label className="text-[11px] text-muted-foreground">Ou URL externa</label>
            <input
              value={form.url ?? ""}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://..."
              className={baseCls}
            />
          </div>
        )}

        <div>
          <label className="text-[11px] text-muted-foreground">Descrição</label>
          <textarea
            rows={3}
            value={form.descricao ?? ""}
            onChange={(e) => set("descricao", e.target.value)}
            className={`${baseCls} resize-y`}
          />
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
    </ModalShell>
  );
}
