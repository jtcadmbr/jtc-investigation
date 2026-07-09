import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";

async function getCroppedBlob(src: string, area: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
  const canvas = document.createElement("canvas");
  const size = Math.min(area.width, area.height);
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

export function AvatarCropper({ src, onCancel, onDone }: { src: string; onCancel: () => void; onDone: (b: Blob) => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<any>(null);
  const onComplete = useCallback((_: any, a: any) => setArea(a), []);

  const save = async () => {
    if (!area) return;
    const blob = await getCroppedBlob(src, area);
    onDone(blob);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 border-b border-primary/20">
        <h3 className="font-semibold glow-text">Recortar foto</h3>
        <button onClick={onCancel} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center"><X size={18} /></button>
      </motion.div>
      <div className="relative flex-1">
        <Cropper
          image={src} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
          onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete}
        />
      </div>
      <div className="p-4 border-t border-primary/20 bg-background/80 backdrop-blur space-y-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <ZoomOut size={18} className="text-muted-foreground" />
          <input type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[oklch(0.85_0.25_145)]" />
          <ZoomIn size={18} className="text-primary" />
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-border">Cancelar</button>
          <button onClick={save} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold glow">
            <Check size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
