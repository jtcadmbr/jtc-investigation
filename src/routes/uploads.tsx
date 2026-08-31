import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, Search, Trash2, FileText, Film, Download, Pencil, Check, X as XIcon, Folder, FolderOpen, ArrowLeft, FolderInput, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { cq } from "@/lib/offline-cache";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useRealtime } from "@/hooks/use-realtime";
import { PersonPicker } from "@/components/PersonPicker";

type SearchP = { pessoa?: string; tab?: string };

export const Route = createFileRoute("/uploads")({
  component: Page,
  validateSearch: (s: Record<string, unknown>): SearchP => ({
    pessoa: typeof s.pessoa === "string" ? s.pessoa : undefined,
    tab: typeof s.tab === "string" ? s.tab : undefined,
  }),
});

function tipoOf(mime: string) {
  if (mime.startsWith("image/")) return "imagem";
  if (mime.startsWith("video/")) return "video";
  return "documento";
}

function Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch() as SearchP;
  const activePessoa = search.pessoa || null;
  const tab = search.tab || (activePessoa ? "pastas" : "todos"); // "todos" | "pastas"

  const [items, setItems] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [moving, setMoving] = useState<any | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: up }, { data: pp }] = await Promise.all([
      cq<any[]>("uploads.all", () =>
        supabase.from("uploads").select("*").order("created_at", { ascending: false })),
      cq<any[]>("uploads.people", () =>
        supabase.from("investigateds").select("id,nome,foto_url").order("nome")),
    ]);
    setItems(up || []);
    setPeople(pp || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  useRealtime(["uploads"], load);

  const peopleMap = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const activePerson = activePessoa ? peopleMap[activePessoa] : null;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = items;
    if (activePessoa) list = list.filter((i) => i.investigated_id === activePessoa);
    else if (tab === "pastas") list = list.filter((i) => !i.investigated_id);
    if (t) list = list.filter((i) => i.nome.toLowerCase().includes(t));
    return list;
  }, [items, q, tab, activePessoa]);

  const folders = useMemo(() => {
    const map: Record<string, number> = {};
    for (const it of items) if (it.investigated_id) map[it.investigated_id] = (map[it.investigated_id] || 0) + 1;
    return people
      .filter((p) => map[p.id])
      .map((p) => ({ ...p, count: map[p.id] }))
      .sort((a, b) => b.count - a.count);
  }, [items, people]);

  const orphanCount = useMemo(() => items.filter((i) => !i.investigated_id).length, [items]);

  const onPick = () => fileInput.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("uploads").upload(path, file);
      if (up.error) { toast.error(up.error.message); continue; }
      const { data: signed } = await supabase.storage.from("uploads").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      const url = signed?.signedUrl ?? "";
      await supabase.from("uploads").insert({
        user_id: user.id, nome: file.name, tipo: tipoOf(file.type),
        mime: file.type, tamanho: file.size, storage_path: path, url,
        investigated_id: activePessoa || null,
      });
    }
    setUploading(false);
    toast.success(activePerson ? `Enviado para pasta de ${activePerson.nome}` : "Arquivos enviados");
    load();
  };

  const remove = async (it: any) => {
    if (!confirm("Excluir arquivo?")) return;
    await supabase.storage.from("uploads").remove([it.storage_path]);
    await supabase.from("uploads").delete().eq("id", it.id);
    toast.success("Removido");
    load();
  };

  const moveToPerson = async (personId: string | null) => {
    if (!moving) return;
    const { error } = await supabase.from("uploads").update({ investigated_id: personId }).eq("id", moving.id);
    if (error) toast.error(error.message);
    else {
      const person = personId ? peopleMap[personId] : null;
      toast.success(person ? `Movido para pasta de ${person.nome}` : "Removido da pasta");
    }
    setMoving(null);
    load();
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const splitName = (full: string) => {
    const i = full.lastIndexOf(".");
    if (i <= 0) return { base: full, ext: "" };
    return { base: full.slice(0, i), ext: full.slice(i) };
  };
  const startRename = (it: any) => { setEditingId(it.id); setEditingName(splitName(it.nome).base); };
  const cancelRename = () => { setEditingId(null); setEditingName(""); };
  const confirmRename = async (it: any) => {
    const { ext } = splitName(it.nome);
    const base = editingName.trim();
    if (!base) { toast.error("Nome não pode ficar vazio"); return; }
    const newName = base + ext;
    if (newName === it.nome) { cancelRename(); return; }
    const { error } = await supabase.from("uploads").update({ nome: newName }).eq("id", it.id);
    if (error) toast.error(error.message);
    else { toast.success("Renomeado"); cancelRename(); load(); }
  };

  const setTab = (t: string) => navigate({ to: "/uploads", search: { tab: t } as any });

  return (
    <AppShell title={activePerson ? `Pasta • ${activePerson.nome}` : "Uploads"}>
      {activePerson && (
        <button onClick={() => navigate({ to: "/uploads", search: { tab: "pastas" } as any })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={16} /> Voltar às pastas
        </button>
      )}

      {!activePerson && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("todos")}
            className={`px-4 py-2 rounded-lg text-sm border ${tab === "todos" ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            Todos os arquivos ({items.length})
          </button>
          <button onClick={() => setTab("pastas")}
            className={`px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${tab === "pastas" ? "border-primary bg-primary/20 text-primary glow" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            <Folder size={14} /> Pastas por pessoa ({folders.length})
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar arquivos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm" />
        </div>
        <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <button onClick={onPick} disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium glow disabled:opacity-60">
          <UploadIcon size={18} /> {uploading ? "Enviando..." : activePerson ? `Enviar para ${activePerson.nome.split(" ")[0]}` : "Enviar arquivos"}
        </button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : tab === "pastas" && !activePessoa ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {orphanCount > 0 && (
              <button onClick={() => setTab("pastas")}
                className="group text-left rounded-xl border border-dashed border-border bg-card p-4 hover:border-primary/60 transition">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Folder size={22} className="text-muted-foreground" /></div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">Sem pasta</div>
                    <div className="text-[11px] text-muted-foreground">{orphanCount} arquivo(s)</div>
                  </div>
                </div>
              </button>
            )}
            {folders.map((f) => (
              <Link key={f.id} to="/uploads" search={{ pessoa: f.id } as any}
                className="group text-left rounded-xl border border-primary/20 bg-card p-4 hover:border-primary/60 hover:glow transition">
                <div className="flex items-center gap-3">
                  {f.foto_url ? (
                    <img src={f.foto_url} alt="" className="h-12 w-12 rounded-lg object-cover border border-primary/30" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Users size={20} /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate flex items-center gap-1"><FolderOpen size={12} className="text-primary" /> {f.nome}</div>
                    <div className="text-[11px] text-muted-foreground">{f.count} arquivo(s)</div>
                  </div>
                </div>
              </Link>
            ))}
            {folders.length === 0 && orphanCount === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
                Nenhuma pasta. Envie arquivos e mova para pastas por pessoa.
              </div>
            )}
          </div>

          {tab === "pastas" && filtered.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs uppercase tracking-widest text-primary mb-3">Arquivos sem pasta</h3>
              <FileGrid items={filtered} peopleMap={peopleMap}
                editingId={editingId} editingName={editingName} setEditingName={setEditingName}
                startRename={startRename} cancelRename={cancelRename} confirmRename={confirmRename}
                onMove={setMoving} onRemove={remove} splitName={splitName} />
            </div>
          )}
        </>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
          {activePerson ? `Nenhum arquivo na pasta de ${activePerson.nome} ainda.` : "Nenhum arquivo."}
        </div>
      ) : (
        <FileGrid items={filtered} peopleMap={peopleMap}
          editingId={editingId} editingName={editingName} setEditingName={setEditingName}
          startRename={startRename} cancelRename={cancelRename} confirmRename={confirmRename}
          onMove={setMoving} onRemove={remove} splitName={splitName} />
      )}

      {moving && (
        <PersonPicker
          title={`Mover "${moving.nome}" para pasta`}
          onClose={() => setMoving(null)}
          onPick={(p) => moveToPerson(p.id)}
        />
      )}
    </AppShell>
  );
}

function FileGrid({ items, peopleMap, editingId, editingName, setEditingName, startRename, cancelRename, confirmRename, onMove, onRemove, splitName }: any) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <AnimatePresence>
        {items.map((it: any) => {
          const owner = it.investigated_id ? peopleMap[it.investigated_id] : null;
          return (
            <motion.div key={it.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="group relative rounded-xl border border-primary/20 bg-card overflow-hidden hover:border-primary/60 hover:glow transition">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {it.tipo === "imagem" ? (
                  <img src={it.url} alt={it.nome} className="w-full h-full object-cover" loading="lazy" />
                ) : it.tipo === "video" ? (
                  <Film className="h-12 w-12 text-primary" />
                ) : (
                  <FileText className="h-12 w-12 text-primary" />
                )}
                {owner && (
                  <Link to="/uploads" search={{ pessoa: owner.id } as any}
                    className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-primary border border-primary/30 flex items-center gap-1 max-w-[85%] truncate">
                    <FolderOpen size={9} /> {owner.nome}
                  </Link>
                )}
              </div>
              <div className="p-2">
                {editingId === it.id ? (
                  <div className="flex items-center gap-1">
                    <input autoFocus value={editingName} onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmRename(it); if (e.key === "Escape") cancelRename(); }}
                      className="flex-1 min-w-0 px-1.5 py-0.5 text-xs rounded bg-input border border-primary outline-none" />
                    <span className="text-[10px] text-muted-foreground">{splitName(it.nome).ext}</span>
                    <button onClick={() => confirmRename(it)} className="p-1 rounded hover:bg-primary/10 text-primary"><Check size={12} /></button>
                    <button onClick={cancelRename} className="p-1 rounded hover:bg-destructive/10 text-destructive"><XIcon size={12} /></button>
                  </div>
                ) : (
                  <div className="text-xs truncate cursor-text" title={it.nome} onDoubleClick={() => startRename(it)}>{it.nome}</div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] uppercase text-muted-foreground">{it.tipo}</span>
                  <div className="flex gap-1">
                    <button onClick={() => onMove(it)} className="p-1 rounded hover:bg-primary/10 text-primary" title="Mover para pasta"><FolderInput size={12} /></button>
                    {editingId !== it.id && (
                      <button onClick={() => startRename(it)} className="p-1 rounded hover:bg-primary/10 text-primary" title="Renomear"><Pencil size={12} /></button>
                    )}
                    <a href={it.url} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-primary/10 text-primary"><Download size={12} /></a>
                    <button onClick={() => onRemove(it)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
