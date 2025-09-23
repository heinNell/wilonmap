// src/lib/wialon-client.ts
import { z } from "zod";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface WialonOptions {
  baseUrl?: string;
  token?: string;
  sid?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseMs?: number;
}

export class WialonHttpError extends Error {
  public status: number;
  public bodyText: string | undefined;
  public causeErr?: unknown;

  constructor(msg: string, status: number, bodyText?: string, causeErr?: unknown) {
    super(msg);
    this.name = "WialonHttpError";
    this.status = status;
    this.bodyText = bodyText;
    this.causeErr = causeErr;
  }
}

// Schemas (lenient)
const LoginSchema = z.object({ eid: z.string().optional(), sid: z.string().optional() }).passthrough();
const ItemsEnvelopeSchema = z.object({ items: z.array(z.any()).optional() }).passthrough();
const MessagesIntervalSchema = z.object({}).passthrough();

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function withRetry<T>(fn: () => Promise<T>, opts: { maxRetries: number; baseMs: number }) {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= opts.maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = (err as WialonHttpError)?.status;
      const retryable =
        err?.name === "FetchError" ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT" ||
        status === 429 ||
        (typeof status === "number" && status >= 500);
      if (!retryable || attempt === opts.maxRetries) break;
      const backoff = opts.baseMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * opts.baseMs);
      await sleep(backoff + jitter);
      attempt++;
    }
  }
  throw lastErr;
}

export class WialonClient {
  private baseUrl: string;
  private sid?: string;
  private defaultToken?: string;
  private timeoutMs: number;
  private maxRetries: number;
  private retryBaseMs: number;

  constructor(opts: WialonOptions = {}) {
    this.baseUrl = opts.baseUrl ?? "https://hst-api.wialon.com/wialon/ajax.html";
    this.sid = opts.sid;
    this.defaultToken = opts.token;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.maxRetries = opts.maxRetries ?? 3;
    this.retryBaseMs = opts.retryBaseMs ?? 250;
  }

  get sessionId() { return this.sid; }
  clearSession() { this.sid = undefined; }

  // Low-level POST
  private async post<T extends Json>(svc: string, params: Json | string, sid?: string): Promise<T> {
    const sp = new URLSearchParams();
    sp.set("svc", svc);
    sp.set("params", typeof params === "string" ? params : JSON.stringify(params));
    const finalSid = sid ?? this.sid;
    if (finalSid) sp.set("sid", finalSid);

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: sp.toString(),
        signal: controller.signal,
      });

      const text = await res.text();
      if (!res.ok) throw new WialonHttpError(`HTTP ${res.status} on ${svc}`, res.status, text);

      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new WialonHttpError(`Invalid JSON on ${svc}`, res.status, text, e);
      }

      return json as T;
    } catch (err: any) {
      if (err?.name === "AbortError") throw new WialonHttpError(`Timeout after ${this.timeoutMs}ms on ${svc}`, 408);
      if (err instanceof WialonHttpError) throw err;
      throw new WialonHttpError(`Network error on ${svc}`, 0, undefined, err);
    } finally {
      clearTimeout(to);
    }
  }

  // POST with retries
  private async postWithRetry<T extends Json>(svc: string, params: Json | string, sid?: string) {
    return withRetry(() => this.post<T>(svc, params, sid), {
      maxRetries: this.maxRetries,
      baseMs: this.retryBaseMs,
    });
  }

  private async ensureSid() {
    if (this.sid) return;
    if (!this.defaultToken) throw new Error("No session. Call loginWithToken(token) or provide options.token");
    await this.loginWithToken();
    if (!this.sid) throw new Error("Login failed to produce SID");
  }

  // 1) token/login
  async loginWithToken(token?: string) {
    const tkn = token ?? this.defaultToken;
    if (!tkn) throw new Error("Missing token for login");

    const data = await this.postWithRetry<any>("token/login", { token: tkn });
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) throw new WialonHttpError("Unexpected login response shape", 200, JSON.stringify(data));

    const sid = parsed.data.eid || parsed.data.sid;
    if (!sid) throw new WialonHttpError("Login did not return a session id (eid/sid)", 200, JSON.stringify(data));

    this.sid = sid;
    return parsed.data;
  }

  async logout() {
    if (!this.sid) return { ok: true };
    const res = await this.postWithRetry<any>("core/logout", {});
    this.sid = undefined;
    return res;
  }

  // 2) Units by name (flags=1)
  async listUnits() {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_unit", propName: "sys_name", propValueMask: "*", sortType: "sys_name" },
      force: 1, flags: 1, from: 0, to: 0,
    } as const;
    const res = await this.postWithRetry<any>("core/search_items", params, this.sid);
    return ItemsEnvelopeSchema.parse(res);
  }

  // 3) Specific unit by sys_id (big flags)
  async getUnitById(sysId: string | number) {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_unit", propName: "sys_id", propValueMask: String(sysId), sortType: "sys_name" },
      force: 1, flags: 4611686018427387903, from: 0, to: 0,
    } as const;
    const res = await this.postWithRetry<any>("core/search_items", params, this.sid);
    return ItemsEnvelopeSchema.parse(res);
  }

  // 4) Real-time tracking (flags=1025)
  async getPositionsNow() {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_unit", propName: "sys_name", propValueMask: "*", sortType: "sys_name" },
      force: 1, flags: 1025, from: 0, to: 0,
    } as const;
    const res = await this.postWithRetry<any>("core/search_items", params, this.sid);
    return ItemsEnvelopeSchema.parse(res);
  }

  // 5) Report templates (avl_resource, flags=8192)
  async listReportTemplates() {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_resource", propName: "", propValueMask: "", sortType: "" },
      force: 1, flags: 8192, from: 0, to: 0,
    } as const;
    const res = await this.postWithRetry<any>("core/search_items", params, this.sid);
    return ItemsEnvelopeSchema.parse(res);
  }

  // 6) Message history
  async loadMessagesInterval(args: { itemId: number; timeFrom: number; timeTo: number; loadCount?: number }) {
    await this.ensureSid();
    const params = {
      itemId: args.itemId, timeFrom: args.timeFrom, timeTo: args.timeTo,
      flags: 0, flagsMask: 0, loadCount: args.loadCount ?? 100,
    } as const;
    const res = await this.postWithRetry<any>("messages/load_interval", params, this.sid);
    return MessagesIntervalSchema.parse(res);
  }

  // 7) Geofences (flags=16)
  async getGeofences() {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_resource", propName: "", propValueMask: "", sortType: "" },
      force: 1, flags: 16, from: 0, to: 0,
    } as const;
    const res = await this.postWithRetry<any>("core/search_items", params, this.sid);
    return ItemsEnvelopeSchema.parse(res);
  }

  // 8) Geofences wildcard name (flags=16)
  async getGeofencesByNameWildcard() {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_resource", propName: "name", propValueMask: "*", sortType: "" },
      force: 1, flags: 16, from: 0, to: 0,
    } as const;
    const res = await this.postWithRetry<any>("core/search_items", params, this.sid);
    return ItemsEnvelopeSchema.parse(res);
  }

  // 9) Geofences with specific flags (exploration helper)
  async getGeofencesWithFlags(flags: number) {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_resource", propName: "", propValueMask: "", sortType: "" },
      force: 1,
      flags,
      from: 0,
      to: 0,
    } as const;
    return this.postWithRetry<any>("core/search_items", params, this.sid);
  }

  // 10) List resources with minimal info (to get resource IDs)
  async listResourcesMinimal() {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_resource", propName: "", propValueMask: "", sortType: "" },
      force: 1,
      flags: 1, // tiny flags to get id & minimal meta
      from: 0,
      to: 0,
    } as const;
    return this.postWithRetry<any>("core/search_items", params, this.sid);
  }

  // 11) Fetch one resource by id with BIG flags (zones/geofences usually included)
  async getResourceByIdDeep(resourceId: number | string, flags = 4611686018427387903) {
    await this.ensureSid();
    const params = {
      spec: { itemsType: "avl_resource", propName: "sys_id", propValueMask: String(resourceId), sortType: "" },
      force: 1,
      flags, // start big; trim once you learn the minimal mask you need
      from: 0,
      to: 0,
    } as const;
    return this.postWithRetry<any>("core/search_items", params, this.sid);
  }
}
