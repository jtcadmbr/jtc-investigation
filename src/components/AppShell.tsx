import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Upload, Network, Search,
  Settings, LogOut, Menu, X, Shield, ScanFace, Command, Bell, ChevronRight, Microscope,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { isOffline } from "@/lib/offline-cache";

const navGroups = [
  {
    label: "Operação",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Visão geral" },
      { to: "/investigacoes", label: "Investigações", icon: Microscope, hint: "Casos" },
      { to: "/investigados", label: "Pessoas", icon: Users, hint: "Cadastros" },
      { to: "/face-search", label: "Busca por Face", icon: ScanFace, hint: "Biometria" },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { to: "/painel", label: "Painel Visual", icon: Network, hint: "Vínculos" },
      { to: "/pesquisa", label: "Pesquisa", icon: Search, hint: "Filtros" },
      { to: "/uploads", label: "Uploads", icon: Upload, hint: "Anexos" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { to: "/configuracoes", label: "Configurações", icon: Settings, hint: "Ajustes" },
    ],
  },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleOnline = () => setOfflineStatus(false);
    const handleOffline = () => setOfflineStatus(true);
    
    // Initial check
    setOfflineStatus(isOffline());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-2 border-primary/30 border-t-primary animate-spin glow" />
          <Shield className="absolute inset-0 m-auto h-5 w-5 text-primary" />
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <div className="relative flex h-full flex-col overflow-hidden border-r border-sidebar-border bg-sidebar">
      <div className="relative px-5 py-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
            <Shield className="h-5 w-5 text-primary" strokeWidth={1.7} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-sidebar bg-accent" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[15px] leading-tight text-sidebar-foreground">JTC <span className="text-primary">CDI</span></div>
            <div className="mt-1 text-[9px] text-muted-foreground uppercase tracking-[0.2em]">Intelligence system</div>
          </div>
        </Link>
      </div>

      <nav className="relative flex-1 p-3 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/70">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((n) => {
                const active = location.pathname === n.to || (n.to !== "/dashboard" && location.pathname.startsWith(n.to));
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-foreground shadow-[inset_0_0_0_1px_var(--sidebar-border)]"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activebar"
                        className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-primary"
                      />
                    )}
                    <Icon size={18} className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-primary transition")} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight">{n.label}</div>
                      <div className={cn("text-[10px] leading-tight", active ? "text-primary/70" : "text-muted-foreground/60")}>
                        {n.hint}
                      </div>
                    </div>
                    {active && <ChevronRight size={14} className="text-primary/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-3 py-2">
          <div className="h-8 w-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {(user.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate">{user.email}</div>
            <div className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent glow animate-pulse" /> agente ativo
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      <div className="absolute inset-0 grid-background pointer-events-none opacity-20" />
      <aside className="hidden w-72 md:flex flex-col shrink-0">
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-background/80 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden h-9 w-9 rounded-lg border border-border flex items-center justify-center"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Central de inteligência</div>
              <h1 className="truncate font-display text-lg md:text-xl">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/pesquisa"
              className="hidden md:flex items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition"
            >
              <Search size={13} />
              <span>Pesquisar…</span>
              <span className="kbd flex items-center gap-1" data-jtc-id="jtc-71369290-cad4-4156-b4fd-06f28ab86d84"><Command size={9} /></span>
            </Link>
            <button
              type="button"
              aria-label="Notificações"
              className="relative h-9 w-9 rounded-lg border border-border/70 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent glow" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground pl-2 border-l border-border/60 ml-1">
              <span className={`h-2 w-2 rounded-full ${offlineStatus ? 'bg-danger pulse-glow-red' : 'bg-accent glow animate-pulse'}`} />
              {offlineStatus ? 'Offline' : 'Online'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}