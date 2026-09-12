import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-card border border-primary/30 rounded-t-2xl sm:rounded-2xl w-full ${maxWidth} max-h-[95vh] flex flex-col glow`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="min-w-0">
            <h2 className="text-lg font-bold glow-text truncate">{title}</h2>
            {subtitle && (
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:border-primary/40"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="p-5 border-t border-border flex gap-3 justify-end">{footer}</div>
        )}
      </motion.div>
    </div>
  );
}
