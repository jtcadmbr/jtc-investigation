import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Fingerprint, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setErr(error);
      toast.error(error);
    } else {
      toast.success("Acesso concedido");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 cyber-grid scan-line">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl p-8 glow"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center mb-4 pulse-glow"
          >
            <Shield className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight glow-text">JTCQI+</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">
            Banco de Dados Criptografado de Pessoas
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agente@dominio.com"
              className="w-full rounded-lg bg-input border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Senha</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-input border border-border px-4 py-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
                aria-label="Mostrar senha"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {err && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {err}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={busy}
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 flex items-center justify-center gap-2 glow hover:brightness-110 disabled:opacity-60 transition"
          >
            <Fingerprint size={18} />
            {busy ? "Autenticando..." : "Entrar"}
          </motion.button>
        </form>

        <p className="text-[10px] text-center mt-6 text-muted-foreground/70 tracking-wider">
          SISTEMA RESTRITO • USO FICTÍCIO E ORGANIZACIONAL
        </p>
      </motion.div>
    </div>
  );
}
