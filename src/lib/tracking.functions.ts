import { createServerFn } from "@tanstack/react-start";

export type TrackingEvent = {
  date: string;
  status: string;
  location?: string;
  subStatus?: string;
};

export type TrackingResult = {
  code: string;
  carrier: string;
  service?: string;
  host?: string;
  quantidade?: number;
  events: TrackingEvent[];
  ok: boolean;
  error?: string;
};

function detectCarrier(code: string): string {
  const c = code.trim().toUpperCase();
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(c)) {
    if (c.startsWith("LP") || c.startsWith("SY") || c.startsWith("BR") === false && c.endsWith("CN")) return "Shopee / AliExpress";
    return "Correios";
  }
  if (/^NL\d+/.test(c)) return "AliExpress";
  if (/^SH\d+/.test(c)) return "Shopee";
  if (/^ML/.test(c)) return "Mercado Livre";
  return "Correios";
}

export const trackPackage = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => {
    const code = (data?.code ?? "").trim().toUpperCase();
    if (!code || code.length < 8 || code.length > 40) {
      throw new Error("Código de rastreio inválido");
    }
    return { code };
  })
  .handler(async ({ data }): Promise<TrackingResult> => {
    const user = process.env.LINKETRACK_USER ?? "teste";
    const token =
      process.env.LINKETRACK_TOKEN ??
      "1abcd00b2731640e886fb41a8a9671ad1434c599dbaa0a0de9a5aa619f29a83f";

    const url = `https://api.linketrack.com/track/json?user=${encodeURIComponent(
      user,
    )}&token=${encodeURIComponent(token)}&codigo=${encodeURIComponent(data.code)}`;

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "JTC-Rastreio/1.0", Accept: "application/json" },
      });
      if (!res.ok) {
        return {
          code: data.code,
          carrier: detectCarrier(data.code),
          events: [],
          ok: false,
          error: `Falha ao consultar (HTTP ${res.status})`,
        };
      }
      const json: any = await res.json();
      const eventos: any[] = Array.isArray(json?.eventos) ? json.eventos : [];
      const events: TrackingEvent[] = eventos.map((e) => ({
        date: `${e.data ?? ""} ${e.hora ?? ""}`.trim(),
        status: e.status ?? "",
        location: e.local ?? e.cidade ?? "",
        subStatus: Array.isArray(e.subStatus) ? e.subStatus.join(" • ") : e.subStatus,
      }));
      return {
        code: (json?.codigo as string) ?? data.code,
        carrier: detectCarrier(data.code),
        service: json?.servico,
        host: json?.host,
        quantidade: json?.quantidade,
        events,
        ok: events.length > 0 || Boolean(json?.codigo),
        error: events.length === 0 ? "Nenhum evento encontrado ainda." : undefined,
      };
    } catch (err) {
      return {
        code: data.code,
        carrier: detectCarrier(data.code),
        events: [],
        ok: false,
        error: err instanceof Error ? err.message : "Erro desconhecido",
      };
    }
  });