import { Timeline, type EventoHistorico } from "./Timeline";

export function TabTimeline({ historico }: { historico: EventoHistorico[] }) {
  return <Timeline eventos={historico} />;
}
