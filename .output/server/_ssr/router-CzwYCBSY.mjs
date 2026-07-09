import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";



import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
const ALLOWED_EMAIL = "jtc.adm.br@gmail.com";
const ALLOWED_PASSWORD = "Jardiel021.L";
const AuthCtx = reactExports.createContext({});
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const signIn = async (email, password) => {
    if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
      return { error: "Acesso restrito. Credenciais inválidas." };
    }
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error && /invalid login credentials/i.test(error.message)) {
      if (email === ALLOWED_EMAIL && password === ALLOWED_PASSWORD) {
        const up = await supabase.auth.signUp({ email, password });
        if (!up.error) {
          const retry = await supabase.auth.signInWithPassword({ email, password });
          error = retry.error;
        } else {
          return { error: up.error.message };
        }
      }
    }
    if (error) return { error: "Senha ou e-mail incorretos." };
    return {};
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthCtx.Provider, { value: { user, session, loading, signIn, signOut }, children });
}
const useAuth = () => reactExports.useContext(AuthCtx);
const appCss = "/assets/styles-CwgMhCQ_.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-primary glow-text", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Rota não encontrada" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
        children: "Voltar"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Erro inesperado" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => {
          router2.invalidate();
          reset();
        },
        className: "mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
        children: "Tentar novamente"
      }
    )
  ] }) });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JTCQI+ — Banco de Dados Criptografado de Pessoas" },
      { name: "description", content: "JTCQI+ — banco de dados criptografado para cadastrar, organizar e visualizar informações de pessoas." },
      { property: "og:title", content: "JTCQI+ — Banco de Dados Criptografado de Pessoas" },
      { name: "twitter:title", content: "JTCQI+ — Banco de Dados Criptografado de Pessoas" },
      { property: "og:description", content: "JTCQI+ — banco de dados criptografado para cadastrar, organizar e visualizar informações de pessoas." },
      { name: "twitter:description", content: "JTCQI+ — banco de dados criptografado para cadastrar, organizar e visualizar informações de pessoas." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b7e4bf70-9df1-41cd-bb9b-6f89dac5b4ae" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b7e4bf70-9df1-41cd-bb9b-6f89dac5b4ae" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  ssr: false,
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "pt-BR", className: "dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { theme: "dark", position: "top-right", richColors: true })
  ] }) });
}
const $$splitComponentImporter$b = () => import("./uploads-BxnUXZ8Y.mjs");
const Route$b = createFileRoute("/uploads")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
  validateSearch: (s) => ({
    pessoa: typeof s.pessoa === "string" ? s.pessoa : void 0,
    tab: typeof s.tab === "string" ? s.tab : void 0
  })
});
const $$splitComponentImporter$a = () => import("./pesquisa-PeK4CZj0.mjs");
const Route$a = createFileRoute("/pesquisa")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./login-DwGowz4x.mjs");
const Route$9 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./face-search-N5bT5ZQ-.mjs");
const Route$8 = createFileRoute("/face-search")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./dashboard-fuQx7Enx.mjs");
const Route$7 = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./configuracoes-DgBo6WKc.mjs");
const Route$6 = createFileRoute("/configuracoes")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./index-CI4Ik884.mjs");
const Route$5 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./painel.index-CmjsPC2j.mjs");
const Route$4 = createFileRoute("/painel/")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./investigados.index-sigmmQzZ.mjs");
const Route$3 = createFileRoute("/investigados/")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./painel._id-BzmjW8cH.mjs");
const Route$2 = createFileRoute("/painel/$id")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./p._token-Dl5EdlB7.mjs");
const Route$1 = createFileRoute("/p/$token")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./investigados._id-W4tkBY5E.mjs");
const Route = createFileRoute("/investigados/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const UploadsRoute = Route$b.update({
  id: "/uploads",
  path: "/uploads",
  getParentRoute: () => Route$c
});
const PesquisaRoute = Route$a.update({
  id: "/pesquisa",
  path: "/pesquisa",
  getParentRoute: () => Route$c
});
const LoginRoute = Route$9.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$c
});
const FaceSearchRoute = Route$8.update({
  id: "/face-search",
  path: "/face-search",
  getParentRoute: () => Route$c
});
const DashboardRoute = Route$7.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$c
});
const ConfiguracoesRoute = Route$6.update({
  id: "/configuracoes",
  path: "/configuracoes",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const PainelIndexRoute = Route$4.update({
  id: "/painel/",
  path: "/painel/",
  getParentRoute: () => Route$c
});
const InvestigadosIndexRoute = Route$3.update({
  id: "/investigados/",
  path: "/investigados/",
  getParentRoute: () => Route$c
});
const PainelIdRoute = Route$2.update({
  id: "/painel/$id",
  path: "/painel/$id",
  getParentRoute: () => Route$c
});
const PTokenRoute = Route$1.update({
  id: "/p/$token",
  path: "/p/$token",
  getParentRoute: () => Route$c
});
const InvestigadosIdRoute = Route.update({
  id: "/investigados/$id",
  path: "/investigados/$id",
  getParentRoute: () => Route$c
});
const rootRouteChildren = {
  IndexRoute,
  ConfiguracoesRoute,
  DashboardRoute,
  FaceSearchRoute,
  LoginRoute,
  PesquisaRoute,
  UploadsRoute,
  InvestigadosIdRoute,
  PTokenRoute,
  PainelIdRoute,
  InvestigadosIndexRoute,
  PainelIndexRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPreload: "intent"
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$b as R,
  Route$2 as a,
  Route$1 as b,
  Route as c,
  router as r,
  useAuth as u
};
