import { useState } from "react";
import { motion } from "framer-motion";
import { X, Link as LinkIcon, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const FIELD_OPTIONS: { key: string; label: string }[] = [
  { key: "foto_url", label: "Foto principal" },
  { key: "fotos", label: "Galeria de fotos" },
  { key: "documentos", label: "Documentos" },
  { key: "status", label: "Status" },
  { key: "cpf", label: "CPF" }, { key: "rg", label: "RG" },
  { key: "idade", label: "Idade" }, { key: "data_nascimento", label: "Data de nascimento" },
  { key: "telefones", label: "Telefones" }, { key: "emails", label: "E-mails" },
  { key: "endereco", label: "Endereço" }, { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" }, { key: "pais", label: "País" },
  { key: "descricao", label: "Descrição" }, { key: "observacoes", label: "Observações" },
  { key: "nome_mae", label: "Mãe" }, { key: "nome_pai", label: "Pai" },
  { key: "avo_materna", label: "Avó materna" }, { key: "avo_materno", label: "Avô materno" },
  { key: "avo_paterna", label: "Avó paterna" }, { key: "avo_paterno", label: "Avô paterno" },
  { key: "irmaos", label: "Irmãos" }, { key: "irmas", label: "Irmãs" },
  { key: "tios", label: "Tios" }, { key: "tias", label: "Tias" },
  { key: "instagram", label: "Instagram" }, { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" }, { key: "twitter", label: "X / Twitter" },
  { key: "youtube", label: "YouTube" }, { key: "linkedin", label: "LinkedIn" },
  { key: "outras_redes", label: "Outras redes" },
];

const DURATIONS = [
  { label: "1 hora", hours: 1 },
  { label: "24 horas", hours: 24 },
  { label: "7 dias", hours: 24 * 7 },
  { label: "30 dias", hours: 24 * 30 },
  { label: "1 ano", hours: 24 * 365 },
];

function randomToken() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
}

export function ShareDialog({ investigatedId, nome, onClose }: { investigatedId: string; nome: string; onClose: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>(["foto_url", "status"]);
  const [hours, setHours] = useState<number>(24);
  const [generating, setGenerating] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (k: string) =>
    setSelected((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const generate = async () => {
    if (!user) return;
    if (selected.length === 0) return toast.error("Selecione pelo menos um campo");
    setGenerating(true);
    const token = randomToken();
    const expires_at = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const { error } = await supabase.from("share_links").insert({
      user_id: user.id, investigated_id: investigatedId, token, fields: selected, expires_at,
    });
    setGenerating(false);
    if (error) return toast.error(error.message);
    const url = `${window.location.origin}/p/${token}`;
    setLink(url);
    toast.success("Link gerado");
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col glow">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold glow-text">Compartilhar ficha</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{nome}</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-primary/40"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {link ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Link público criado. Qualquer pessoa com o link pode ver os campos selecionados até expirar.</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-input border border-primary/40">
                <LinkIcon size={16} className="text-primary shrink-0" />
                <code className="flex-1 text-xs break-all">{link}</code>
                <button onClick={copy} className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 shrink-0">
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              </div>
              <button onClick={() => { setLink(null); setSelected(["foto_url", "status"]); }}
                className="text-xs text-primary hover:underline">Gerar outro link</button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">O que mostrar?</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FIELD_OPTIONS.map((f) => {
                    const active = selected.includes(f.key);
                    return (
                      <button key={f.key} type="button" onClick={() => toggle(f.key)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition ${active ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">{selected.length} campo(s) selecionado(s) — o nome sempre aparece.</p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Por quanto tempo o link fica ativo?</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DURATIONS.map((d) => (
                    <button key={d.hours} type="button" onClick={() => setHours(d.hours)}
                      className={`px-3 py-1.5 rounded-full text-xs border uppercase tracking-wider transition ${hours === d.hours ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {!link && (
          <div className="p-5 border-t border-border flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:border-primary/40">Cancelar</button>
            <button onClick={generate} disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow disabled:opacity-60">
              <LinkIcon size={16} /> {generating ? "Gerando..." : "Gerar link"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
