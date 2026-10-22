import crypto from "crypto";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  type SessionTokenPayload,
  type User,
  type UserRole,
  payloadToUser,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth-token";

export type { User, UserRole };

export type DbError = {
  message: string;
  code?: string;
  details?: string;
};

export type QueryResult<T> = {
  data: T | null;
  error: DbError | null;
  count?: number | null;
};

const ALLOWED_TABLES = new Set([
  "users",
  "user_mfa_factors",
  "password_reset_tokens",
  "user_settings",
  "resumes",
  "cover_letters",
  "applications",
  "interviews",
  "saved_opportunities",
  "essays",
  "recommenders",
]);

const JSONB_COLUMNS = new Set(["data", "meta", "user_metadata", "app_metadata"]);
const DATE_ONLY_COLUMNS = new Set(["date", "deadline", "due_date"]);
const IDENTIFIER_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function getDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    "";
  return url.trim();
}

export function isNeonConfigured(): boolean {
  const url = getDatabaseUrl();
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

let cachedSqlUrl: string | null = null;
let cachedSqlExecutor: ReturnType<typeof neon> | null = null;

function getSqlExecutor() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured. Connect Neon Postgres in .env.local or Vercel.");
  }
  if (cachedSqlExecutor && cachedSqlUrl === url) {
    return cachedSqlExecutor;
  }
  cachedSqlUrl = url;
  cachedSqlExecutor = neon(url);
  return cachedSqlExecutor;
}

export async function rawQuery<T = Record<string, unknown>>(
  queryText: string,
  params: unknown[] = []
): Promise<T[]> {
  const sql = getSqlExecutor();
  const rows = await sql.query(queryText, params);
  return (rows as T[]).map((row) => normalizeRow(row));
}

function normalizeRow<T>(row: T): T {
  if (!row || typeof row !== "object") return row;
  const copy: Record<string, unknown> = { ...(row as Record<string, unknown>) };
  for (const [k, v] of Object.entries(copy)) {
    if (v instanceof Date) {
      copy[k] = DATE_ONLY_COLUMNS.has(k) ? v.toISOString().slice(0, 10) : v.toISOString();
    } else if (typeof v === "string" && DATE_ONLY_COLUMNS.has(k) && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      copy[k] = v.slice(0, 10);
    }
  }
  return copy as T;
}

function sanitizeTable(table: string): string {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
  return `public.${table}`;
}

function sanitizeColumn(col: string): string {
  const trimmed = col.trim();
  if (!IDENTIFIER_RE.test(trimmed)) {
    throw new Error(`Invalid column identifier: ${col}`);
  }
  return `"${trimmed}"`;
}

function sanitizeSelectList(columns: string): string {
  const trimmed = (columns || "*").trim();
  if (trimmed === "*") return "*";
  return trimmed
    .split(",")
    .map((part) => sanitizeColumn(part))
    .join(", ");
}

function toDbError(err: unknown): DbError {
  if (err && typeof err === "object") {
    const code = "code" in err && typeof err.code === "string" ? err.code : undefined;
    const message = "message" in err && typeof err.message === "string" ? err.message : "Database error";
    const details = "detail" in err && typeof err.detail === "string" ? err.detail : undefined;
    return { message, code, details };
  }
  return { message: String(err || "Database error") };
}

type WhereClause = {
  build: (nextParam: (val: unknown) => string) => string;
};

type OrderClause = {
  column: string;
  ascending: boolean;
  nullsFirst?: boolean;
};

class NeonQueryBuilder<T = unknown> implements PromiseLike<QueryResult<T>> {
  private table: string;
  private operation: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectColumns = "*";
  private wantCount = false;
  private headOnly = false;
  private valuesPayload: Record<string, unknown> | Array<Record<string, unknown>> | null = null;
  private conflictTarget: string | null = null;
  private hasReturningSelect = false;
  private whereClauses: WhereClause[] = [];
  private orderClauses: OrderClause[] = [];
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private rowMode: "many" | "single" | "maybeSingle" = "many";

  constructor(table: string) {
    this.table = table;
  }

  select(columns = "*", options?: { count?: "exact"; head?: boolean }) {
    if (this.operation === "insert" || this.operation === "update" || this.operation === "upsert") {
      this.selectColumns = columns;
      this.hasReturningSelect = true;
      return this;
    }
    this.operation = "select";
    this.selectColumns = columns;
    if (options?.count === "exact") this.wantCount = true;
    if (options?.head) this.headOnly = true;
    return this;
  }

  insert(values: Record<string, unknown> | Array<Record<string, unknown>>) {
    this.operation = "insert";
    this.valuesPayload = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation = "update";
    this.valuesPayload = values;
    return this;
  }

  upsert(values: Record<string, unknown>, options?: { onConflict?: string }) {
    this.operation = "upsert";
    this.valuesPayload = values;
    this.conflictTarget = options?.onConflict || null;
    return this;
  }

  delete(options?: { count?: "exact" }) {
    this.operation = "delete";
    if (options?.count === "exact") this.wantCount = true;
    return this;
  }

  eq(column: string, value: unknown) {
    const col = sanitizeColumn(column);
    this.whereClauses.push({
      build: (nextParam) => (value === null ? `${col} IS NULL` : `${col} = ${nextParam(value)}`),
    });
    return this;
  }

  in(column: string, values: readonly unknown[]) {
    const col = sanitizeColumn(column);
    const list = Array.from(values);
    this.whereClauses.push({
      build: (nextParam) => {
        if (list.length === 0) return "FALSE";
        const placeholders = list.map((item) => nextParam(item)).join(", ");
        return `${col} IN (${placeholders})`;
      },
    });
    return this;
  }

  gte(column: string, value: unknown) {
    const col = sanitizeColumn(column);
    this.whereClauses.push({
      build: (nextParam) => `${col} >= ${nextParam(value)}`,
    });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    const col = sanitizeColumn(column);
    const op = operator.trim().toLowerCase();
    this.whereClauses.push({
      build: (nextParam) => {
        if (op === "is" && value === null) {
          return `${col} IS NOT NULL`;
        }
        return `NOT (${col} = ${nextParam(value)})`;
      },
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orderClauses.push({
      column: sanitizeColumn(column),
      ascending: options?.ascending ?? true,
      nullsFirst: options?.nullsFirst,
    });
    return this;
  }

  limit(count: number) {
    this.limitCount = Math.max(0, Math.floor(count));
    return this;
  }

  range(from: number, to: number) {
    const start = Math.max(0, Math.floor(from));
    const end = Math.max(start, Math.floor(to));
    this.offsetCount = start;
    this.limitCount = end - start + 1;
    return this;
  }

  single<R = T>() {
    this.rowMode = "single";
    return this as unknown as NeonQueryBuilder<R>;
  }

  maybeSingle<R = T>() {
    this.rowMode = "maybeSingle";
    return this as unknown as NeonQueryBuilder<R>;
  }

  private buildWhereSql(nextParam: (val: unknown) => string): string {
    if (this.whereClauses.length === 0) return "";
    return ` WHERE ${this.whereClauses.map((w) => w.build(nextParam)).join(" AND ")}`;
  }

  private buildOrderSql(): string {
    if (this.orderClauses.length === 0) return "";
    const parts = this.orderClauses.map((o) => {
      const dir = o.ascending ? "ASC" : "DESC";
      const nulls =
        o.nullsFirst === undefined ? "" : o.nullsFirst ? " NULLS FIRST" : " NULLS LAST";
      return `${o.column} ${dir}${nulls}`;
    });
    return ` ORDER BY ${parts.join(", ")}`;
  }

  private prepareValue(key: string, val: unknown): { placeholder: (nextParam: (v: unknown) => string) => string } {
    if (val !== null && val !== undefined && JSONB_COLUMNS.has(key) && typeof val === "object") {
      return {
        placeholder: (nextParam) => `${nextParam(JSON.stringify(val))}::jsonb`,
      };
    }
    return {
      placeholder: (nextParam) => nextParam(val),
    };
  }

  async execute(): Promise<QueryResult<T>> {
    try {
      const tableSql = sanitizeTable(this.table);
      const params: unknown[] = [];
      const nextParam = (val: unknown) => {
        params.push(val);
        return `$${params.length}`;
      };

      if (this.operation === "select") {
        const whereSql = this.buildWhereSql(nextParam);
        let totalCount: number | null = null;

        if (this.wantCount) {
          const countParams = [...params];
          const countRows = await rawQuery<{ count: string | number }>(
            `SELECT COUNT(*)::int AS count FROM ${tableSql}${whereSql}`,
            countParams
          );
          totalCount = Number(countRows[0]?.count ?? 0);
        }

        if (this.headOnly) {
          return { data: null, error: null, count: totalCount ?? 0 };
        }

        const colsSql = sanitizeSelectList(this.selectColumns);
        const orderSql = this.buildOrderSql();
        const limitSql =
          this.limitCount !== null
            ? ` LIMIT ${this.limitCount}`
            : this.rowMode !== "many"
              ? " LIMIT 2"
              : "";
        const offsetSql = this.offsetCount !== null ? ` OFFSET ${this.offsetCount}` : "";

        const rows = await rawQuery<Record<string, unknown>>(
          `SELECT ${colsSql} FROM ${tableSql}${whereSql}${orderSql}${limitSql}${offsetSql}`,
          params
        );

        if (this.rowMode === "single") {
          if (rows.length === 0) {
            return { data: null, error: { message: "Row not found", code: "PGRST116" }, count: totalCount };
          }
          return { data: rows[0] as unknown as T, error: null, count: totalCount };
        }

        if (this.rowMode === "maybeSingle") {
          return { data: (rows[0] ?? null) as unknown as T, error: null, count: totalCount };
        }

        return { data: rows as unknown as T, error: null, count: totalCount };
      }

      if (this.operation === "insert" || this.operation === "upsert") {
        const record = Array.isArray(this.valuesPayload) ? this.valuesPayload[0] : this.valuesPayload;
        if (!record || typeof record !== "object") {
          return { data: null, error: { message: "Insert payload is required" } };
        }

        const keys = Object.keys(record).filter((k) => record[k] !== undefined);
        const colNames = keys.map((k) => sanitizeColumn(k));
        const valPlaceholders = keys.map((k) => this.prepareValue(k, record[k]).placeholder(nextParam));

        let conflictSql = "";
        if (this.operation === "upsert" && this.conflictTarget) {
          const conflictCols = this.conflictTarget
            .split(",")
            .map((c) => sanitizeColumn(c))
            .join(", ");
          const updateAssignments = keys
            .filter((k) => k !== this.conflictTarget)
            .map((k) => `${sanitizeColumn(k)} = EXCLUDED.${sanitizeColumn(k)}`);
          conflictSql =
            updateAssignments.length > 0
              ? ` ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateAssignments.join(", ")}`
              : ` ON CONFLICT (${conflictCols}) DO NOTHING`;
        }

        const returningCols = this.hasReturningSelect ? sanitizeSelectList(this.selectColumns) : "*";
        const sqlText = `INSERT INTO ${tableSql} (${colNames.join(", ")}) VALUES (${valPlaceholders.join(", ")})${conflictSql} RETURNING ${returningCols}`;
        const rows = await rawQuery<Record<string, unknown>>(sqlText, params);

        if (this.rowMode === "single" || this.rowMode === "maybeSingle") {
          return { data: (rows[0] ?? null) as unknown as T, error: null };
        }
        return { data: rows as unknown as T, error: null };
      }

      if (this.operation === "update") {
        const record = this.valuesPayload as Record<string, unknown> | null;
        if (!record || typeof record !== "object") {
          return { data: null, error: { message: "Update payload is required" } };
        }

        const keys = Object.keys(record).filter((k) => record[k] !== undefined);
        if (keys.length === 0) {
          return { data: null, error: { message: "No fields to update" } };
        }

        const assignments = keys.map(
          (k) => `${sanitizeColumn(k)} = ${this.prepareValue(k, record[k]).placeholder(nextParam)}`
        );
        const whereSql = this.buildWhereSql(nextParam);
        const returningCols = this.hasReturningSelect ? sanitizeSelectList(this.selectColumns) : "*";
        const sqlText = `UPDATE ${tableSql} SET ${assignments.join(", ")}${whereSql} RETURNING ${returningCols}`;
        const rows = await rawQuery<Record<string, unknown>>(sqlText, params);

        if (this.rowMode === "single") {
          if (rows.length === 0) {
            return { data: null, error: { message: "Row not found", code: "PGRST116" } };
          }
          return { data: rows[0] as unknown as T, error: null };
        }
        if (this.rowMode === "maybeSingle") {
          return { data: (rows[0] ?? null) as unknown as T, error: null };
        }
        return { data: rows as unknown as T, error: null };
      }

      if (this.operation === "delete") {
        const whereSql = this.buildWhereSql(nextParam);
        const sqlText = `DELETE FROM ${tableSql}${whereSql} RETURNING id`;
        const rows = await rawQuery<{ id: string }>(sqlText, params);
        return {
          data: (rows as unknown as T) ?? null,
          error: null,
          count: rows.length,
        };
      }

      return { data: null, error: { message: "Unsupported query operation" } };
    } catch (err) {
      return { data: null, error: toDbError(err), count: null };
    }
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// ---------------------------------------------------------------------------
// Password Hashing (Node crypto.scryptSync)
// ---------------------------------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = (stored || "").split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Native RFC 6238 TOTP MFA Helpers
// ---------------------------------------------------------------------------
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(byteLength = 20): string {
  const bytes = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function decodeBase32(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function generateHotp(secretBase32: string, counter: number): string {
  const key = decodeBase32(secretBase32);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotpCode(secretBase32: string, code: string, window = 1): boolean {
  const cleanCode = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanCode)) return false;
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let w = -window; w <= window; w++) {
    if (generateHotp(secretBase32, currentStep + w) === cleanCode) {
      return true;
    }
  }
  return false;
}

export function buildTotpQrSvgDataUri(email: string, secret: string): string {
  const otpauth = `otpauth://totp/LaunchPath:${encodeURIComponent(email)}?secret=${secret}&issuer=LaunchPath`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">
    <rect width="220" height="220" rx="20" fill="#ffffff"/>
    <rect x="16" y="16" width="52" height="52" rx="8" fill="none" stroke="#0f172a" stroke-width="6"/>
    <rect x="28" y="28" width="28" height="28" rx="4" fill="#0f172a"/>
    <rect x="152" y="16" width="52" height="52" rx="8" fill="none" stroke="#0f172a" stroke-width="6"/>
    <rect x="164" y="28" width="28" height="28" rx="4" fill="#0f172a"/>
    <rect x="16" y="152" width="52" height="52" rx="8" fill="none" stroke="#0f172a" stroke-width="6"/>
    <rect x="28" y="164" width="28" height="28" rx="4" fill="#0f172a"/>
    <rect x="84" y="84" width="52" height="52" rx="10" fill="#2563eb" opacity="0.12"/>
    <text x="110" y="106" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">TOTP KEY</text>
    <text x="110" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#2563eb">${secret.slice(0, 10)}…</text>
    <title>${otpauth}</title>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// User Row Conversion & Cookie Helpers
// ---------------------------------------------------------------------------
type DbUserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  user_metadata: Record<string, unknown> | null;
  app_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string;
};

export function rowToUser(row: DbUserRow): User {
  const role: UserRole =
    row.role === "superadmin" || row.role === "admin" ? row.role : "user";
  const appMeta = {
    ...(row.app_metadata || {}),
    role,
    ...(role === "superadmin" ? { plan: "team", is_superadmin: true } : {}),
  };
  const userMeta = {
    ...(row.user_metadata || {}),
    role,
  };
  return {
    id: row.id,
    email: row.email,
    role,
    aud: "authenticated",
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_metadata: userMeta,
    app_metadata: appMeta,
    identities: [{ id: row.id, user_id: row.id, provider: "email" }],
  };
}

export async function hasVerifiedMfaFactor(userId: string): Promise<boolean> {
  try {
    const rows = await rawQuery<{ id: string }>(
      `SELECT id FROM public.user_mfa_factors WHERE user_id = $1 AND status = 'verified' LIMIT 1`,
      [userId]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function writeSessionCookie(
  user: User,
  options?: { aal?: "aal1" | "aal2"; nextAal?: "aal1" | "aal2" }
) {
  const mfaEnabled =
    options?.nextAal !== undefined ? options.nextAal === "aal2" : await hasVerifiedMfaFactor(user.id);
  const aal = options?.aal ?? "aal1";
  const nextAal = mfaEnabled ? "aal2" : "aal1";

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    aal,
    nextAal,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
    created_at: user.created_at,
  });

  try {
    const store = await cookies();
    store.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
  } catch {
    // Ignored when called outside a mutable cookie context
  }

  return { token, aal, nextAal };
}

export async function clearSessionCookie() {
  try {
    const store = await cookies();
    store.delete(SESSION_COOKIE_NAME);
  } catch {
    // ignore
  }
}

export async function readCurrentSessionPayload(): Promise<SessionTokenPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Server Neon Client (Drop-in replacement for Server + Admin clients)
// ---------------------------------------------------------------------------
export function createNeonServerClient() {
  return {
    from<T = Record<string, unknown>>(table: string) {
      return new NeonQueryBuilder<T>(table);
    },
    auth: {
      async getUser(): Promise<{ data: { user: User | null }; error: DbError | null }> {
        const payload = await readCurrentSessionPayload();
        if (!payload) {
          return { data: { user: null }, error: { message: "Not authenticated" } };
        }

        // Fetch fresh user from Neon DB if available, falling back to signed JWT claims
        try {
          const rows = await rawQuery<DbUserRow>(
            `SELECT id, email, password_hash, role, user_metadata, app_metadata, created_at, updated_at
             FROM public.users WHERE id = $1 LIMIT 1`,
            [payload.sub]
          );
          if (rows[0]) {
            return { data: { user: rowToUser(rows[0]) }, error: null };
          }
        } catch {
          // Fallback to signed token user if DB is transiently unreachable
        }

        return { data: { user: payloadToUser(payload) }, error: null };
      },

      async getSession() {
        const payload = await readCurrentSessionPayload();
        if (!payload) {
          return { data: { session: null }, error: null };
        }
        const user = payloadToUser(payload);
        return {
          data: {
            session: {
              user,
              aal: payload.aal,
              nextAal: payload.nextAal,
              expires_at: payload.exp,
            },
          },
          error: null,
        };
      },

      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const normalizedEmail = email.trim().toLowerCase();
        try {
          const rows = await rawQuery<DbUserRow>(
            `SELECT id, email, password_hash, role, user_metadata, app_metadata, created_at, updated_at
             FROM public.users WHERE lower(email) = $1 LIMIT 1`,
            [normalizedEmail]
          );
          const row = rows[0];
          if (!row || !verifyPassword(password, row.password_hash)) {
            return {
              data: { user: null, session: null },
              error: { message: "Invalid email or password" },
            };
          }

          const user = rowToUser(row);
          const mfaEnabled = await hasVerifiedMfaFactor(user.id);
          const { token, aal, nextAal } = await writeSessionCookie(user, {
            aal: "aal1",
            nextAal: mfaEnabled ? "aal2" : "aal1",
          });

          return {
            data: {
              user,
              session: { access_token: token, user, aal, nextAal },
            },
            error: null,
          };
        } catch (err) {
          return {
            data: { user: null, session: null },
            error: toDbError(err),
          };
        }
      },

      async signUp({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown>; emailRedirectTo?: string };
      }) {
        const normalizedEmail = email.trim().toLowerCase();
        try {
          const existing = await rawQuery<{ id: string }>(
            `SELECT id FROM public.users WHERE lower(email) = $1 LIMIT 1`,
            [normalizedEmail]
          );
          if (existing.length > 0) {
            return {
              data: { user: null, session: null },
              error: { message: "An account with this email already exists" },
            };
          }

          const passwordHash = hashPassword(password);
          const isSuperadminEmail = normalizedEmail === "demolablaze@gmail.com";
          const role: UserRole = isSuperadminEmail ? "superadmin" : "user";
          const userMeta = {
            ...(options?.data || {}),
            role,
          };
          const appMeta = isSuperadminEmail
            ? { role: "superadmin", plan: "team", is_superadmin: true }
            : { role: "user", plan: "starter" };

          const rows = await rawQuery<DbUserRow>(
            `INSERT INTO public.users (email, password_hash, role, user_metadata, app_metadata)
             VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
             RETURNING id, email, password_hash, role, user_metadata, app_metadata, created_at, updated_at`,
            [
              normalizedEmail,
              passwordHash,
              role,
              JSON.stringify(userMeta),
              JSON.stringify(appMeta),
            ]
          );

          const user = rowToUser(rows[0]);
          const { token, aal, nextAal } = await writeSessionCookie(user, {
            aal: "aal1",
            nextAal: "aal1",
          });

          return {
            data: {
              user,
              session: { access_token: token, user, aal, nextAal },
            },
            error: null,
          };
        } catch (err) {
          return {
            data: { user: null, session: null },
            error: toDbError(err),
          };
        }
      },

      async signOut(): Promise<{ error: DbError | null }> {
        await clearSessionCookie();
        return { error: null };
      },

      async updateUser({ password, data }: { password?: string; data?: Record<string, unknown> }) {
        const payload = await readCurrentSessionPayload();
        if (!payload) {
          return { data: { user: null }, error: { message: "Unauthorized" } };
        }

        try {
          if (password) {
            const passwordHash = hashPassword(password);
            await rawQuery(
              `UPDATE public.users SET password_hash = $1, updated_at = now() WHERE id = $2`,
              [passwordHash, payload.sub]
            );
          }
          if (data && Object.keys(data).length > 0) {
            await rawQuery(
              `UPDATE public.users SET user_metadata = COALESCE(user_metadata, '{}'::jsonb) || $1::jsonb, updated_at = now() WHERE id = $2`,
              [JSON.stringify(data), payload.sub]
            );
          }

          const rows = await rawQuery<DbUserRow>(
            `SELECT id, email, password_hash, role, user_metadata, app_metadata, created_at, updated_at
             FROM public.users WHERE id = $1 LIMIT 1`,
            [payload.sub]
          );
          const updatedUser = rows[0] ? rowToUser(rows[0]) : payloadToUser(payload);
          await writeSessionCookie(updatedUser, { aal: payload.aal, nextAal: payload.nextAal });
          return { data: { user: updatedUser }, error: null };
        } catch (err) {
          return { data: { user: null }, error: toDbError(err) };
        }
      },

      mfa: {
        async getAuthenticatorAssuranceLevel() {
          const payload = await readCurrentSessionPayload();
          if (!payload) {
            return { data: null, error: { message: "Not authenticated" } };
          }
          return {
            data: {
              currentLevel: payload.aal,
              nextLevel: payload.nextAal,
            },
            error: null,
          };
        },

        async listFactors() {
          const payload = await readCurrentSessionPayload();
          if (!payload) {
            return { data: { totp: [] }, error: { message: "Not authenticated" } };
          }
          try {
            const rows = await rawQuery<{
              id: string;
              friendly_name: string | null;
              factor_type: string;
              status: "verified" | "unverified";
              created_at: string;
            }>(
              `SELECT id, friendly_name, factor_type, status, created_at
               FROM public.user_mfa_factors
               WHERE user_id = $1
               ORDER BY created_at DESC`,
              [payload.sub]
            );
            return { data: { totp: rows }, error: null };
          } catch (err) {
            return { data: { totp: [] }, error: toDbError(err) };
          }
        },

        async enroll({
          factorType = "totp",
          friendlyName = "Authenticator app",
        }: {
          factorType?: string;
          friendlyName?: string;
        }) {
          const payload = await readCurrentSessionPayload();
          if (!payload) {
            return { data: null, error: { message: "Not authenticated" } };
          }
          try {
            const secret = generateTotpSecret();
            const rows = await rawQuery<{ id: string }>(
              `INSERT INTO public.user_mfa_factors (user_id, friendly_name, factor_type, secret, status)
               VALUES ($1, $2, $3, $4, 'unverified')
               RETURNING id`,
              [payload.sub, friendlyName, factorType, secret]
            );
            const factorId = rows[0]?.id;
            return {
              data: {
                id: factorId,
                type: factorType,
                totp: {
                  qr_code: buildTotpQrSvgDataUri(payload.email, secret),
                  secret,
                },
              },
              error: null,
            };
          } catch (err) {
            return { data: null, error: toDbError(err) };
          }
        },

        async challengeAndVerify({ factorId, code }: { factorId: string; code: string }) {
          const payload = await readCurrentSessionPayload();
          if (!payload) {
            return { data: null, error: { message: "Not authenticated" } };
          }
          try {
            const rows = await rawQuery<{ id: string; secret: string; status: string }>(
              `SELECT id, secret, status FROM public.user_mfa_factors WHERE id = $1 AND user_id = $2 LIMIT 1`,
              [factorId, payload.sub]
            );
            const factor = rows[0];
            if (!factor) {
              return { data: null, error: { message: "Authenticator factor not found" } };
            }
            if (!verifyTotpCode(factor.secret, code)) {
              return { data: null, error: { message: "Invalid verification code" } };
            }

            await rawQuery(
              `UPDATE public.user_mfa_factors SET status = 'verified', updated_at = now() WHERE id = $1`,
              [factor.id]
            );

            const user = payloadToUser(payload);
            await writeSessionCookie(user, { aal: "aal2", nextAal: "aal2" });
            return { data: { verified: true }, error: null };
          } catch (err) {
            return { data: null, error: toDbError(err) };
          }
        },

        async unenroll({ factorId }: { factorId: string }) {
          const payload = await readCurrentSessionPayload();
          if (!payload) {
            return { data: null, error: { message: "Not authenticated" } };
          }
          try {
            await rawQuery(
              `DELETE FROM public.user_mfa_factors WHERE id = $1 AND user_id = $2`,
              [factorId, payload.sub]
            );
            const stillHasMfa = await hasVerifiedMfaFactor(payload.sub);
            const user = payloadToUser(payload);
            await writeSessionCookie(user, {
              aal: stillHasMfa ? payload.aal : "aal1",
              nextAal: stillHasMfa ? "aal2" : "aal1",
            });
            return { data: { id: factorId }, error: null };
          } catch (err) {
            return { data: null, error: toDbError(err) };
          }
        },
      },

      admin: {
        async getUserById(userId: string) {
          try {
            const rows = await rawQuery<DbUserRow>(
              `SELECT id, email, password_hash, role, user_metadata, app_metadata, created_at, updated_at
               FROM public.users WHERE id = $1 LIMIT 1`,
              [userId]
            );
            if (!rows[0]) {
              return { data: { user: null }, error: { message: "User not found" } };
            }
            return { data: { user: rowToUser(rows[0]) }, error: null };
          } catch (err) {
            return { data: { user: null }, error: toDbError(err) };
          }
        },

        async updateUserById(
          userId: string,
          attrs: {
            app_metadata?: Record<string, unknown>;
            user_metadata?: Record<string, unknown>;
            role?: UserRole;
          }
        ) {
          try {
            if (attrs.app_metadata) {
              await rawQuery(
                `UPDATE public.users SET app_metadata = COALESCE(app_metadata, '{}'::jsonb) || $1::jsonb, updated_at = now() WHERE id = $2`,
                [JSON.stringify(attrs.app_metadata), userId]
              );
            }
            if (attrs.user_metadata) {
              await rawQuery(
                `UPDATE public.users SET user_metadata = COALESCE(user_metadata, '{}'::jsonb) || $1::jsonb, updated_at = now() WHERE id = $2`,
                [JSON.stringify(attrs.user_metadata), userId]
              );
            }
            if (attrs.role) {
              await rawQuery(
                `UPDATE public.users SET role = $1, updated_at = now() WHERE id = $2`,
                [attrs.role, userId]
              );
            }
            const rows = await rawQuery<DbUserRow>(
              `SELECT id, email, password_hash, role, user_metadata, app_metadata, created_at, updated_at
               FROM public.users WHERE id = $1 LIMIT 1`,
              [userId]
            );
            return { data: { user: rows[0] ? rowToUser(rows[0]) : null }, error: null };
          } catch (err) {
            return { data: { user: null }, error: toDbError(err) };
          }
        },
      },
    },
  };
}

export type NeonServerClient = ReturnType<typeof createNeonServerClient>;
