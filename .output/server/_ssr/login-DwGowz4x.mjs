import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-CzwYCBSY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { f as Shield, E as EyeOff, l as Eye, m as FingerprintPattern } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function LoginPage() {
  const {
    signIn,
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [showPw, setShowPw] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [user, loading, navigate]);
  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const {
      error
    } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setErr(error);
      toast.error(error);
    } else {
      toast.success("Acesso concedido");
      navigate({
        to: "/dashboard"
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-screen flex items-center justify-center px-4 cyber-grid scan-line", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    y: 30,
    scale: 0.95
  }, animate: {
    opacity: 1,
    y: 0,
    scale: 1
  }, transition: {
    duration: 0.6,
    ease: "easeOut"
  }, className: "relative w-full max-w-md rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl p-8 glow", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
        scale: [1, 1.05, 1]
      }, transition: {
        duration: 2,
        repeat: Infinity
      }, className: "h-16 w-16 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center mb-4 pulse-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight glow-text", children: "JTCQI+" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1", children: "Banco de Dados Criptografado de Pessoas" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "agente@dominio.com", className: "w-full rounded-lg bg-input border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: showPw ? "text" : "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "w-full rounded-lg bg-input border border-border px-4 py-3 pr-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPw((v) => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition", "aria-label": "Mostrar senha", children: showPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 18 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 18 }) })
        ] })
      ] }),
      err && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
        opacity: 0,
        x: -8
      }, animate: {
        opacity: 1,
        x: 0
      }, className: "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: err }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { whileTap: {
        scale: 0.98
      }, disabled: busy, type: "submit", className: "w-full rounded-lg bg-primary text-primary-foreground font-semibold py-3 flex items-center justify-center gap-2 glow hover:brightness-110 disabled:opacity-60 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { size: 18 }),
        busy ? "Autenticando..." : "Entrar"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center mt-6 text-muted-foreground/70 tracking-wider", children: "SISTEMA RESTRITO • USO FICTÍCIO E ORGANIZACIONAL" })
  ] }) });
}
export {
  LoginPage as component
};
