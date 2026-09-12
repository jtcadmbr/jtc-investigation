import type { ReactNode } from "react";
import { INVESTIGACAO_STATUS, PRIORIDADES, VERIFICACAO } from "@/lib/investigacoes";

export function StatusBadge({ status }: { status: string }) {
  const meta = INVESTIGACAO_STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider ${
        meta?.badge ?? "border-border text-muted-foreground"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? "bg-muted-foreground"}`} />
      {meta?.label ?? status}
    </span>
  );
}

export function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const meta = PRIORIDADES[prioridade];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider ${
        meta?.badge ?? "border-border text-muted-foreground"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta?.dot ?? "bg-muted-foreground"}`} />
      {meta?.label ?? prioridade}
    </span>
  );
}

export function VerificacaoBadge({ status }: { status: string }) {
  const meta = VERIFICACAO[status];
  return (
    <span
      className={`inline-flex items-center text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider ${
        meta?.badge ?? "border-border text-muted-foreground"
      }`}
    >
      {meta?.label ?? status}
    </span>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl text-sm">
      {children}
    </div>
  );
}

export function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm break-words">{value ?? "—"}</div>
    </div>
  );
}
