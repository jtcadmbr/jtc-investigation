import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Save, Camera, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { logHistorico, uploadArquivo } from "@/lib/investigacoes";
import { formatDateBR, brToISO, isoToBR } from "@/lib/format";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

function TriBool({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const opts = [
    { v: true, l: "Sim" },
    { v: false, l: "Não" },
    { v: null, l: "Não informado" },
  ];
  return (
    <div>
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {opts.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              value === o.v
                ? "border-primary bg-primary/20 text-primary glow"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TestemunhaForm({
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
  const [form, setForm] = useState<any>({});
  const [dataBR, setDataBR] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial ?? {});
    setDataBR(initial?.data_relato ? isoToBR(initial.data_relato) : "");
    setFotoFile(null);
    setVideoFile(null);
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.nome?.trim()) return toast.error("Nome ou identificação é obrigatório");
    setSaving(true);

    const payload: any = {
      ...form,
      nome: form.nome.trim(),
      user_id: user.id,
      investigacao_id: investigacaoId,
      idade: form.idade === "" || form.idade == null ? null : Number(form.idade),
      data_relato: brToISO(dataBR),
      local_estava: form.local_estava?.trim() || null,
      relato: form.relato?.trim() || null,
      o_que_lembra: form.o_que_lembra?.trim() || null,
      o_que_nao_tem_certeza: form.o_que_nao_tem_certeza?.trim() || null,
      observacoes: form.observacoes?.trim() || null,
    };
    for (const k of ["estava_presente", "viu_pessoalmente", "ouviu_pessoalmente"]) {
      payload[k] = form[k] == null ? null : !!form[k];
    }

    let fotoUrl: string | null = form.foto_url ?? null;
    let fotoPath: string | null = form.foto_storage_path ?? null;
    let videoUrl: string | null = form.video_url ?? null;
    let videoPath: string | null = form.video_storage_path ?? null;

    if (fotoFile) {
      const up = await uploadArquivo(user, fotoFile);
      if (!up) {
        setSaving(false);
        return toast.error("Falha no upload da foto");
      }
      if (fotoPath) await supabase.storage.from("uploads").remove([fotoPath]);
      fotoUrl = up.url;
      fotoPath = up.storage_path;
    }
    if (videoFile) {
      const up = await uploadArquivo(user, videoFile);
      if (!up) {
        setSaving(false);
        return toast.error("Falha no upload do vídeo");
      }
      if (videoPath) await supabase.storage.from("uploads").remove([videoPath]);
      videoUrl = up.url;
      videoPath = up.storage_path;
    }

    payload.foto_url = fotoUrl;
    payload.foto_storage_path = fotoPath;
    payload.video_url = videoUrl;
    payload.video_storage_path = videoPath;

    const { data, error } = initial?.id
      ? await supabase
          .from("testemunhas")
          .update(payload)
          .eq("id", initial.id)
          .select()
          .maybeSingle()
      : await supabase.from("testemunhas").insert(payload).select().maybeSingle();
    setSaving(false);
    if (error || !data) return toast.error(error?.message || "Erro ao salvar");

    await logHistorico(
      user,
      investigacaoId,
      initial?.id ? "edicao" : "testemunha",
      initial?.id ? `Testemunha atualizada — ${data.nome}` : `Testemunha adicionada — ${data.nome}`,
    );
    toast.success(initial?.id ? "Testemunha atualizada" : "Testemunha adicionada");
    onSaved();
  };

  return (
    <ModalShell
      title={initial?.id ? "Editar testemunha" : "Adicionar testemunha"}
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
          <div className="sm:col-span-2">
            <label className="text-[11px] text-muted-foreground">Nome ou identificação *</label>
            <input
              value={form.nome ?? ""}
              onChange={(e) => set("nome", e.target.value)}
              placeholder={`Nome completo ou "desconhecido — apelido"`}
              className={baseCls}
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Idade</label>
            <input
              type="number"
              value={form.idade ?? ""}
              onChange={(e) => set("idade", e.target.value)}
              placeholder="Ex: 34"
              className={baseCls}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Data do relato</label>
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
            <label className="text-[11px] text-muted-foreground">Local onde estava</label>
            <input
              value={form.local_estava ?? ""}
              onChange={(e) => set("local_estava", e.target.value)}
              placeholder="Ex: casa da avó, praça..."
              className={baseCls}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <TriBool
            label="Estava presente no local?"
            value={form.estava_presente ?? null}
            onChange={(v) => set("estava_presente", v)}
          />
          <TriBool
            label="Viu pessoalmente?"
            value={form.viu_pessoalmente ?? null}
            onChange={(v) => set("viu_pessoalmente", v)}
          />
          <TriBool
            label="Ouviu pessoalmente?"
            value={form.ouviu_pessoalmente ?? null}
            onChange={(v) => set("ouviu_pessoalmente", v)}
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">
            Relato completo{" "}
            <span className="text-muted-foreground/60">
              (com as próprias palavras da testemunha)
            </span>
          </label>
          <textarea
            rows={5}
            value={form.relato ?? ""}
            onChange={(e) => set("relato", e.target.value)}
            placeholder="Registre o relato sem interpretações..."
            className={`${baseCls} resize-y`}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">O que lembra</label>
            <textarea
              rows={3}
              value={form.o_que_lembra ?? ""}
              onChange={(e) => set("o_que_lembra", e.target.value)}
              className={`${baseCls} resize-y`}
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">O que não tem certeza</label>
            <textarea
              rows={3}
              value={form.o_que_nao_tem_certeza ?? ""}
              onChange={(e) => set("o_que_nao_tem_certeza", e.target.value)}
              className={`${baseCls} resize-y`}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">Observações</label>
          <textarea
            rows={2}
            value={form.observacoes ?? ""}
            onChange={(e) => set("observacoes", e.target.value)}
            className={`${baseCls} resize-y`}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground">Foto da testemunha</label>
            <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-5 text-sm text-primary hover:bg-primary/10 transition">
              <Camera size={16} />
              {fotoFile
                ? fotoFile.name
                : initial?.foto_url && !fotoFile
                  ? "Foto já anexada — escolha outra para substituir"
                  : "Anexar uma foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {(fotoFile || initial?.foto_url) && (
              <div className="mt-2">
                <img
                  src={fotoFile ? URL.createObjectURL(fotoFile) : initial?.foto_url}
                  alt=""
                  className="max-h-40 rounded-lg border border-border object-contain"
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Vídeo da testemunha</label>
            <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-5 text-sm text-primary hover:bg-primary/10 transition">
              <Video size={16} />
              {videoFile
                ? videoFile.name
                : initial?.video_url && !videoFile
                  ? "Vídeo já anexado — escolha outro para substituir"
                  : "Anexar um vídeo"}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {(videoFile || initial?.video_url) && (
              <div className="mt-2">
                <video
                  src={videoFile ? URL.createObjectURL(videoFile) : initial?.video_url}
                  controls
                  className="max-h-40 w-full rounded-lg border border-border bg-black"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
