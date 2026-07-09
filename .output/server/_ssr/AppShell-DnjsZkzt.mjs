import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-CzwYCBSY.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { f as Shield, L as LayoutDashboard, a as Users, g as ScanFace, U as Upload, N as Network, S as Search, h as Settings, i as LogOut, X, M as Menu } from "../_libs/lucide-react.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/investigados", label: "Pessoas", icon: Users },
  { to: "/face-search", label: "Busca por Face", icon: ScanFace },
  { to: "/uploads", label: "Uploads", icon: Upload },
  { to: "/painel", label: "Painel Visual", icon: Network },
  { to: "/pesquisa", label: "Pesquisa", icon: Search },
  { to: "/configuracoes", label: "Configurações", icon: Settings }
];
function AppShell({ children, title }) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);
  reactExports.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin glow" }) });
  }
  const SidebarContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col bg-sidebar border-r border-sidebar-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 border-b border-sidebar-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center pulse-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight glow-text", children: "JTCQI+" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-widest", children: "Encrypted DB" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1 overflow-y-auto", children: nav.map((n) => {
      const active = location.pathname === n.to || n.to !== "/dashboard" && location.pathname.startsWith(n.to);
      const Icon = n.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: n.to,
          className: cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
            active ? "bg-primary/15 text-primary glow" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          ),
          children: [
            active && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                layoutId: "activebar",
                className: "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-primary glow"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: n.label })
          ]
        },
        n.to
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-sidebar-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 mb-2 text-xs text-muted-foreground truncate", children: user.email }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: async () => {
            await signOut();
            navigate({ to: "/login" });
          },
          className: "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 18 }),
            "Sair"
          ]
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden md:flex w-64 shrink-0", children: SidebarContent }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          onClick: () => setOpen(false),
          className: "fixed inset-0 bg-black/60 z-40 md:hidden"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.aside,
        {
          initial: { x: -280 },
          animate: { x: 0 },
          exit: { x: -280 },
          transition: { type: "spring", damping: 25, stiffness: 200 },
          className: "fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden",
          children: SidebarContent
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/70 backdrop-blur-xl px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setOpen((v) => !v),
              className: "md:hidden h-9 w-9 rounded-lg border border-border flex items-center justify-center",
              children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 18 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold tracking-tight", children: title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-primary glow animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-widest", children: "Online" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-4 md:p-6", children })
    ] })
  ] });
}
export {
  AppShell as A
};
