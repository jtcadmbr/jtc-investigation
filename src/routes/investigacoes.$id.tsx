import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Users,
  FileText,
  UserRound,
  PackageSearch,
  Video,
  StickyNote,
  LayoutDashboard,
  ScrollText,
  History,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InvestigacaoForm } from "@/components/investigacoes/InvestigacaoForm";
import { StatusBadge, PrioridadeBadge } from "@/components/investigacoes/ui";
import { TabVisaoGeral } from "@/components/investigacoes/TabVisaoGeral";
import { TabTestemunhas } from "@/components/investigacoes/TabTestemunhas";
import { TabRelatos } from "@/components/investigacoes/TabRelatos";
import { TabPessoas } from "@/components/investigacoes/TabPessoas";
import { TabEvidencias } from "@/components/investigacoes/TabEvidencias";
import { TabCameras } from "@/components/investigacoes/TabCameras";
import { TabTimeline } from "@/components/investigacoes/TabTimeline";
import { TabAnotacoes } from "@/components/investigacoes/TabAnotacoes";
import { TabHistorico } from "@/components/investigacoes/TabHistorico";
import { useRealtime } from "@/hooks/use-realtime";
import { useAuth } from "@/lib/auth";
import { cq, readCache } from "@/lib/offline-cache";
import { fmtData } from "@/lib/investigacoes";

export const Route = createFileRoute("/investigacoes/$id")({ component: Page });

const TABLES = [
  "investigacoes",
  "testemunhas",
  "relatos",
  "investigacao_pessoas",
  "evidencias",
  "cameras_investigacao",
  "notas_investigacao",
  "investigacao_historico",
];

const TABS = [
  { id: "visao", label: "Visão Geral", icon: LayoutDashboard },
  { id: "testemunhas", label: "Testemunhas", icon: Users },
  { id: "relatos", label: "Relatos", icon: FileText },
  { id: "pessoas", label: "Pessoas relacionadas", icon: UserRound },
  { id: "evidencias", label: "Evidências", icon: PackageSearch },
  { id: "cameras", label: "Câmeras", icon: Video },
  { id: "timeline", label: "Linha do tempo", icon: ScrollText },
  { id: "anotacoes", label: "Anotações", icon: StickyNote },
  { id: "historico", label: "Histórico", icon: History },
] as const;

function Page() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<any | null>(null);
  const [testemunhas, setTestemunhas] = useState<any[]>([]);
  const [relatos, setRelatos] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("visao");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const [
      { data: inv, error },
      { data: t },
      { data: r },
      { data: p },
      { data: e },
      { data: c },
      { data: n },
      { data: h },
    ] = await Promise.all([
      cq<any>(`inv.${id}`, () =>
        supabase.from("investigacoes").select("*").eq("id", id).maybeSingle(),
      ),
      cq<any[]>(`inv.test.${id}`, () =>
        supabase
          .from("testemunhas")
          .select("*")
          .eq("investigacao_id", id)
          .order("created_at", { ascending: false }),
      ),
      cq<any[]>(`inv.rel.${id}`, () =>
        supabase
          .from("relatos")
          .select("*")
          .eq("investigacao_id", id)
          .order("data", { ascending: false })
          .order("created_at", { ascending: false }),
      ),
      cq<any[]>(`inv.pes.${id}`, () =>
        supabase
          .from("investigacao_pessoas")
          .select("*,investigateds(id,nome,foto_url,status,cidade,cpf)")
          .eq("investigacao_id", id)
          .order("created_at", { ascending: false }),
      ),
      cq<any[]>(`inv.ev.${id}`, () =>
        supabase
          .from("evidencias")
          .select("*")
          .eq("investigacao_id", id)
          .order("created_at", { ascending: false }),
      ),
      cq<any[]>(`inv.cam.${id}`, () =>
        supabase
          .from("cameras_investigacao")
          .select("*")
          .eq("investigacao_id", id)
          .order("created_at", { ascending: false }),
      ),
      cq<any[]>(`inv.not.${id}`, () =>
        supabase
          .from("notas_investigacao")
          .select("*")
          .eq("investigacao_id", id)
          .order("created_at", { ascending: false }),
      ),
      cq<any[]>(`inv.his.${id}`, () =>
        supabase
          .from("investigacao_historico")
          .select("*")
          .eq("investigacao_id", id)
          .order("created_at", { ascending: false }),
      ),
    ]);

    let resolved = inv;
    if (!resolved) {
      const cached = readCache<Record<string, unknown>[]>("investigacoes.all");
      const found = (cached ?? []).find((x: any) => x.id === id);
      if (found) {
        resolved = found;
        toast.info("Modo offline — carregando dados do cache da listagem.");
      }
    }
    if (error && !resolved) toast.error(error.message);

    setItem(resolved);
    setTestemunhas(t || []);
    setRelatos(r || []);
    setPessoas(p || []);
    setEvidencias(e || []);
    setCameras(c || []);
    setNotas(n || []);
    setHistorico(h || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [id]);
  useRealtime(TABLES, load);

  const remove = async () => {
    if (!confirm("Excluir esta investigação e todos os dados vinculados?")) return;
    const { error } = await supabase.from("investigacoes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Investigação excluída");
      navigate({ to: "/investigacoes" });
    }
  };

  const counters = [
    { label: "Testemunhas", value: testemunhas.length, icon: Users },
    { label: "Relatos", value: relatos.length, icon: FileText },
    { label: "Pessoas relacionadas", value: pessoas.length, icon: UserRound },
    { label: "Evidências", value: evidencias.length, icon: PackageSearch },
    { label: "Câmeras", value: cameras.length, icon: Video },
    { label: "Anotações", value: notas.length, icon: StickyNote },
  ];

  if (loading)
    return (
      <AppShell title="Investigação">
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      </AppShell>
    );

  if (!item)
    return (
      <AppShell title="Investigação">
        <Link
          to="/investigacoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="text-center text-muted-foreground py-12">
          Investigação não encontrada ou inacessível offline.
        </div>
      </AppShell>
    );

  return (
    <AppShell title="Investigação">
      <Link
        to="/investigacoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/30 bg-card p-6 glow"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary font-mono tracking-wider">
                {item.numero}
              </span>
              <StatusBadge status={item.status} />
              <PrioridadeBadge prioridade={item.prioridade} />
            </div>
            <h2 className="mt-2 text-2xl font-bold glow-text break-words">{item.titulo}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Aberta em{" "}
              {item.data_abertura ? fmtData(item.data_abertura) : fmtData(item.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-sm"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              onClick={remove}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive text-sm hover:bg-destructive/10"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        </div>

        {item.descricao && (
          <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{item.descricao}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {counters.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-primary/20 bg-card p-3 text-center hover:border-primary/50 transition cursor-pointer"
                onClick={() => setTab(TABS.find((t) => t.label === c.label)?.id ?? "visao")}
              >
                <Icon size={18} className="mx-auto text-primary" />
                <div className="mt-1 text-xl font-bold glow-text">{c.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1 mt-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border whitespace-nowrap transition ${
                active
                  ? "border-primary bg-primary/20 text-primary glow"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {tab === "visao" && (
          <TabVisaoGeral
            investigacao={item}
            testemunhas={testemunhas}
            relatos={relatos}
            pessoas={pessoas}
            evidencias={evidencias}
            cameras={cameras}
            notas={notas}
            historico={historico}
          />
        )}
        {tab === "testemunhas" && user && (
          <TabTestemunhas investigacaoId={id} user={user} items={testemunhas} refresh={load} />
        )}
        {tab === "relatos" && user && (
          <TabRelatos investigacaoId={id} user={user} items={relatos} refresh={load} />
        )}
        {tab === "pessoas" && user && (
          <TabPessoas investigacaoId={id} user={user} items={pessoas} refresh={load} />
        )}
        {tab === "evidencias" && user && (
          <TabEvidencias investigacaoId={id} user={user} items={evidencias} refresh={load} />
        )}
        {tab === "cameras" && user && (
          <TabCameras investigacaoId={id} user={user} items={cameras} refresh={load} />
        )}
        {tab === "timeline" && <TabTimeline historico={historico} />}
        {tab === "anotacoes" && user && (
          <TabAnotacoes investigacaoId={id} user={user} items={notas} refresh={load} />
        )}
        {tab === "historico" && <TabHistorico historico={historico} />}
      </div>

      {editing && user && (
        <InvestigacaoForm
          user={user}
          initial={item}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            load();
          }}
        />
      )}
    </AppShell>
  );
}
