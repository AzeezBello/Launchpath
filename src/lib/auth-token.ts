export const SESSION_COOKIE_NAME = "launchpath_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14; // 14 days

export type UserRole = "user" | "admin" | "superadmin";

export type AuthIdentity = {
  id: string;
  user_id: string;
  provider: string;
};

export type User = {
  id: string;
  email: string;
  role: UserRole;
  aud: string;
  created_at: string;
  updated_at?: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  identities?: AuthIdentity[];
};

export type SessionTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  aal: "aal1" | "aal2";
  nextAal: "aal1" | "aal2";
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  created_at: string;
  iat: number;
  exp: number;
};

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.ENCRYPTION_KEY ||
    process.env.DATABASE_URL ||
    "launchpath-neon-default-secret-key-2026"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(getAuthSecret());
  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(
  input: Omit<SessionTokenPayload, "iat" | "exp">,
  maxAgeSeconds = SESSION_DURATION_SECONDS
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    ...input,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const encoder = new TextEncoder();
  const headerB64 = toBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  const signatureB64 = toBase64Url(new Uint8Array(signatureBuffer));

  return `${signingInput}.${signatureB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionTokenPayload | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const encoder = new TextEncoder();
    const key = await getHmacKey();
    const signingInput = `${headerB64}.${payloadB64}`;
    const signatureBytes = fromBase64Url(signatureB64);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      encoder.encode(signingInput)
    );
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadB64));
    const payload = JSON.parse(payloadJson) as SessionTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub || !payload.email || typeof payload.exp !== "number" || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function payloadToUser(payload: SessionTokenPayload): User {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role || "user",
    aud: "authenticated",
    created_at: payload.created_at,
    user_metadata: payload.user_metadata || {},
    app_metadata: payload.app_metadata || {},
    identities: [{ id: payload.sub, user_id: payload.sub, provider: "email" }],
  };
}
