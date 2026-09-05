import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal, dependency-free admin session tokens.
 *
 * There's a single admin account (no username), gated by the ADMIN_PASSWORD
 * env var. On successful login we issue a signed, expiring token the admin
 * dashboard stores and sends back as `Authorization: Bearer <token>`.
 *
 * This intentionally avoids adding jsonwebtoken/bcrypt as dependencies —
 * it's a small HMAC-signed payload using Node's built-in crypto module.
 * If you later add real multi-admin accounts, swap this out for a proper
 * auth library backed by a users table.
 */

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getTokenSecret(): string {
  const secret = process.env["ADMIN_TOKEN_SECRET"];
  if (!secret) {
    throw new Error(
      "ADMIN_TOKEN_SECRET environment variable is required but was not provided.",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getTokenSecret()).update(payload).digest("base64url");
}

export function checkAdminPassword(candidate: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required but was not provided.",
    );
  }

  const candidateBuf = Buffer.from(candidate);
  const expectedBuf = Buffer.from(expected);

  // timingSafeEqual throws if lengths differ, so pad to avoid leaking length info
  if (candidateBuf.length !== expectedBuf.length) {
    // Still do a dummy comparison so the failure path takes ~constant time
    timingSafeEqual(candidateBuf, candidateBuf);
    return false;
  }

  return timingSafeEqual(candidateBuf, expectedBuf);
}

export function issueAdminToken(): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `admin.${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [subject, expiresAtRaw, signature] = parts;
  if (subject !== "admin") return false;

  const expiresAt = Number(expiresAtRaw);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = sign(`${subject}.${expiresAtRaw}`);
  const sigBuf = Buffer.from(signature ?? "");
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(sigBuf, expectedBuf);
}
