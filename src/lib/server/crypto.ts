import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = "enc:";

function getKey(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  // Derive a stable 32-byte key so ENCRYPTION_KEY can be any secret string
  // rather than requiring an exact hex/base64-encoded length.
  return createHash("sha256").update(raw).digest();
}

// Encrypts a secret for storage. Returns the input unchanged (no `enc:`
// prefix) when empty or when ENCRYPTION_KEY isn't configured, so behavior
// degrades gracefully to today's plaintext storage rather than breaking.
export function encryptSecret(plain: string | undefined): string {
  if (!plain) return plain || "";
  const key = getKey();
  if (!key) return plain;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return PREFIX + Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

// Decrypts a value produced by encryptSecret. Values without the `enc:`
// prefix are passed through as-is (plaintext — either never encrypted, or
// written while ENCRYPTION_KEY was unset). If the value is encrypted but the
// key is missing/wrong, returns "" rather than leaking ciphertext to the client.
export function decryptSecret(value: string | undefined): string {
  if (!value) return value || "";
  if (!value.startsWith(PREFIX)) return value;

  const key = getKey();
  if (!key) return "";

  try {
    const raw = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}
