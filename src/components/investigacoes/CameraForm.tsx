import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save, Trash2, Video, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { logHistorico, uploadArquivo } from "@/lib/investigacoes";
import { formatDateBR, brToISO, isoToBR } from "@/lib/format";

/** Vídeo anexado a um registro de câmera (armazenado em `cameras_investigacao.videos`). */
type CameraVideo = {
  nome: string;
  url: string;
  storage_path: string;
  mime: string;
};

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
  const [videos, setVideos] = useState<CameraVideo[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initial ?? { existe_gravacao: false });
    setDataBR(initial?.data ? isoToBR(initial.data) : "");
    setVideos(Array.isArray(initial?.videos) ? (initial.videos as CameraVideo[]) : []);
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  /** Envia um ou mais vídeos ao storage e adiciona à lista local. */
  const addVideos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: CameraVideo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("video/")) {
        toast.error(`"${file.name}" não é um vídeo`);
        continue;
      }
      const up = await uploadArquivo(user, file);
      if (!up) {
        toast.error(`Falha ao enviar "${file.name}"`);
        continue;
      }
      added.push({ nome: file.name, url: up.url, storage_path: up.storage_path, mime: up.mime });
    }
    setUploading(false);
    if (added.length) {
      setVideos((v) => [...v, ...added]);
      set("existe_gravacao", true);
      toast.success(`${added.length} vídeo(s) anexado(s)`);
    }
  };

  const pickVideos = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.multiple = true;
    input.onchange = () => addVideos(input.files);
    input.click();
  };

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
      videos,
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

        <div>
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-muted-foreground">
              Vídeos da câmera {videos.length > 0 && `(${videos.length})`}
            </label>
            <button
              type="button"
              onClick={pickVideos}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-medium hover:bg-primary/10 transition disabled:opacity-60"
            >
              <Upload size={14} /> {uploading ? "Enviando..." : "Anexar vídeo"}
            </button>
          </div>

          {videos.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3">
              Nenhum vídeo anexado. Envie as imagens obtidas desta câmera.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {videos.map((v, i) => (
                <div key={v.storage_path} className="rounded-lg border border-border p-2">
                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-primary shrink-0" />
                    <span className="flex-1 min-w-0 truncate text-xs">{v.nome}</span>
                    <button
                      type="button"
                      onClick={() => setVideos((list) => list.filter((_, idx) => idx !== i))}
                      className="h-7 w-7 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                      aria-label={`Remover ${v.nome}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <video src={v.url} controls preload="metadata" className="mt-2 w-full rounded-md bg-black" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
