/**
 * Cache de leitura offline.
 *
 * O sistema é usado em campo, muitas vezes sem internet. Toda leitura passa por
 * `cq()`: quando a rede responde, o resultado é persistido em localStorage;
 * quando a rede falha (offline, DNS, timeout), devolvemos o último resultado
 * conhecido em vez de propagar o erro para a tela.
 */

export type QueryResult<T> = { data: T | null; error: { message: string } | null };

const PREFIX = "jtc.offline.v1.";

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCache<T>(key: string): T | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // cota excedida: descarta silenciosamente, o cache é best-effort
  }
}

/** Erros de rede não devem virar erro de tela — indicam apenas "sem conexão". */
function isNetworkFailure(message: string | undefined): boolean {
  if (!message) return false;
  return /failed to fetch|network|fetch failed|load failed|offline|timeout|typeerror/i.test(message);
}

/**
 * Executa uma leitura e memoriza o resultado.
 * Em falha de rede devolve o valor cacheado com `offline: true`.
 */
export async function cq<T>(
  key: string,
  run: () => PromiseLike<QueryResult<T>>,
): Promise<QueryResult<T> & { offline: boolean }> {
  try {
    const res = await run();
    if (res.error) {
      if (isNetworkFailure(res.error.message)) {
        const cached = readCache<T>(key);
        if (cached !== null) {
          // If network failed but we have cached data, return cached data as successful offline.
          return { data: cached, error: null, offline: true };
        }
      }
      // If there's an error and no cached data, or not a network failure, return the error.
      return { ...res, offline: false };
    }
    // If successful, cache data and return.
    if (res.data !== null && res.data !== undefined) writeCache(key, res.data);
    return { ...res, offline: false };
  } catch (err) {
    // Catch any synchronous errors from `run()` or other parts of the try block.
    const cached = readCache<T>(key);
    const errorMessage = err instanceof Error ? err.message : "Sem conexão";
    if (cached !== null && isNetworkFailure(errorMessage)) {
      // If caught error is a network failure and we have cached data, return cached data.
      return { data: cached, error: null, offline: true };
    }
    // Otherwise, return error, potentially with `offline: true` if it was a network failure and no data.
    return {
      data: null,
      error: { message: errorMessage },
      offline: true, // Assuming most caught errors here are related to network issues or inability to fetch.
    };
  }
}

/** Igual a `cq`, mas para contagens (`head: true` não retorna `data`). */
export async function cqCount(
  key: string,
  run: () => PromiseLike<{ count: number | null; error: { message: string } | null }>,
): Promise<number> {
  try {
    const res = await run();
    if (res.error) throw new Error(res.error.message);
    const count = res.count ?? 0;
    writeCache(key, count);
    return count;
  } catch {
    return readCache<number>(key) ?? 0;
  }
}

/**
 * Fallback de ficha individual: quando a pessoa nunca foi aberta offline,
 * ainda podemos recuperá-la da listagem completa já cacheada.
 */
export function findCachedInvestigated(id: string): Record<string, unknown> | null {
  const list = readCache<Record<string, unknown>[]>("investigateds.all");
  if (!Array.isArray(list)) return null;
  return list.find((p) => p?.["id"] === id) ?? null;
}

export function cachedUploadsFor(id: string): Record<string, unknown>[] {
  const list = readCache<Record<string, unknown>[]>("uploads.all");
  if (!Array.isArray(list)) return [];
  return list.filter((u) => u?.["investigated_id"] === id);
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}