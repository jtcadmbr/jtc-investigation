import { HISTORICO_TIPOS, fmtDataHora } from "@/lib/investigacoes";

export type EventoHistorico = {
  id: string;
  tipo: string;
  descricao: string;
  usuario: string | null;
  created_at: string;
};

export function Timeline({
  eventos,
  ultimos = 0,
}: {
  eventos: EventoHistorico[];
  ultimos?: number;
}) {
  const list = ultimos > 0 ? eventos.slice(0, ultimos) : eventos;

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
        Nenhuma movimentação registrada ainda.
      </p>
    );
  }

  return (
    <div className="relative space-y-4 pl-5">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
      {list.map((e) => {
        const meta = HISTORICO_TIPOS[e.tipo] ?? HISTORICO_TIPOS.edicao;
        return (
          <div key={e.id} className="relative">
            <span
              className={`absolute -left-5 top-2 h-3 w-3 rounded-full ${meta.dot} ring-4 ring-background/50`}
            />
            <div className="rounded-lg border border-border bg-card/60 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {meta.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {fmtDataHora(e.created_at)}
                </span>
              </div>
              <p className="mt-1 text-sm break-words">{e.descricao}</p>
              {e.usuario && (
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  por {e.usuario}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
