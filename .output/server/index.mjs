globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HookableCore } from "./_libs/hookable.mjs";
import { d as defineLazyEventHandler, H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { a as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/JTC_Investigacao_Desktop.zip.asset.json": {
    "type": "application/json",
    "etag": '"1ff-BlSKpV0lb59sDbAC0D7aDvEUpdo"',
    "mtime": "2026-09-12T17:29:42.935Z",
    "size": 511,
    "path": "../public/JTC_Investigacao_Desktop.zip.asset.json"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"bb11-o+QiFiudOb8Z6jhJyI7QrI6P0jY"',
    "mtime": "2026-09-12T17:29:42.935Z",
    "size": 47889,
    "path": "../public/favicon.ico"
  },
  "/sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12a6-snF5vpKWUmcfHC1Dk4gHUNtTCLQ"',
    "mtime": "2026-09-12T17:29:42.943Z",
    "size": 4774,
    "path": "../public/sw.js"
  },
  "/assets/AppShell-BMuSJjGH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"aad6-Q9oDHwoNGXb2vNQ+Zhz6tElYqIo"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 43734,
    "path": "../public/assets/AppShell-BMuSJjGH.js"
  },
  "/assets/arrow-left-BSpoO8k4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-2o1Gdxl4cbFF9v17oPkSNm5berc"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 177,
    "path": "../public/assets/arrow-left-BSpoO8k4.js"
  },
  "/assets/clock-CL4EDXT9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-a4ljvEy3lmoWPk+c805EnNnRC3c"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 176,
    "path": "../public/assets/clock-CL4EDXT9.js"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": '"25c-q+xG1uMNltyt4uyHuxiND3WFhac"',
    "mtime": "2026-09-12T19:12:18.404Z",
    "size": 604,
    "path": "../public/manifest.webmanifest"
  },
  "/assets/createLucideIcon-D_NMMt4p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e393-v6lQKN+Ragtj1no6y+sQuL/SbXA"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 123795,
    "path": "../public/assets/createLucideIcon-D_NMMt4p.js"
  },
  "/assets/configuracoes-BNui1PLj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25e1-s0fPV/sSgCKSC0uuiIvdj9Q2/Tg"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 9697,
    "path": "../public/assets/configuracoes-BNui1PLj.js"
  },
  "/assets/check-p_0YIBtk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"83-SgDSg6yehItZ/UnI5BNu3NsIBNE"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 131,
    "path": "../public/assets/check-p_0YIBtk.js"
  },
  "/assets/download-CWxspqhG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f4-a+i94q8dTJYsFs/sFRjoF0pckUQ"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 244,
    "path": "../public/assets/download-CWxspqhG.js"
  },
  "/assets/dashboard-HRVqmdkF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2d29-5/+lFeINCWJfBPrp5yXFchYuTWM"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 11561,
    "path": "../public/assets/dashboard-HRVqmdkF.js"
  },
  "/assets/eye-cXohjLNU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-xXIvXdvP10zNujYOxEMimS3xceY"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 263,
    "path": "../public/assets/eye-cXohjLNU.js"
  },
  "/assets/eye-off-BzbXl90S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ba-LOHY6GT2HpMCJ90HpuCDu33APpE"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 442,
    "path": "../public/assets/eye-off-BzbXl90S.js"
  },
  "/assets/face-search-DTxL0OuX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a188-8Ljr1TB5tXc4oRN98TgBYjfcoN4"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 41352,
    "path": "../public/assets/face-search-DTxL0OuX.js"
  },
  "/assets/folder-open-y7ZkZhND.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"130-iMosE+a8MCSFIdsIW3ZC4EvmW4E"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 304,
    "path": "../public/assets/folder-open-y7ZkZhND.js"
  },
  "/assets/file-text-BmFws0aL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18d-2eoYcrFY55w+loASZoA1PUGtQvM"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 397,
    "path": "../public/assets/file-text-BmFws0aL.js"
  },
  "/assets/format-Dl-QiU3-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"912-GlAwcG/RVKz2LoARytvsdxDQWlI"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 2322,
    "path": "../public/assets/format-Dl-QiU3-.js"
  },
  "/assets/funnel-DPBZQro1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-xhSyZCsR8F+00SK82lyV4hddIeE"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 263,
    "path": "../public/assets/funnel-DPBZQro1.js"
  },
  "/assets/index-DYc0yZpW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-tE6W4iFSHADch62+1eBV0pFrdfs"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 410,
    "path": "../public/assets/index-DYc0yZpW.js"
  },
  "/assets/investigacoes.index-e6gluDxo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1974-4W/YUpKIMFQKLMf/4NoG5gQzvpE"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 6516,
    "path": "../public/assets/investigacoes.index-e6gluDxo.js"
  },
  "/logo.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"b56eb-FBK7PLmjWeK/cmOAfbLJAjaacIQ"',
    "mtime": "2026-09-12T17:29:42.939Z",
    "size": 743147,
    "path": "../public/logo.ico"
  },
  "/logo.png": {
    "type": "image/png",
    "etag": '"b56d5-Ql/3MFsxTkZqvdgGtXiaecPz6ms"',
    "mtime": "2026-09-12T17:29:42.942Z",
    "size": 743125,
    "path": "../public/logo.png"
  },
  "/assets/index-BoqaYew0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"93ff0-atmYNXEzhc78TJF0db/VT0pfjqg"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 606192,
    "path": "../public/assets/index-BoqaYew0.js"
  },
  "/assets/investigacoes._id-C2m7op7D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eefc-6GJHnTWRUIkcks986Dbjbmonm6Q"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 61180,
    "path": "../public/assets/investigacoes._id-C2m7op7D.js"
  },
  "/assets/InvestigadoForm-B6n_Z2xR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c3ad-ElKLFQh4VyYByYgaut2Zobe3Qo8"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 50093,
    "path": "../public/assets/InvestigadoForm-B6n_Z2xR.js"
  },
  "/assets/face-BocDmmkl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18355a-diICYwXoBk8pR7ntX801vnr2O4U"',
    "mtime": "2026-09-12T19:50:36.184Z",
    "size": 1586522,
    "path": "../public/assets/face-BocDmmkl.js"
  },
  "/assets/investigados.index-D4aAdyv9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a8f-5cAzey0y0izXTpi2UgALbVCNk9Q"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 6799,
    "path": "../public/assets/investigados.index-D4aAdyv9.js"
  },
  "/assets/investigados._id-CVZUA8H1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4d77-li6LU6jNSdAlrQUXRt3CzifIIJA"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 19831,
    "path": "../public/assets/investigados._id-CVZUA8H1.js"
  },
  "/assets/link-2-CXejyexO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fe-AGKaJxdnK4uKQXAMCztyUnXsWew"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 254,
    "path": "../public/assets/link-2-CXejyexO.js"
  },
  "/assets/login-DQtvbMBs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1340-frXFvQZzAW4zvt9UdVDvUNyC2WE"',
    "mtime": "2026-09-12T19:50:36.112Z",
    "size": 4928,
    "path": "../public/assets/login-DQtvbMBs.js"
  },
  "/assets/p._token-DTP0v9Ex.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19d2-fcP6wb0V9QmGbgeUYE3kt4SaJ0c"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 6610,
    "path": "../public/assets/p._token-DTP0v9Ex.js"
  },
  "/assets/painel.index-CBo8PCdq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"15d6-XKP/qMWTWXA21pz5k+IJqdvtkPA"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 5590,
    "path": "../public/assets/painel.index-CBo8PCdq.js"
  },
  "/assets/painel._id-CcFaLSrC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12632-eVF8lJeZh/sJU8CnHAiESzvK+4s"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 75314,
    "path": "../public/assets/painel._id-CcFaLSrC.js"
  },
  "/assets/pencil-Dq4cQiCy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"120-uTYwlEHW1FbLmJNd6fAHfQsQyxo"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 288,
    "path": "../public/assets/pencil-Dq4cQiCy.js"
  },
  "/assets/PersonPicker-DR2PGzNE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"aee-+I3xdfgQaK2dvhV2obPpO8F3E3Y"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 2798,
    "path": "../public/assets/PersonPicker-DR2PGzNE.js"
  },
  "/assets/pesquisa-Bp-3ne0A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1b90-LuQgUYF4Ghvl7tQJ57avXlkF+8Y"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 7056,
    "path": "../public/assets/pesquisa-Bp-3ne0A.js"
  },
  "/assets/plus-kuIfFK8p.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a5-2FtlqAKT0KOIOHU6Bhe6WnzUhmE"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 165,
    "path": "../public/assets/plus-kuIfFK8p.js"
  },
  "/assets/shield-CFMCwm5f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"117-RJzrGx+tpoSgCyiuc2igpARvTUw"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 279,
    "path": "../public/assets/shield-CFMCwm5f.js"
  },
  "/assets/sparkles-DwR457QU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fa-U44QGwMsh2K1bIb6F5fSZAqZtYg"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 506,
    "path": "../public/assets/sparkles-DwR457QU.js"
  },
  "/assets/trash-2-DXwybKcf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"154-4+nfebC9PfJ+MzM6oIWmPo1Fs4M"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 340,
    "path": "../public/assets/trash-2-DXwybKcf.js"
  },
  "/assets/triangle-alert-BYoxwxeB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f2-sqgLYqbJKHrFGyctLMwq1gVm15U"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 498,
    "path": "../public/assets/triangle-alert-BYoxwxeB.js"
  },
  "/assets/ui-B-zvK5V8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29f3-vm3YFTx0MTnRDF41m2dQyWDmluk"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 10739,
    "path": "../public/assets/ui-B-zvK5V8.js"
  },
  "/assets/uploads-9uWfpHoM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2c75-DBdyojaMFelpjhSpOPcApElkJ3s"',
    "mtime": "2026-09-12T19:50:36.112Z",
    "size": 11381,
    "path": "../public/assets/uploads-9uWfpHoM.js"
  },
  "/assets/use-realtime-D-RHQIYz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"143-7ZQT3ZCHjFvKiUBCpQsr0nKPGHM"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 323,
    "path": "../public/assets/use-realtime-D-RHQIYz.js"
  },
  "/assets/styles-BBZaRHNo.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"20ffe-kc0VE12FFHcZj9pArlRJaEvAh34"',
    "mtime": "2026-09-12T19:50:36.103Z",
    "size": 135166,
    "path": "../public/assets/styles-BBZaRHNo.css"
  },
  "/assets/user-BxF_MXko.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cb-OFe9VoJ0gvZiyyRjagotlryo04M"',
    "mtime": "2026-09-12T19:50:36.114Z",
    "size": 203,
    "path": "../public/assets/user-BxF_MXko.js"
  },
  "/assets/zoom-out-But3eKc1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"202-dHa0LJXqVwF090CvtaFmgvCAKuc"',
    "mtime": "2026-09-12T19:50:36.113Z",
    "size": 514,
    "path": "../public/assets/zoom-out-But3eKc1.js"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_768VfC = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_768VfC };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
