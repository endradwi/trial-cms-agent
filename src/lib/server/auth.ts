import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'agency_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Read lazily so build-time analysis never needs the secrets.
// Fail closed: if either env is missing, nobody can log in.
const env = () => ({
  passcode: process.env.AGENCY_PASSCODE?.trim() || '',
  secret: process.env.SESSION_SECRET || ''
});

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

// Token is bound to the passcode: rotating AGENCY_PASSCODE revokes every session.
export function createSessionToken(): string | null {
  const { passcode, secret } = env();
  if (!passcode || !secret) return null;
  return createHmac('sha256', secret).update(passcode).digest('hex');
}

export function verifySessionToken(token?: string): boolean {
  const expected = createSessionToken();
  return !!token && !!expected && safeEqual(token, expected);
}

export function verifyPasscode(input: string): boolean {
  const { passcode } = env();
  return !!passcode && !!input && safeEqual(input.trim(), passcode);
}

// ponytail: in-memory per-IP limiter, resets on container restart; move to Redis if we run >1 replica.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function isRateLimited(ip: string, now = Date.now()): boolean {
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) return false;
  return rec.count >= MAX_ATTEMPTS;
}

export function recordFailure(ip: string, now = Date.now()): void {
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else rec.count++;
}

export function clearFailures(ip: string): void {
  attempts.delete(ip);
}
