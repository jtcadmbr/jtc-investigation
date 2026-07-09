import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function PersonPicker({
  onClose,
  onPick,
  excludeId,
  title = "Vincular pessoa",
}: {
  onClose: () => void;
  onPick: (person: { id: string; nome: string; foto_url?: string | null }) => void;
  excludeId?: string;
  title?: string;
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
      .filter((i) => i.id !== excludeId)
      .filter((i) => !t || [i.nome, i.cpf, i.cidade].some((v) => String(v ?? "").toLowerCase().includes(t)));
  }, [items, q, excludeId]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col glow">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold glow-text">{title}</h3>
          <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por nome, CPF, cidade..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8 text-sm">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">Nenhuma pessoa encontrada.</div>
          ) : (
            filtered.map((p) => (
              <button key={p.id} type="button" onClick={() => onPick(p)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition text-left">
                {p.foto_url ? (
                  <img src={p.foto_url} alt="" className="h-10 w-10 rounded-full object-cover border border-primary/30" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted border border-primary/20 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{p.nome}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {[p.status, p.cidade, p.cpf && p.cpf !== "N" ? p.cpf : null].filter(Boolean).join(" • ")}
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
