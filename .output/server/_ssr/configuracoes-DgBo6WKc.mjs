import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DnjsZkzt.mjs";
import { u as useAuth } from "./router-CzwYCBSY.mjs";
import "../_libs/sonner.mjs";
import { f as Shield, x as Moon, y as Monitor, D as Download, i as LogOut } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-CScATcR5.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
function Page() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { title: "Configurações", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/20 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "text-primary", size: 20 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Conta" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Sessão ativa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-mono", children: user?.email })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/20 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "text-primary", size: 20 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Aparência" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Modo escuro permanente (estilo cyber)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/20 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "text-primary", size: 20 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Aplicativo Desktop (Windows)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Rode o JTC Investigação em uma janela dedicada de alta performance sem as barras do navegador. O aplicativo já vem pré-configurado com o ícone oficial do sistema." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/JTC_Investigacao.exe", download: "JTC_Investigacao.exe", className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
        "Baixar Executável (.exe)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
      await signOut();
      navigate({
        to: "/login"
      });
    }, className: "rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive p-5 text-left flex items-center gap-3 hover:bg-destructive/20 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 20 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Sair" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80", children: "Encerrar sessão atual" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center pt-4", children: "JTCQI+ — Sistema fictício e organizacional." })
  ] }) });
}
export {
  Page as component
};
