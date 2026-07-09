import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Upload, Network, Search,
  Settings, LogOut, Menu, X, Shield, ScanFace,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/investigados", label: "Pessoas", icon: Users },
  { to: "/face-search", label: "Busca por Face", icon: ScanFace },
  { to: "/uploads", label: "Uploads", icon: Upload },
  { to: "/painel", label: "Painel Visual", icon: Network },
  { to: "/pesquisa", label: "Pesquisa", icon: Search },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin glow" />
      </div>
    );
  }

  const SidebarContent = (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center pulse-glow">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-bold tracking-tight glow-text">JTCQI+</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Encrypted DB</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((n) => {
          const active = location.pathname === n.to || (n.to !== "/dashboard" && location.pathname.startsWith(n.to));
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-primary/15 text-primary glow"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              {active && (
                <motion.div
                  layoutId="activebar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary glow"
                />
              )}
              <Icon size={18} />
              <span className="font-medium">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2 text-xs text-muted-foreground truncate">{user.email}</div>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0">{SidebarContent}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/70 backdrop-blur-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden h-9 w-9 rounded-lg border border-border flex items-center justify-center"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary glow animate-pulse" />
            <span className="uppercase tracking-widest">Online</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
