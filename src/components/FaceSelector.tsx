import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { getFaceCandidates, loadFaceModels, type FaceCandidate } from "@/lib/face";

type Props = {
  imageUrl: string;
  onPick: (candidate: FaceCandidate | null) => void;
  onCandidates?: (list: FaceCandidate[]) => void;
};

export function FaceSelector({ imageUrl, onPick, onCandidates }: Props) {
  const [candidates, setCandidates] = useState<FaceCandidate[] | null>(null);
  const [picked, setPicked] = useState<number>(-1);
  const [scanning, setScanning] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const [rendered, setRendered] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let cancel = false;
    setScanning(true);
    setCandidates(null);
    setPicked(-1);
    loadFaceModels()
      .then(() => getFaceCandidates(imageUrl))
      .then((list) => {
        if (cancel) return;
        setCandidates(list);
        onCandidates?.(list);
        if (list.length === 1) {
          setPicked(0);
          onPick(list[0]);
        } else {
          onPick(null);
        }
      })
      .finally(() => !cancel && setScanning(false));
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    setRendered({ w: el.clientWidth, h: el.clientHeight });
  };

  useEffect(() => {
    const onResize = () => onImgLoad();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative inline-block max-w-full">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="query"
          onLoad={onImgLoad}
          className="max-h-[420px] w-auto max-w-full rounded-xl border-2 border-primary/40 block"
        />
        {candidates && candidates.length > 0 && rendered.w > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {candidates.map((c, i) => {
              const scaleX = rendered.w / c.canvasSize.width;
              const scaleY = rendered.h / c.canvasSize.height;
              const cx = c.center.x * scaleX;
              const cy = c.center.y * scaleY;
              const bx = c.box.x * scaleX;
              const by = c.box.y * scaleY;
              const bw = c.box.width * scaleX;
              const bh = c.box.height * scaleY;
              const active = picked === i;
              return (
                <div key={i} className="absolute inset-0 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: active ? 1 : 0.75 }}
                    className={`absolute border-2 rounded-md pointer-events-none ${
                      active ? "border-primary shadow-[0_0_20px_var(--primary)]" : "border-primary/40"
                    }`}
                    style={{ left: bx, top: by, width: bw, height: bh }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setPicked(i);
                      onPick(c);
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.15 }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_18px_var(--primary)] h-8 w-8"
                        : "bg-background/90 backdrop-blur-sm text-primary border-primary/70 h-7 w-7 hover:h-8 hover:w-8"
                    }`}
                    style={{ left: cx, top: cy }}
                    title={`Rosto ${i + 1} · qualidade ${c.qualityLabel}`}
                  >
                    {active ? <Check size={16} /> : i + 1}
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {scanning && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" />
          Procurando rostos na foto...
        </div>
      )}
      {!scanning && candidates && candidates.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle size={14} /> Nenhum rosto detectado. Tente outra foto.
        </div>
      )}
      {!scanning && candidates && candidates.length > 1 && (
        <div className="text-xs text-muted-foreground">
          {candidates.length} rostos encontrados — clique na bolinha do rosto que deseja buscar.
          {picked >= 0 && (
            <span className="ml-2 text-primary font-semibold">
              Rosto {picked + 1} selecionado · qualidade {candidates[picked].qualityLabel}
            </span>
          )}
        </div>
      )}
      {!scanning && candidates && candidates.length === 1 && picked === 0 && (
        <div className="text-xs text-primary">
          1 rosto detectado · qualidade {candidates[0].qualityLabel}
        </div>
      )}
    </div>
  );
}
