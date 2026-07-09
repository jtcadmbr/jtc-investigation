import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/p/$token")({ component: Page });

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  cpf: "CPF", rg: "RG", idade: "Idade", data_nascimento: "Data de Nascimento",
  endereco: "Endereço", cidade: "Cidade", estado: "Estado", pais: "País",
  descricao: "Descrição", observacoes: "Observações",
  nome_mae: "Mãe", nome_pai: "Pai",
  avo_materna: "Avó Materna", avo_materno: "Avô Materno",
  avo_paterna: "Avó Paterna", avo_paterno: "Avô Paterno",
  irmaos: "Irmãos", irmas: "Irmãs", tios: "Tios", tias: "Tias",
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok",
  twitter: "X / Twitter", youtube: "YouTube", linkedin: "LinkedIn", outras_redes: "Outras Redes",
};

function formatExpiry(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expirado";
  const h = Math.floor(ms / 3600000);
  if (h < 24) return `expira em ${h}h`;
  const d = Math.floor(h / 24);
  return `expira em ${d} dia${d > 1 ? "s" : ""}`;
}

function Page() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "expired" | "notfound" | "ok">("loading");
  const [link, setLink] = useState<any>(null);
  const [person, setPerson] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: l } = await supabase
        .from("share_links").select("*").eq("token", token).maybeSingle();
      if (!l) { setState("notfound"); return; }
      if (new Date(l.expires_at).getTime() <= Date.now()) { setState("expired"); return; }
      const { data: p } = await supabase
        .from("investigateds").select("*").eq("id", l.investigated_id).maybeSingle();
      if (!p) { setState("notfound"); return; }
      setLink(l); setPerson(p); setState("ok");
    })();
  }, [token]);

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Carregando...</div>;
  }
  if (state === "expired" || state === "notfound") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto text-destructive" size={48} />
          <h1 className="mt-4 text-xl font-semibold">
            {state === "expired" ? "Este link expirou" : "Link inválido"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {state === "expired"
              ? "O período de visualização deste link já terminou."
              : "Não foi possível encontrar este link compartilhado."}
          </p>
        </div>
      </div>
    );
  }

  const fields: string[] = Array.isArray(link.fields) ? link.fields : [];
  const showField = (k: string) => fields.includes(k);
  const entries = Object.entries(FIELD_LABELS).filter(([k]) => showField(k) && person[k]);
  const showFotos = showField("fotos") && Array.isArray(person.fotos) && person.fotos.length > 0;
  const showDocs = showField("documentos") && Array.isArray(person.documentos) && person.documentos.length > 0;
  const showTel = showField("telefones") && Array.isArray(person.telefones) && person.telefones.length > 0;
  const showEmails = showField("emails") && Array.isArray(person.emails) && person.emails.length > 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-primary">Ficha compartilhada</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock size={12} /> {formatExpiry(link.expires_at)}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-card p-6 glow">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {showField("foto_url") && person.foto_url ? (
              <img src={person.foto_url} alt={person.nome} className="h-32 w-32 rounded-full object-cover border-4 border-primary/50 glow" />
            ) : (
              <div className="h-32 w-32 rounded-full bg-muted border-4 border-primary/40 flex items-center justify-center text-5xl font-bold text-primary">
                {person.nome?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold glow-text">{person.nome}</h2>
              {showField("status") && (
                <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full border border-primary/30 text-primary uppercase tracking-wider">
                  {person.status}
                </span>
              )}
            </div>
          </div>

          {(entries.length > 0 || showTel || showEmails) && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {entries.filter(([k]) => k !== "status").map(([k, label]) => (
                <div key={k} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                  <div className="mt-1 text-sm break-words">{String(person[k])}</div>
                </div>
              ))}
              {showTel && (
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Telefones</div>
                  <ul className="mt-1 text-sm space-y-0.5">
                    {(person.telefones as any[]).map((t, i) => (
                      <li key={i}>{t.valor}{t.obs ? ` — ${t.obs}` : ""}</li>
                    ))}
                  </ul>
                </div>
              )}
              {showEmails && (
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">E-mails</div>
                  <ul className="mt-1 text-sm space-y-0.5">
                    {(person.emails as any[]).map((t, i) => (
                      <li key={i}>{t.valor}{t.obs ? ` — ${t.obs}` : ""}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {showFotos && (
            <div className="mt-8">
              <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Galeria de fotos</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {(person.fotos as string[]).map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition">
                    <img src={u} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {showDocs && (
            <div className="mt-8">
              <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Documentos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(person.documentos as any[]).map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noreferrer" className="rounded-lg overflow-hidden border border-border hover:border-primary transition block">
                    <div className="aspect-[4/3]">
                      <img src={d.url} alt={d.label || `Documento ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground border-t border-border truncate">
                      {d.label || `Documento ${i + 1}`}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          JTCQI+ — visualização restrita pelo proprietário do registro.
        </p>
      </div>
    </div>
  );
}
