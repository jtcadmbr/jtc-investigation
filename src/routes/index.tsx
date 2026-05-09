import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  trackPackage,
  type TrackingResult,
} from "@/lib/tracking.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Package,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JTC Rastreio — Acompanhe seus pedidos" },
      {
        name: "description",
        content:
          "Rastreie encomendas dos Correios, Shopee, Mercado Livre e AliExpress em um só lugar.",
      },
    ],
  }),
  component: Index,
});

const RECENT_KEY = "jtc-rastreio:recent";

type Recent = { code: string; label?: string; addedAt: number };

function statusIcon(status: string) {
  const s = status.toLowerCase();
  if (s.includes("entregue")) return CheckCircle2;
  if (s.includes("saiu") || s.includes("transito") || s.includes("trânsito") || s.includes("encaminhado"))
    return Truck;
  if (s.includes("postad") || s.includes("objeto postado")) return Package;
  return Clock;
}

function carrierBadge(carrier: string) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {carrier}
    </span>
  );
}

function Index() {
  const [code, setCode] = useState("");
  const [recent, setRecent] = useState<Recent[]>([]);
  const trackFn = useServerFn(trackPackage);

  const mutation = useMutation({
    mutationFn: (c: string) => trackFn({ data: { code: c } }),
    onSuccess: (data) => {
      if (data?.code) {
        setRecent((prev) => {
          const next = [
            { code: data.code, addedAt: Date.now() },
            ...prev.filter((r) => r.code !== data.code),
          ].slice(0, 6);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          return next;
        });
      }
    },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const result: TrackingResult | undefined = mutation.data;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c) mutation.mutate(c);
  }

  function pickRecent(c: string) {
    setCode(c);
    mutation.mutate(c);
  }

  function removeRecent(c: string) {
    setRecent((prev) => {
      const next = prev.filter((r) => r.code !== c);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }

  const lastEvent = useMemo(() => result?.events?.[0], [result]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Package className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-foreground">JTC</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Rastreio
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Correios · Shopee · ML · AliExpress</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-12">
        <section className="text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Acompanhe sua encomenda
          </h1>
          <p className="mx-auto mt-3 max-w-md text-balance text-base text-muted-foreground">
            Cole o código de rastreio dos Correios, Shopee, Mercado Livre ou AliExpress.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-[0_1px_0_0_oklch(0.92_0.006_270)] focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent/10"
          >
            <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: BR123456789BR"
              className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              type="submit"
              disabled={mutation.isPending || !code.trim()}
              className="h-11 rounded-xl px-5"
            >
              {mutation.isPending ? "Buscando…" : "Rastrear"}
            </Button>
          </form>

          {recent.length > 0 && (
            <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-1.5">
              {recent.map((r) => (
                <span
                  key={r.code}
                  className="group inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-accent/60"
                >
                  <button onClick={() => pickRecent(r.code)} className="font-mono">
                    {r.code}
                  </button>
                  <button
                    onClick={() => removeRecent(r.code)}
                    className="ml-0.5 text-muted-foreground hover:text-destructive"
                    aria-label="Remover"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {result && (
          <section className="mt-12">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="border-b border-border/70 px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{result.code}</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                      {lastEvent?.status ?? (result.error ?? "Sem informações")}
                    </h2>
                    {lastEvent?.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {lastEvent.location}
                      </p>
                    )}
                  </div>
                  {carrierBadge(result.carrier)}
                </div>
              </div>

              {result.events.length > 0 ? (
                <ol className="relative px-6 py-6">
                  {result.events.map((ev, i) => {
                    const Icon = statusIcon(ev.status);
                    const isFirst = i === 0;
                    return (
                      <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                        {i < result.events.length - 1 && (
                          <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border" />
                        )}
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                            isFirst
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`text-sm ${
                              isFirst ? "font-semibold text-foreground" : "text-foreground/90"
                            }`}
                          >
                            {ev.status}
                          </p>
                          {ev.subStatus && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{ev.subStatus}</p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            {ev.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {ev.location}
                              </span>
                            )}
                            {ev.date && <span>{ev.date}</span>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="flex items-start gap-3 px-6 py-8 text-sm text-muted-foreground">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {result.error ??
                      "Ainda não há eventos para este código. Tente novamente em alguns minutos."}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {!result && !mutation.isPending && (
          <section className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Correios", "Shopee", "Mercado Livre", "AliExpress"].map((name) => (
              <div
                key={name}
                className="rounded-2xl border border-border bg-card p-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-foreground">{name}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-3xl px-5 pb-10 text-center text-xs text-muted-foreground">
        Dados via Link & Track · JTC Rastreio
      </footer>
    </div>
  );
}
