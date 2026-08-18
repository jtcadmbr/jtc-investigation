import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, Share2, Link2, FolderOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InvestigadoForm } from "@/components/InvestigadoForm";
import { ShareDialog } from "@/components/ShareDialog";
import { useLightbox } from "@/components/ImageLightbox";

export const Route = createFileRoute("/investigados/$id")({ component: Page });

const FIELD_LABELS: Record<string, string> = {
  cpf: "CPF", rg: "RG", idade: "Idade", data_nascimento: "Data de Nascimento",
  telefone: "Telefone", email: "E-mail", endereco: "Endereço", cidade: "Cidade",
  estado: "Estado", pais: "País", descricao: "Descrição", observacoes: "Observações",
  nome_mae: "Nome da Mãe", nome_pai: "Nome do Pai",
  avo_materna: "Avó Materna", avo_materno: "Avô Materno",
  avo_paterna: "Avó Paterna", avo_paterno: "Avô Paterno",
  irmaos: "Irmãos", irmas: "Irmãs", tios: "Tios", tias: "Tias",
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok",
  twitter: "X / Twitter", youtube: "YouTube", linkedin: "LinkedIn", outras_redes: "Outras Redes",
};

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [connOut, setConnOut] = useState<any[]>([]);
  const [connIn, setConnIn] = useState<any[]>([]);
  const [folderFiles, setFolderFiles] = useState<any[]>([]);
  const lightbox = useLightbox();

  const load = async () => {
    const { data, error } = await supabase.from("investigateds").select("*").eq("id", id).maybeSingle();
    if (error) toast.error(error.message);
    setItem(data);
    const [{ data: out }, { data: inn }, { data: files }] = await Promise.all([
      supabase.from("connections").select("rotulo,to_id,investigateds!connections_to_id_fkey(id,nome,foto_url)").eq("from_id", id),
      supabase.from("connections").select("rotulo,from_id,investigateds!connections_from_id_fkey(id,nome,foto_url)").eq("to_id", id),
      supabase.from("uploads").select("*").eq("investigated_id", id).order("created_at", { ascending: false }),
    ]);
    setConnOut(out || []);
    setConnIn(inn || []);
    setFolderFiles(files || []);
  };
  useEffect(() => { load(); }, [id]);

  const remove = async () => {
    if (!confirm("Excluir este registro?")) return;
    const { error } = await supabase.from("investigateds").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removido"); navigate({ to: "/investigados" }); }
  };

  if (!item) return <AppShell title="Pessoa"><div className="text-center text-muted-foreground py-12">Carregando...</div></AppShell>;

  const entries = Object.entries(FIELD_LABELS).filter(([k]) => item[k]);

  return (
    <AppShell title="Ficha">
      <Link to="/investigados" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/30 bg-card p-6 glow">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {item.foto_url ? (
            <button type="button" onClick={() => lightbox.open([{ url: item.foto_url, label: item.nome }])} className="rounded-full" aria-label="Ampliar foto principal">
              <img src={item.foto_url} alt={item.nome} className="h-32 w-32 rounded-full object-cover border-4 border-primary/50 glow cursor-zoom-in" />
            </button>
          ) : (
            <div className="h-32 w-32 rounded-full bg-muted border-4 border-primary/40 flex items-center justify-center text-5xl font-bold text-primary">
              {item.nome?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold glow-text">{item.nome}</h2>
            <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full border border-primary/30 text-primary uppercase tracking-wider">{item.status}</span>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-sm">
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => setSharing(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-sm">
                <Share2 size={14} /> Compartilhar
              </button>
              <button onClick={remove} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive text-sm hover:bg-destructive/10">
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {entries.length === 0 ? (
            <div className="text-muted-foreground text-sm col-span-full">Nenhuma informação adicional cadastrada.</div>
          ) : entries.map(([k, label]) => (
            <div key={k} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm break-words">{String(item[k])}</div>
            </div>
          ))}
        </div>

        {Array.isArray(item.fotos) && item.fotos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Galeria de fotos</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {(item.fotos as string[]).map((u, i) => (
                <button key={i} type="button"
                  onClick={() => lightbox.open((item.fotos as string[]).map((x, k) => ({ url: x, label: `${item.nome} — Foto ${k + 1}` })), i)}
                  className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition cursor-zoom-in">
                  <img src={u} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(item.documentos) && item.documentos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Documentos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(item.documentos as any[]).map((d, i) => (
                <button key={i} type="button"
                  onClick={() => lightbox.open((item.documentos as any[]).map((x, k) => ({ url: x.url, label: x.label || `Documento ${k + 1}` })), i)}
                  className="rounded-lg overflow-hidden border border-border hover:border-primary transition block w-full text-left cursor-zoom-in">
                  <div className="aspect-[4/3]">
                    <img src={d.url} alt={d.label || `Documento ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-t border-border truncate">
                    {d.label || `Documento ${i + 1}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(connOut.length > 0 || connIn.length > 0) && (
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><Link2 size={12}/> Vínculos familiares</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {connOut.map((c: any, i) => c.investigateds && (
                <Link key={`o${i}`} to="/investigados/$id" params={{ id: c.investigateds.id }}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border bg-background/40 hover:border-primary/60 transition">
                  {c.investigateds.foto_url ? <img src={c.investigateds.foto_url} className="h-9 w-9 rounded-full object-cover" alt="" />
                    : <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-primary text-sm font-bold">{c.investigateds.nome[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{c.investigateds.nome}</div>
                    <div className="text-[10px] uppercase tracking-widest text-primary">{c.rotulo}</div>
                  </div>
                </Link>
              ))}
              {connIn.map((c: any, i) => c.investigateds && (
                <Link key={`i${i}`} to="/investigados/$id" params={{ id: c.investigateds.id }}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border bg-background/40 hover:border-primary/60 transition">
                  {c.investigateds.foto_url ? <img src={c.investigateds.foto_url} className="h-9 w-9 rounded-full object-cover" alt="" />
                    : <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-primary text-sm font-bold">{c.investigateds.nome[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{c.investigateds.nome}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">tem esta pessoa como {c.rotulo}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2"><FolderOpen size={12}/> Pasta de arquivos ({folderFiles.length})</h3>
            <Link to="/uploads" search={{ pessoa: id } as any} className="text-[11px] text-primary hover:underline">abrir pasta →</Link>
          </div>
          {folderFiles.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">Nenhum arquivo nesta pasta. Vá em Uploads e mova arquivos para esta pessoa.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {folderFiles.slice(0, 12).map((f) => {
                const images = folderFiles.filter((x) => x.tipo === "imagem");
                const isImage = f.tipo === "imagem";
                return isImage ? (
                  <button key={f.id} type="button"
                    onClick={() => lightbox.open(images.map((x) => ({ url: x.url, label: x.nome })), images.findIndex((x) => x.id === f.id))}
                    className="aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center hover:border-primary transition cursor-zoom-in">
                    <img src={f.url} alt={f.nome} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ) : (
                  <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center hover:border-primary transition">
                    <div className="text-[10px] p-1 text-center text-muted-foreground truncate">{f.nome}</div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {editing && <InvestigadoForm initial={item} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
      {sharing && <ShareDialog investigatedId={item.id} nome={item.nome} onClose={() => setSharing(false)} />}
      {lightbox.element}
    </AppShell>
  );
}
