import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Image as ImageIcon, AlertTriangle, Check, Plus, Trash2, Link2, Link2Off } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { AvatarCropper } from "./AvatarCropper";
import { PhotoPicker } from "./PhotoPicker";
import { PersonPicker } from "./PersonPicker";
import { formatCPF, isValidCPF, formatRG, formatDateBR, brToISO, isoToBR, calcAge, formatPhoneBR } from "@/lib/format";
import { BR_STATES } from "@/lib/br-states";

const STATUSES = ["suspeito", "investigado", "testemunha", "familiar", "contato", "desaparecido", "sem_restricao", "desconhecido"] as const;

const FAMILY_KEYS: Record<string, string> = {
  nome_mae: "mãe", nome_pai: "pai",
  avo_materna: "avó materna", avo_materno: "avô materno",
  avo_paterna: "avó paterna", avo_paterno: "avô paterno",
  irmaos: "irmão", irmas: "irmã", tios: "tio", tias: "tia",
};

type Contato = { valor: string; obs?: string };
type FamilyLink = { id: string; nome: string };

const SECTIONS: { title: string; fields: { key: string; label: string; type?: string; rows?: number }[] }[] = [
  {
    title: "Identificação",
    fields: [
      { key: "nome", label: "Nome completo *" },
      { key: "cpf", label: "CPF" }, { key: "rg", label: "RG" },
      { key: "idade", label: "Idade", type: "number" },
      { key: "data_nascimento", label: "Data de nascimento (dd/mm/aaaa)" },
    ],
  },
  {
    title: "Família",
    fields: [
      { key: "nome_mae", label: "Mãe" }, { key: "nome_pai", label: "Pai" },
      { key: "avo_materna", label: "Avó materna" }, { key: "avo_materno", label: "Avô materno" },
      { key: "avo_paterna", label: "Avó paterna" }, { key: "avo_paterno", label: "Avô paterno" },
      { key: "irmaos", label: "Irmãos" }, { key: "irmas", label: "Irmãs" },
      { key: "tios", label: "Tios" }, { key: "tias", label: "Tias" },
    ],
  },
  {
    title: "Redes sociais",
    fields: [
      { key: "instagram", label: "Instagram" }, { key: "facebook", label: "Facebook" },
      { key: "tiktok", label: "TikTok" }, { key: "twitter", label: "X / Twitter" },
      { key: "youtube", label: "YouTube" }, { key: "linkedin", label: "LinkedIn" },
      { key: "outras_redes", label: "Outras redes" },
    ],
  },
  {
    title: "Notas",
    fields: [
      { key: "descricao", label: "Descrição", rows: 3 },
      { key: "observacoes", label: "Observações", rows: 3 },
    ],
  },
];

// chaves text/textarea que recebem "N" automático quando ficarem vazias
const AUTO_N_KEYS = [
  "cpf", "rg",
  "nome_mae", "nome_pai", "avo_materna", "avo_materno", "avo_paterna", "avo_paterno",
  "irmaos", "irmas", "tios", "tias",
  "instagram", "facebook", "tiktok", "twitter", "youtube", "linkedin", "outras_redes",
  "endereco", "cidade",
  "descricao", "observacoes",
];

function normalizeList(raw: any, legacy?: string): Contato[] {
  if (Array.isArray(raw) && raw.length) return raw.map((c: any) => ({ valor: c?.valor ?? "", obs: c?.obs ?? "" }));
  if (legacy && legacy !== "N") return [{ valor: legacy, obs: "" }];
  return [];
}

export function InvestigadoForm({ initial, onClose, onSaved }: { initial?: any; onClose: () => void; onSaved: () => void; }) {
  const { user } = useAuth();
  const [form, setForm] = useState<any>(initial ?? { status: "desconhecido", pais: "Brasil", fotos: [] });
  const [telefones, setTelefones] = useState<Contato[]>(normalizeList(initial?.telefones, initial?.telefone));
  const [emails, setEmails] = useState<Contato[]>(normalizeList(initial?.emails, initial?.email));
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"principal" | "extra">("principal");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"principal" | "extra">("principal");
  const [dataBR, setDataBR] = useState<string>(initial?.data_nascimento ? isoToBR(initial.data_nascimento) : "");
  const [dataObitoBR, setDataObitoBR] = useState<string>(initial?.data_obito ? isoToBR(initial.data_obito) : "");
  const [familyLinks, setFamilyLinks] = useState<Record<string, FamilyLink>>({});
  const [linkingField, setLinkingField] = useState<string | null>(null);

  useEffect(() => {
    setForm(initial ?? { status: "desconhecido", pais: "Brasil", fotos: [] });
    setTelefones(normalizeList(initial?.telefones, initial?.telefone));
    setEmails(normalizeList(initial?.emails, initial?.email));
    setDataBR(initial?.data_nascimento ? isoToBR(initial.data_nascimento) : "");
    setDataObitoBR(initial?.data_obito ? isoToBR(initial.data_obito) : "");
    setFamilyLinks({});
    if (initial?.id) {
      (async () => {
        const { data } = await supabase
          .from("connections")
          .select("rotulo,to_id,investigateds!connections_to_id_fkey(id,nome)")
          .eq("from_id", initial.id);
        const map: Record<string, FamilyLink> = {};
        (data || []).forEach((c: any) => {
          const key = Object.keys(FAMILY_KEYS).find((k) => FAMILY_KEYS[k] === c.rotulo);
          if (key && c.investigateds) map[key] = { id: c.investigateds.id, nome: c.investigateds.nome };
        });
        setFamilyLinks(map);
      })();
    }
  }, [initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const cpfValid = useMemo(() => {
    if (!form.cpf || form.cpf === "N") return null;
    return isValidCPF(form.cpf);
  }, [form.cpf]);

  const onChangeCPF = (v: string) => set("cpf", formatCPF(v));
  const onChangeRG = (v: string) => set("rg", formatRG(v));
  const onChangeData = (v: string) => {
    const f = formatDateBR(v);
    setDataBR(f);
    const iso = brToISO(f);
    if (iso) {
      set("data_nascimento", iso);
      const age = calcAge(iso);
      if (age !== null) set("idade", age);
    } else if (f === "") {
      set("data_nascimento", "");
    }
  };

  const addTel = () => setTelefones((t) => [...t, { valor: "", obs: "" }]);
  const rmTel = (i: number) => setTelefones((t) => t.filter((_, idx) => idx !== i));
  const setTel = (i: number, patch: Partial<Contato>) =>
    setTelefones((t) => t.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const addEmail = () => setEmails((e) => [...e, { valor: "", obs: "" }]);
  const rmEmail = (i: number) => setEmails((e) => e.filter((_, idx) => idx !== i));
  const setEmail = (i: number, patch: Partial<Contato>) =>
    setEmails((e) => e.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const onCropped = async (blob: Blob) => {
    const target = cropTarget;
    setCropSrc(null);
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.jpg`;
    const up = await supabase.storage.from("uploads").upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (up.error) return toast.error(up.error.message);
    const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
    const url = pub.publicUrl;
    await supabase.from("uploads").insert({
      user_id: user.id,
      nome: `foto-${form.nome || "pessoa"}-${Date.now()}.jpg`,
      tipo: "imagem", mime: "image/jpeg", tamanho: blob.size, storage_path: path, url,
    });
    if (target === "extra") {
      setForm((f: any) => ({ ...f, fotos: [...(f.fotos || []), url] }));
      toast.success("Foto adicionada");
    } else {
      set("foto_url", url);
      toast.success("Foto salva na galeria");
    }
  };

  const addFotoExtra = (url: string) => setForm((f: any) => ({ ...f, fotos: [...(f.fotos || []), url] }));
  const rmFotoExtra = (i: number) => setForm((f: any) => ({ ...f, fotos: (f.fotos || []).filter((_: any, idx: number) => idx !== i) }));

  const rmDoc = (i: number) => setForm((f: any) => ({ ...f, documentos: (f.documentos || []).filter((_: any, idx: number) => idx !== i) }));
  const setDocLabel = (i: number, label: string) =>
    setForm((f: any) => ({ ...f, documentos: (f.documentos || []).map((d: any, idx: number) => idx === i ? { ...d, label } : d) }));

  const uploadDoc = () => {
    if (!user) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/doc-${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("uploads").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) return toast.error(up.error.message);
      const { data: pub } = supabase.storage.from("uploads").getPublicUrl(path);
      const url = pub.publicUrl;
      await supabase.from("uploads").insert({
        user_id: user.id,
        nome: `doc-${form.nome || "pessoa"}-${Date.now()}.${ext}`,
        tipo: "imagem", mime: file.type, tamanho: file.size, storage_path: path, url,
      });
      setForm((f: any) => ({ ...f, documentos: [...(f.documentos || []), { url, label: "" }] }));
      toast.success("Documento adicionado");
    };
    input.click();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return toast.error("Nome é obrigatório");
    setSaving(true);

    const payload: any = { ...form, user_id: user!.id };

    payload.fotos = Array.isArray(payload.fotos) ? payload.fotos : [];
    payload.documentos = Array.isArray(payload.documentos) ? payload.documentos : [];

    // limpa idade/data
    if (payload.idade === "" || payload.idade == null) delete payload.idade;
    else payload.idade = Number(payload.idade);
    if (!payload.data_nascimento) delete payload.data_nascimento;
    if (!payload.obito || !payload.data_obito) payload.data_obito = null;

    // preenche "N" em campos vazios
    for (const k of AUTO_N_KEYS) {
      const v = payload[k];
      if (v == null || String(v).trim() === "") payload[k] = "N";
    }
    if (!payload.pais || String(payload.pais).trim() === "") payload.pais = "Brasil";
    if (!payload.estado || String(payload.estado).trim() === "") payload.estado = "N";

    // telefones / emails (limpa entradas vazias)
    const tels = telefones.filter((t) => t.valor.trim() !== "");
    const ems = emails.filter((t) => t.valor.trim() !== "");
    payload.telefones = tels;
    payload.emails = ems;
    payload.telefone = tels[0]?.valor || "N";
    payload.email = ems[0]?.valor || "N";

    const res = initial?.id
      ? await supabase.from("investigateds").update(payload).eq("id", initial.id).select().maybeSingle()
      : await supabase.from("investigateds").insert(payload).select().maybeSingle();
    if (res.error || !res.data) {
      setSaving(false);
      return toast.error(res.error?.message || "Erro ao salvar");
    }
    const savedId = res.data.id;

    // Sincroniza conexões familiares
    const familyRotulos = Object.values(FAMILY_KEYS);
    await supabase.from("connections").delete().eq("from_id", savedId).in("rotulo", familyRotulos);
    const rows = Object.entries(familyLinks)
      .filter(([, v]) => v?.id)
      .map(([k, v]) => ({
        user_id: user!.id, from_id: savedId, to_id: v.id, rotulo: FAMILY_KEYS[k],
      }));
    if (rows.length) await supabase.from("connections").insert(rows);

    setSaving(false);
    toast.success("Salvo");
    onSaved();
  };

  const baseCls = "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col glow"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold glow-text">{initial?.id ? "Editar" : "Nova"} pessoa</h2>
            <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-primary/40"><X size={18} /></button>
          </div>

          <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="flex items-center gap-4">
              {form.foto_url ? (
                <img src={form.foto_url} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-primary/50" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted border-2 border-primary/30" />
              )}
              <button type="button" onClick={() => { setPickerTarget("principal"); setShowPicker(true); }} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 text-primary text-sm hover:bg-primary/10">
                <ImageIcon size={16} /> {form.foto_url ? "Alterar foto" : "Adicionar foto"}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Fotos adicionais</label>
                <button type="button" onClick={() => { setPickerTarget("extra"); setShowPicker(true); }}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                  <Plus size={12} /> adicionar foto
                </button>
              </div>
              {(!form.fotos || form.fotos.length === 0) ? (
                <p className="text-[11px] text-muted-foreground mt-2 italic">Nenhuma foto adicional. Use para guardar várias fotos da mesma pessoa.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                  {(form.fotos as string[]).map((u, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={u} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => rmFotoExtra(i)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-md bg-black/70 text-destructive opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Documentos (RG, CNH, etc.)</label>
                <button type="button" onClick={uploadDoc}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                  <Plus size={12} /> adicionar documento
                </button>
              </div>
              {(!form.documentos || form.documentos.length === 0) ? (
                <p className="text-[11px] text-muted-foreground mt-2 italic">Nenhum documento. Anexe fotos de carteira de identidade, CNH, comprovantes...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {(form.documentos as any[]).map((d, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background/40 overflow-hidden">
                      <div className="relative group aspect-[4/3]">
                        <img src={d.url} alt={d.label || `Documento ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => rmDoc(i)}
                          className="absolute top-1 right-1 h-7 w-7 rounded-md bg-black/70 text-destructive opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input value={d.label ?? ""} onChange={(e) => setDocLabel(i, e.target.value)}
                        placeholder="ex: RG (frente)" className="w-full bg-transparent border-t border-border px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    </div>
                  ))}
                </div>
              )}
            </div>




            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Status</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {STATUSES.map((s) => (
                  <button key={s} type="button"
                    onClick={() => set("status", s)}
                    className={`px-3 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${form.status === s ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Óbito</label>
              <div className="flex gap-2 mt-2">
                {[{ v: false, l: "Não" }, { v: true, l: "Sim" }].map((o) => {
                  const active = !!form.obito === o.v;
                  return (
                    <button key={o.l} type="button" onClick={() => set("obito", o.v)}
                      className={`px-4 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${active ? (o.v ? "border-destructive bg-destructive/20 text-destructive glow" : "border-primary bg-primary/20 text-primary glow") : "border-border text-muted-foreground hover:border-primary/40"}`}>
                      {o.l}
                    </button>
                  );
                })}
              </div>
              {form.obito && (
                <div className="mt-3">
                  <label className="text-[11px] text-muted-foreground">Data de óbito (opcional)</label>
                  <input
                    inputMode="numeric"
                    placeholder="dd/mm/aaaa"
                    value={dataObitoBR}
                    onChange={(e) => {
                      const f = formatDateBR(e.target.value);
                      setDataObitoBR(f);
                      const iso = brToISO(f);
                      if (iso) set("data_obito", iso);
                      else if (f === "") set("data_obito", null);
                    }}
                    className={baseCls}
                  />
                </div>
              )}
            </div>



            {SECTIONS.slice(0, 1).map((sec) => (
              <SectionBlock key={sec.title} sec={sec} form={form} set={set} dataBR={dataBR}
                onChangeCPF={onChangeCPF} onChangeRG={onChangeRG} onChangeData={onChangeData} cpfValid={cpfValid} />
            ))}

            {/* Contato customizado */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Contato</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted-foreground">Telefones</label>
                    <button type="button" onClick={addTel} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                      <Plus size={12} /> adicionar telefone
                    </button>
                  </div>
                  {telefones.length === 0 && (
                    <p className="text-[11px] text-muted-foreground mt-2 italic">Nenhum telefone — será salvo como "N"</p>
                  )}
                  <div className="space-y-2 mt-2">
                    {telefones.map((t, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                        <input value={t.valor} onChange={(e) => setTel(i, { valor: formatPhoneBR(e.target.value) })}
                          placeholder="(00) 00000-0000" inputMode="numeric" className={baseCls} />
                        <input value={t.obs ?? ""} onChange={(e) => setTel(i, { obs: e.target.value })}
                          placeholder="observação (ex: antigo, recado…)" className={baseCls} />
                        <button type="button" onClick={() => rmTel(i)}
                          className="mt-1 h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted-foreground">E-mails</label>
                    <button type="button" onClick={addEmail} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                      <Plus size={12} /> adicionar e-mail
                    </button>
                  </div>
                  {emails.length === 0 && (
                    <p className="text-[11px] text-muted-foreground mt-2 italic">Nenhum e-mail — será salvo como "N"</p>
                  )}
                  <div className="space-y-2 mt-2">
                    {emails.map((t, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                        <input type="email" value={t.valor} onChange={(e) => setEmail(i, { valor: e.target.value })}
                          placeholder="email@exemplo.com" className={baseCls} />
                        <input value={t.obs ?? ""} onChange={(e) => setEmail(i, { obs: e.target.value })}
                          placeholder="observação (ex: não é mais dela)" className={baseCls} />
                        <button type="button" onClick={() => rmEmail(i)}
                          className="mt-1 h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-muted-foreground">Endereço (rua, número)</label>
                    <input value={form.endereco ?? ""} onChange={(e) => set("endereco", e.target.value)} className={baseCls} />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Cidade</label>
                    <input value={form.cidade ?? ""} onChange={(e) => set("cidade", e.target.value)} className={baseCls} />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Estado</label>
                    <select value={form.estado ?? ""} onChange={(e) => set("estado", e.target.value)} className={baseCls}>
                      <option value="">— selecionar —</option>
                      {BR_STATES.map(([uf, nome]) => (
                        <option key={uf} value={uf}>{uf} — {nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">País</label>
                    <input value={form.pais ?? "Brasil"} onChange={(e) => set("pais", e.target.value)} className={baseCls} />
                  </div>
                </div>
              </div>
            </div>

            {SECTIONS.slice(1).map((sec) => (
              <SectionBlock key={sec.title} sec={sec} form={form} set={set} dataBR={dataBR}
                onChangeCPF={onChangeCPF} onChangeRG={onChangeRG} onChangeData={onChangeData} cpfValid={cpfValid}
                familyLinks={familyLinks}
                onLinkField={(k: string) => setLinkingField(k)}
                onUnlinkField={(k: string) => setFamilyLinks((p) => { const n = { ...p }; delete n[k]; return n; })} />
            ))}
          </form>

          <div className="p-5 border-t border-border flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm">Cancelar</button>
            <button onClick={submit} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow disabled:opacity-60">
              <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </motion.div>
      </div>

      {showPicker && (
        <PhotoPicker
          onClose={() => setShowPicker(false)}
          onPick={(url) => {
            if (pickerTarget === "extra") { addFotoExtra(url); toast.success("Foto adicionada"); }
            else { set("foto_url", url); toast.success("Foto selecionada"); }
            setShowPicker(false);
          }}
          onPickFile={(dataUrl) => { setCropTarget(pickerTarget); setShowPicker(false); setCropSrc(dataUrl); }}
        />
      )}

      {cropSrc && <AvatarCropper src={cropSrc} onCancel={() => setCropSrc(null)} onDone={onCropped} />}

      {linkingField && (
        <PersonPicker
          title={`Vincular ${FAMILY_KEYS[linkingField]}`}
          excludeId={initial?.id}
          onClose={() => setLinkingField(null)}
          onPick={(p) => {
            setFamilyLinks((prev) => ({ ...prev, [linkingField]: { id: p.id, nome: p.nome } }));
            setForm((f: any) => ({ ...f, [linkingField]: p.nome }));
            setLinkingField(null);
          }}
        />
      )}
    </>
  );
}

function SectionBlock({ sec, form, set, dataBR, onChangeCPF, onChangeRG, onChangeData, cpfValid, familyLinks, onLinkField, onUnlinkField }: any) {
  const baseCls = "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-primary mb-3">{sec.title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {sec.fields.map((f: any) => {
          if (f.key === "cpf") {
            const invalid = form.cpf && form.cpf !== "N" && cpfValid === false;
            return (
              <div key={f.key}>
                <label className="text-[11px] text-muted-foreground">{f.label}</label>
                <input value={form.cpf ?? ""} onChange={(e) => onChangeCPF(e.target.value)}
                  placeholder="000.000.000-00" inputMode="numeric"
                  className={`${baseCls} ${invalid ? "border-yellow-500/60" : cpfValid ? "border-green-500/60" : ""}`} />
                {form.cpf && form.cpf !== "N" && (
                  <div className={`flex items-center gap-1 mt-1 text-[10px] ${invalid ? "text-yellow-500" : "text-green-500"}`}>
                    {invalid ? <><AlertTriangle size={11} /> CPF inválido (será salvo mesmo assim)</> : <><Check size={11} /> CPF válido</>}
                  </div>
                )}
              </div>
            );
          }
          if (f.key === "rg") {
            return (
              <div key={f.key}>
                <label className="text-[11px] text-muted-foreground">{f.label}</label>
                <input value={form.rg ?? ""} onChange={(e) => onChangeRG(e.target.value)}
                  placeholder="00.000.000-0" inputMode="text" className={baseCls} />
              </div>
            );
          }
          if (f.key === "data_nascimento") {
            return (
              <div key={f.key}>
                <label className="text-[11px] text-muted-foreground">{f.label}</label>
                <input value={dataBR} onChange={(e) => onChangeData(e.target.value)}
                  placeholder="dd/mm/aaaa" inputMode="numeric" maxLength={10} className={baseCls} />
              </div>
            );
          }
          if (f.key === "idade") {
            const auto = !!form.data_nascimento;
            return (
              <div key={f.key}>
                <label className="text-[11px] text-muted-foreground">
                  {f.label} {auto && <span className="text-primary">(automática)</span>}
                </label>
                <input type="number" value={form.idade ?? ""} readOnly={auto}
                  onChange={(e) => set("idade", e.target.value)} className={`${baseCls} ${auto ? "opacity-70" : ""}`} />
              </div>
            );
          }
          const isFamily = onLinkField && FAMILY_KEYS[f.key];
          const linked = isFamily ? familyLinks?.[f.key] : null;
          return (
            <div key={f.key} className={f.rows ? "sm:col-span-2" : ""}>
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-muted-foreground">{f.label}</label>
                {isFamily && (
                  linked ? (
                    <button type="button" onClick={() => onUnlinkField(f.key)}
                      className="flex items-center gap-1 text-[10px] text-primary hover:text-destructive">
                      <Link2Off size={11} /> desvincular
                    </button>
                  ) : (
                    <button type="button" onClick={() => onLinkField(f.key)}
                      className="flex items-center gap-1 text-[10px] text-primary hover:underline">
                      <Link2 size={11} /> vincular pessoa
                    </button>
                  )
                )}
              </div>
              {f.rows ? (
                <textarea rows={f.rows} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
                  className={baseCls} />
              ) : (
                <input type={f.type || "text"} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}
                  className={`${baseCls} ${linked ? "border-primary/60 pr-8" : ""}`} />
              )}
              {linked && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                  <Link2 size={10} /> vinculado a <strong>{linked.nome}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
