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
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"bb11-o+QiFiudOb8Z6jhJyI7QrI6P0jY"',
    "mtime": "2026-07-09T06:15:44.000Z",
    "size": 47889,
    "path": "../public/favicon.ico"
  },
  "/assets/activity-D3zd7n9P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f6-CyOlNPphnqC2H6KqRInjuZguS9w"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 246,
    "path": "../public/assets/activity-D3zd7n9P.js"
  },
  "/assets/check-BvxlXMKF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"83-UeK/dIg6FSbQaCDvXX4NpAwaFeQ"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 131,
    "path": "../public/assets/check-BvxlXMKF.js"
  },
  "/assets/configuracoes-Dw0b217K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b6e-nSjoZPtcFF6V3sGRL5u22egp9vA"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 2926,
    "path": "../public/assets/configuracoes-Dw0b217K.js"
  },
  "/assets/AppShell-ZnxcjPlT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"953c-Rqhvm6tJMMVt7r4OHhSMxiJHT3c"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 38204,
    "path": "../public/assets/AppShell-ZnxcjPlT.js"
  },
  "/assets/arrow-left-D1X8znp_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-9P7Tvp/RHIrj41UGbmcWvbbOCHo"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 177,
    "path": "../public/assets/arrow-left-D1X8znp_.js"
  },
  "/assets/dashboard-CYTR_v2S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e5d-KlpchS/Q7tJZBwLZOK5mj40qrJQ"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 11869,
    "path": "../public/assets/dashboard-CYTR_v2S.js"
  },
  "/assets/eye-hyrX2PjG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-UB5VdBi5RmlX1QnfYHUn95bxsAo"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 263,
    "path": "../public/assets/eye-hyrX2PjG.js"
  },
  "/assets/download-D02e0qTC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f4-PfVw0jUW0o5L5ZVW3Io4FdE1qbw"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 244,
    "path": "../public/assets/download-D02e0qTC.js"
  },
  "/assets/folder-open-BRkk2jdb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"130-qkgPrvgavMgHniA82zsuXw8RlXw"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 304,
    "path": "../public/assets/folder-open-BRkk2jdb.js"
  },
  "/assets/createLucideIcon-162zDGQX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e393-22szH3WMxZYNTUJneaVANaqCy+U"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 123795,
    "path": "../public/assets/createLucideIcon-162zDGQX.js"
  },
  "/assets/funnel-C_bPCfUm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-GVKe3JVBNE0ZE0W4qdF3pzJy+Pk"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 263,
    "path": "../public/assets/funnel-C_bPCfUm.js"
  },
  "/assets/index-qtrzv8s_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"19a-MEc7BdVS4HH67jNzSJn8agKjzec"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 410,
    "path": "../public/assets/index-qtrzv8s_.js"
  },
  "/assets/investigados.index-z9fXAoSj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1962-V2D7eGiuG1uY4qkC8CvCmtwEJNU"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 6498,
    "path": "../public/assets/investigados.index-z9fXAoSj.js"
  },
  "/assets/InvestigadoForm-D9H9SVwc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ccf9-MnnkUIEEVRqT7T3wE1cOZb8iv4w"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 52473,
    "path": "../public/assets/InvestigadoForm-D9H9SVwc.js"
  },
  "/assets/investigados._id-1mr3_0-B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3ac3-ABKUVsV+j2hgQBy0t5cTThHGf1Y"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 15043,
    "path": "../public/assets/investigados._id-1mr3_0-B.js"
  },
  "/assets/link-2-DrVayFNh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fe-JmECz2LUM+U7H8FWnBK3U8qqHN0"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 254,
    "path": "../public/assets/link-2-DrVayFNh.js"
  },
  "/assets/login-Bymr4TqQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10df-dVS5s/4YJOwHo714Wvji+RKI2xE"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 4319,
    "path": "../public/assets/login-Bymr4TqQ.js"
  },
  "/assets/p._token-cTqG9qN-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1920-5zyc+oG40jWyZBIyQGfWL8H2YLs"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 6432,
    "path": "../public/assets/p._token-cTqG9qN-.js"
  },
  "/assets/painel.index-ggIpwF50.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"150a-FHCbNhbxAnB5MM7Sj6Hlg7l2TPg"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 5386,
    "path": "../public/assets/painel.index-ggIpwF50.js"
  },
  "/JTC_Investigacao.exe": {
    "type": "application/octet-stream",
    "etag": '"b7400-6GB3LzdRI46miBTtP+f0C0bVG2c"',
    "mtime": "2026-07-09T06:59:42.710Z",
    "size": 750592,
    "path": "../public/JTC_Investigacao.exe"
  },
  "/logo.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"b56eb-FBK7PLmjWeK/cmOAfbLJAjaacIQ"',
    "mtime": "2026-07-09T06:59:12.708Z",
    "size": 743147,
    "path": "../public/logo.ico"
  },
  "/logo.png": {
    "type": "image/png",
    "etag": '"b56d5-Ql/3MFsxTkZqvdgGtXiaecPz6ms"',
    "mtime": "2026-07-09T06:53:33.997Z",
    "size": 743125,
    "path": "../public/logo.png"
  },
  "/assets/index-Cxevzr62.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"92893-4SXXNqVXbYxn3q41yo8f5axty5Q"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 600211,
    "path": "../public/assets/index-Cxevzr62.js"
  },
  "/assets/face-search-Zs3yOkzN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14980a-+PrTKDGACRk4yAordxqqnpOO0MQ"',
    "mtime": "2026-07-09T07:45:02.070Z",
    "size": 1349642,
    "path": "../public/assets/face-search-Zs3yOkzN.js"
  },
  "/assets/painel._id-CutlF8b9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"c0e4-EZHeBzTnS3H2QDN3KgBRw+AclsE"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 49380,
    "path": "../public/assets/painel._id-CutlF8b9.js"
  },
  "/assets/PersonPicker-DPa_54jx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b5b-pVeivmZzgCVJ85dWc2yCLebMml4"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 2907,
    "path": "../public/assets/PersonPicker-DPa_54jx.js"
  },
  "/assets/pesquisa-Cmrvi_-t.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1af9-KMKjtSZ6Ne4xqlPTVIK/ARKb3YM"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 6905,
    "path": "../public/assets/pesquisa-Cmrvi_-t.js"
  },
  "/assets/plus-DzOrw5du.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a5-e2T1VmD91axwhYfdALI0y1ZvjRc"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 165,
    "path": "../public/assets/plus-DzOrw5du.js"
  },
  "/assets/styles-CwgMhCQ_.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"1ac92-/HGK9D6hUh83NlXns85YVt/6ngw"',
    "mtime": "2026-07-09T07:45:02.061Z",
    "size": 109714,
    "path": "../public/assets/styles-CwgMhCQ_.css"
  },
  "/assets/shield-xW0Xq4MP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"117-YIrt+CwLZjRopdXSlrsYfGTyIFw"',
    "mtime": "2026-07-09T07:45:02.070Z",
    "size": 279,
    "path": "../public/assets/shield-xW0Xq4MP.js"
  },
  "/assets/shield-alert-DTxQdw92.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16d-F5uVLdBhOr50vpxazJcwUW971nQ"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 365,
    "path": "../public/assets/shield-alert-DTxQdw92.js"
  },
  "/assets/trash-2-BRFfxjZ5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"238-X4EM/a0MNk5QpRfP61MdKcovK9g"',
    "mtime": "2026-07-09T07:45:02.069Z",
    "size": 568,
    "path": "../public/assets/trash-2-BRFfxjZ5.js"
  },
  "/assets/uploads-BAciAXap.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2cff-cqtoov+QcOSlEO/VyGXXItbqMts"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 11519,
    "path": "../public/assets/uploads-BAciAXap.js"
  },
  "/assets/use-realtime-8Q3vlHfA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"143-6d2G9Mbw7gkS9uAqcJZWPo8GmYk"',
    "mtime": "2026-07-09T07:45:02.068Z",
    "size": 323,
    "path": "../public/assets/use-realtime-8Q3vlHfA.js"
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
const _lazy_SOA5fc = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_SOA5fc };
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
