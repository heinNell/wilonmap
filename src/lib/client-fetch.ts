export async function apiGet<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as any)?.error || `Request failed (${res.status})`;
    const details = (data as any)?.body || "";
    throw new Error(`${message}${details ? ` — ${String(details).slice(0, 200)}…` : ""}`);
  }
  return data as T;
}
