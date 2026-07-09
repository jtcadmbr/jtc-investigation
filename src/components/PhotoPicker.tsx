import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Upload as UploadIcon, Search, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function PhotoPicker({
  onClose,
  onPick,
  onPickFile,
}: {
  onClose: () => void;
  onPick: (url: string) => void;
  onPickFile: (dataUrl: string) => void;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("uploads").select("*").eq("tipo", "imagem")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) => !q || i.nome.toLowerCase().includes(q.toLowerCase()));

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem"); return; }
    setUploading(true);
    const r = new FileReader();
    r.onload = () => {
      setUploading(false);
      onPickFile(r.result as string);
    };
    r.readAsDataURL(file);
  };

  const pickFromDevice = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => handleFiles(input.files);
    input.click();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col glow">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold glow-text">Escolher foto</h3>
          <button onClick={onClose} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"><X size={18} /></button>
        </div>

        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar na galeria..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none text-sm" />
          </div>
          <button onClick={pickFromDevice} disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm glow disabled:opacity-60">
            <UploadIcon size={16} /> {uploading ? "Carregando..." : "Do dispositivo"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8 text-sm">Carregando galeria...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl">
              <ImageIcon className="mx-auto mb-2 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground">Nenhuma imagem na galeria.</p>
              <p className="text-xs text-muted-foreground mt-1">Use "Do dispositivo" para enviar uma nova.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((it) => (
                <button key={it.id} type="button" onClick={() => onPick(it.url)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary hover:glow transition">
                  <img src={it.url} alt={it.nome} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end p-1.5">
                    <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 truncate">{it.nome}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
