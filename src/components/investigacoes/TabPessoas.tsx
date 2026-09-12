import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Link2, Unlink, Pencil, Search, User as UserIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ModalShell } from "./ModalShell";
import { EmptyHint } from "./ui";
import { RELACOES, fmtData, logHistorico } from "@/lib/investigacoes";

const baseCls =
  "mt-1 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none";

export function TabPessoas({
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rel, setRel] = useState<any | null>(null);

  const linkedIds = useMemo(() => new Set(items.map((i) => i.investigated_id)), [items]);

  const unlink = async (i: any) => {
    if (!confirm(`Remover "${i.investigateds?.nome}" desta investigação?`)) return;
    const { error } = await supabase.from("investigacao_pessoas").delete().eq("id", i.id);
    if (error) return toast.error(error.message);
    await logHistorico(
      user,
      investigacaoId,
      "edicao",
      `Pessoa desvinculada — ${i.investigateds?.nome ?? "sem nome"}`,
    );
    toast.success("Vínculo removido");
    refresh();
  };

  const saveRel = async () => {
    if (!rel?.tipo_relacao) return toast.error("Informe o tipo de relação");
    if (rel.row) {
      const { error } = await supabase
        .from("investigacao_pessoas")
        .update({ tipo_relacao: rel.tipo_relacao, observacoes: rel.observacoes?.trim() || null })
        .eq("id", rel.row.id);
      if (error) return toast.error(error.message);
      await logHistorico(
        user,
        investigacaoId,
        "edicao",
        `Relação atualizada — ${rel.row.investigateds?.nome ?? ""} (${rel.tipo_relacao})`,
      );
      toast.success("Relação atualizada");
    } else if (rel.sel) {
      const { error } = await supabase.from("investigacao_pessoas").insert({
        investigacao_id: investigacaoId,
        investigated_id: rel.sel.id,
        tipo_relacao: rel.tipo_relacao,
        observacoes: rel.observacoes?.trim() || null,
        user_id: user.id,
      });
      if (error) return toast.error(error.message);
      await logHistorico(
        user,
        investigacaoId,
        "pessoa",
        `Pessoa vinculada — ${rel.sel.nome} (${rel.tipo_relacao})`,
      );
      toast.success("Pessoa vinculada");
    }
    setRel(null);
    setPickerOpen(false);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          Reutiliza o cadastro de pessoas — sem duplicar registros.
        </p>
        <button
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow hover:brightness-110 transition"
        >
          <Plus size={16} /> Vincular pessoa
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyHint>
          Nenhuma pessoa relacionada. Use <strong className="text-primary">Vincular pessoa</strong>{" "}
          para conectar alguém já cadastrado.
        </EmptyHint>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((i) => {
            const p = i.investigateds;
            return (
              <div
                key={i.id}
                className="rounded-2xl border border-primary/20 bg-card p-4 hover:border-primary/50 transition"
              >
                <div className="flex items-center gap-3">
                  <Link to="/investigados/$id" params={{ id: p?.id }} className="shrink-0">
                    {p?.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover border-2 border-primary/40"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center text-lg font-bold text-primary">
                        {(p?.nome ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/investigados/$id"
                      params={{ id: p?.id }}
                      className="font-semibold truncate block hover:text-primary transition"
                    >
                      {p?.nome ?? "sem nome"}
                    </Link>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border border-primary/30 text-primary uppercase tracking-wider">
                      {i.tipo_relacao}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() =>
                        setRel({
                          row: i,
                          tipo_relacao: i.tipo_relacao ?? "",
                          observacoes: i.observacoes ?? "",
                        })
                      }
                      className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:border-primary/40 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => unlink(i)}
                      className="h-8 w-8 rounded-md border border-border text-destructive flex items-center justify-center hover:bg-destructive/10 transition"
                    >
                      <Unlink size={14} />
                    </button>
                  </div>
                </div>
                {i.observacoes && (
                  <p className="mt-3 text-xs text-muted-foreground break-words">{i.observacoes}</p>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Vinculado em {fmtData(i.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {pickerOpen && (
        <LinkedPersonPicker
          excludeIds={linkedIds}
          onClose={() => setPickerOpen(false)}
          onPick={(sel) => {
            setPickerOpen(false);
            setRel({ sel, tipo_relacao: "", observacoes: "" });
          }}
        />
      )}

      {rel && (
        <ModalShell
          title={rel.row ? "Editar relação" : "Vincular pessoa"}
          onClose={() => setRel(null)}
          maxWidth="max-w-sm"
          footer={
            <>
              <button
                onClick={() => setRel(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={saveRel}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold glow"
              >
                Salvar
              </button>
            </>
          }
        >
          {rel.sel && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3 mb-4">
              {rel.sel.foto_url ? (
                <img
                  src={rel.sel.foto_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-primary/30"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted border border-primary/20 flex items-center justify-center text-primary">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="font-medium text-sm truncate">{rel.sel.nome}</div>
            </div>
          )}
          <div>
            <label className="text-[11px] text-muted-foreground">Tipo de relação</label>
            <select
              value={rel.tipo_relacao}
              onChange={(e) => setRel({ ...rel, tipo_relacao: e.target.value })}
              className={baseCls}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {RELACOES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label className="text-[11px] text-muted-foreground">Observações</label>
            <textarea
              rows={3}
              value={rel.observacoes ?? ""}
              onChange={(e) => setRel({ ...rel, observacoes: e.target.value })}
              placeholder="Papel no caso, contexto do vínculo..."
              className={`${baseCls} resize-y`}
            />
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function LinkedPersonPicker({
  excludeIds,
  onClose,
  onPick,
}: {
  excludeIds: Set<string>;
  onClose: () => void;
  onPick: (p: { id: string; nome: string; foto_url?: string | null }) => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("investigateds")
        .select("id,nome,foto_url,status,cidade,cpf")
        .order("nome");
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items
      .filter((i) => !excludeIds.has(i.id))
      .filter(
        (i) =>
          !t ||
          [i.nome, i.cpf, i.cidade].some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(t),
          ),
      );
  }, [items, q, excludeIds]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col glow"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold glow-text flex items-center gap-2">
            <Link2 size={16} className="text-primary" /> Vincular pessoa
          </h3>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por nome, CPF, cidade..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8 text-sm">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Nenhuma pessoa disponível para vincular.
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition text-left"
              >
                {p.foto_url ? (
                  <img
                    src={p.foto_url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted border border-primary/20 flex items-center justify-center text-primary">
                    <UserIcon size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{p.nome}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {[p.status, p.cidade, p.cpf && p.cpf !== "N" ? p.cpf : null]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
