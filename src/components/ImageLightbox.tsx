import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";

export interface LightboxItem {
  url: string;
  label?: string;
}

interface ImageLightboxProps {
  items: LightboxItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/** Visualizador de imagens em pop-up (modal) — evita abrir a foto em outra página. */
export function ImageLightbox({ items, index, onIndexChange, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const total = items.length;
  const current = items[index];

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setZoom(1);
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  if (!current || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-md"
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-0">
            <div className="text-sm truncate">{current.label || "Imagem"}</div>
            {total > 1 && (
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {index + 1} de {total}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              className="p-2 rounded-md hover:bg-primary/10 text-primary"
              aria-label="Reduzir zoom"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
              className="p-2 rounded-md hover:bg-primary/10 text-primary"
              aria-label="Aumentar zoom"
            >
              <ZoomIn size={16} />
            </button>
            <a
              href={current.url}
              download
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-md hover:bg-primary/10 text-primary"
              aria-label="Baixar imagem"
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-destructive/10 text-destructive"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-auto flex items-center justify-center p-4">
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-2 z-10 p-2 rounded-full border border-border bg-card/80 text-primary hover:bg-primary/10"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <motion.img
            key={current.url}
            src={current.url}
            alt={current.label || "Imagem ampliada"}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ transform: `scale(${zoom})` }}
            className="max-h-full max-w-full object-contain rounded-lg border border-border transition-transform"
          />
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-2 z-10 p-2 rounded-full border border-border bg-card/80 text-primary hover:bg-primary/10"
              aria-label="Próxima foto"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/** Hook utilitário: retorna o gatilho `open` e o elemento do modal já pronto para render. */
export function useLightbox() {
  const [state, setState] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  const open = useCallback((items: LightboxItem[], index = 0) => {
    if (!items.length) return;
    setState({ items, index: Math.max(0, Math.min(index, items.length - 1)) });
  }, []);

  const element = state ? (
    <ImageLightbox
      items={state.items}
      index={state.index}
      onIndexChange={(index) => setState((s) => (s ? { ...s, index } : s))}
      onClose={() => setState(null)}
    />
  ) : null;

  return { open, element };
}
