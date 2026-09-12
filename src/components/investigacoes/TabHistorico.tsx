import { History } from "lucide-react";
import type { EventoHistorico } from "./Timeline";
import { HISTORICO_TIPOS, fmtDataHora } from "@/lib/investigacoes";
import { EmptyHint } from "./ui";

export function TabHistorico({ historico }: { historico: EventoHistorico[] }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        Registro completo de todas as alterações feitas na investigação.
      </p>
      {historico.length === 0 ? (
        <EmptyHint>Nenhum evento registrado.</EmptyHint>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <History size={12} className="text-primary" /> Evento
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Descrição
                  </th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Data
                  </th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Autor
                  </th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition"
                  >
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full border border-primary/30 text-primary uppercase tracking-wider whitespace-nowrap">
                        {HISTORICO_TIPOS[h.tipo]?.label ?? h.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs break-words max-w-md">{h.descricao}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDataHora(h.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {h.usuario ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
