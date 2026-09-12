import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ImageIcon,
  Video,
  Mic,
  FileText,
  File,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EvidenciaForm } from "./EvidenciaForm";
import { EmptyHint, VerificacaoBadge } from "./ui";
import { EVIDENCIA_TIPOS, fmtDataHora, logHistorico } from "@/lib/investigacoes";

const ICONS: Record<string, { icon: any; cls: string }> = {
  foto: { icon: ImageIcon, cls: "from-blue-500/30 to-blue-500/10 text-blue-300" },
  video: { icon: Video, cls: "from-purple-500/30 to-purple-500/10 text-purple-300" },
  audio: { icon: Mic, cls: "from-pink-500/30 to-pink-500/10 text-pink-300" },
  documento: { icon: FileText, cls: "from-amber-500/30 to-amber-500/10 text-amber-300" },
  outros: { icon: File, cls: "from-gray-500/30 to-gray-500/10 text-gray-300" },
};

export function TabEvidencias({
  investigacaoId,
  user,
  items,
  refresh,
}: {
  investigacaoId: string;
  user: User;
  items: any[];
  refresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const remove = async (e: any) => {
    if (!confirm(`Excluir a evidência "${e.nome}"?`)) return;
    if (e.storage_path) await supabase.storage.from("uploads").remove([e.storage_path]);
    const { error } = await supabase.from("evidencias").delete().eq("id", e.id);
    if (error) return toast.error(error.message);
    await logHistorico(user, investigacaoId, "edicao", `Evidência removida — ${e.nome}`);
    toast.success("Evidência excluída");
    refresh();
  };

  const isPhoto = (e: any) => e.tipo === "foto" || e.mime?.startsWith("image/");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">{items.length} evidência(s) na investigação</p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow hover:brightness-110 transition"
        >
          <Plus size={16} /> Adicionar evidência
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyHint>
          Nenhuma evidência registrada. Fotos, vídeos, áudios e documentos fazem a diferença.
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((e) => {
            const meta = ICONS[e.tipo] ?? ICONS.outros;
            const Icon = meta.icon;
            return (
              <div
                key={e.id}
                className="group rounded-2xl border border-primary/20 bg-card overflow-hidden hover:border-primary/50 transition"
              >
                {isPhoto(e) && e.url ? (
                  <a href={e.url} target="_blank" rel="noreferrer">
                    <img
                      src={e.url}
                      alt={e.nome}
                      loading="lazy"
                      className="h-36 w-full object-cover hover:opacity-90 transition cursor-zoom-in"
                    />
                  </a>
                ) : (
                  <div
                    className={`h-36 w-full bg-gradient-to-br ${meta.cls} flex items-center justify-center`}
                  >
                    <Icon size={36} />
                  </div>
                )}

                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-wider">
                      {EVIDENCIA_TIPOS[e.tipo] ?? e.tipo}
                    </span>
                    <VerificacaoBadge status={e.status_verificacao} />
                  </div>
                  <h4 className="mt-2 text-sm font-semibold truncate" title={e.nome}>
                    {e.nome}
                  </h4>
                  {e.origem && (
                    <p className="text-[11px] text-muted-foreground truncate" title={e.origem}>
                      Origem: {e.origem}
                    </p>
                  )}
                  {e.descricao && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{e.descricao}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {e.adicionado_por ? `${e.adicionado_por} • ` : ""}
                      {fmtDataHora(e.created_at)}
                    </span>
                    <div className="flex gap-1.5">
                      {e.url && (
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setEditing(e);
                          setShowForm(true);
                        }}
                        className="h-7 w-7 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => remove(e)}
                        className="h-7 w-7 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <EvidenciaForm
          user={user}
          investigacaoId={investigacaoId}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
