import { motion } from "framer-motion";
import {
  Users,
  FileText,
  UserRound,
  PackageSearch,
  Video,
  StickyNote,
  ScrollText,
} from "lucide-react";
import { Timeline } from "./Timeline";
import { StatusBadge, PrioridadeBadge, Field, EmptyHint } from "./ui";
import { fmtData } from "@/lib/investigacoes";

const counters = [
  { key: "testemunhas", label: "Testemunhas", icon: Users },
  { key: "relatos", label: "Relatos", icon: FileText },
  { key: "pessoas", label: "Pessoas relacionadas", icon: UserRound },
  { key: "evidencias", label: "Evidências", icon: PackageSearch },
  { key: "cameras", label: "Câmeras", icon: Video },
  { key: "notas", label: "Anotações", icon: StickyNote },
] as const;

export function TabVisaoGeral({
  investigacao,
  testemunhas = [],
  relatos = [],
  pessoas = [],
  evidencias = [],
  cameras = [],
  notas = [],
  historico = [],
}: {
  investigacao: any;
  testemunhas?: any[];
  relatos?: any[];
  pessoas?: any[];
  evidencias?: any[];
  cameras?: any[];
  notas?: any[];
  historico?: any[];
}) {
  const totals = {
    testemunhas: testemunhas.length,
    relatos: relatos.length,
    pessoas: pessoas.length,
    evidencias: evidencias.length,
    cameras: cameras.length,
    notas: notas.length,
  };
  const ultimas = historico.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {counters.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-primary/20 bg-card p-4 text-center hover:border-primary/50 transition"
            >
              <Icon size={20} className="mx-auto text-primary" />
              <div className="mt-2 text-2xl font-bold glow-text">{totals[c.key]}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {c.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Resumo do caso</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Número" value={investigacao.numero} />
          <Field label="Data de abertura" value={fmtData(investigacao.data_abertura)} />
          <Field label="Status" value={<StatusBadge status={investigacao.status} />} />
          <Field
            label="Prioridade"
            value={<PrioridadeBadge prioridade={investigacao.prioridade} />}
          />
          <div className="sm:col-span-2 lg:col-span-2">
            <Field label="Descrição" value={investigacao.descricao || null} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
              <ScrollText size={12} /> Últimas movimentações
            </h3>
          </div>
          {ultimas.length === 0 ? (
            <EmptyHint>Nenhuma movimentação registrada.</EmptyHint>
          ) : (
            <Timeline eventos={ultimas} />
          )}
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Relatos recentes</h3>
          {relatos.length === 0 ? (
            <EmptyHint>Nenhum relato registrado ainda.</EmptyHint>
          ) : (
            <div className="space-y-3">
              {relatos.slice(0, 4).map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card/60 p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider text-primary">
                      {r.tipo}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{fmtData(r.data)}</span>
                  </div>
                  <p className="mt-1 text-sm line-clamp-2">{r.texto}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
