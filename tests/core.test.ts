// Run: bun test
import { expect, test } from 'bun:test';
import { getExpectedSlots } from '../src/lib/slots';
import { slotUpdateSchema } from '../src/lib/schemas';
import {
  verifyPasscode,
  createSessionToken,
  verifySessionToken,
  isRateLimited,
  recordFailure,
  clearFailures
} from '../src/lib/server/auth';

test('slot schedule follows SOP', () => {
  expect(getExpectedSlots('clipper_us', '2026-10-21')).toEqual(['malam']); // Wed
  expect(getExpectedSlots('clipper_us', '2026-10-24')).toEqual(['pagi', 'malam']); // Sat
  expect(getExpectedSlots('clipper_indo', '2026-10-24')).toEqual(['siang', 'sore', 'malam']);
  expect(getExpectedSlots('affiliate', '2026-10-24')).toEqual(['siang', 'malam']);
});

const base = { channel_id: crypto.randomUUID(), date: '2026-10-21', slot: 'malam', status: 'UPLOADED', video_title: '', video_url: '', bounty_submission_url: '', drive_url: '', pic_name: '', notes: '' };

test('schema accepts valid input and normalizes blanks', () => {
  const r = slotUpdateSchema.parse({ ...base, video_url: ' https://youtube.com/shorts/x ' });
  expect(r.video_url).toBe('https://youtube.com/shorts/x');
  expect(r.video_title).toBeNull();
  expect(r.pic_name).toBe('Tim');
});

test('schema rejects bad input', () => {
  expect(slotUpdateSchema.safeParse({ ...base, video_url: 'javascript:alert(1)' }).success).toBe(false);
  expect(slotUpdateSchema.safeParse({ ...base, status: 'HACKED' }).success).toBe(false);
  expect(slotUpdateSchema.safeParse({ ...base, channel_id: '1' }).success).toBe(false);
  expect(slotUpdateSchema.safeParse({ ...base, slot: 'tengah_malam' }).success).toBe(false);
});

test('auth fails closed when env missing', () => {
  // Without AGENCY_PASSCODE set, verifyPasscode and createSessionToken must be null/false
  expect(verifyPasscode('anything')).toBe(false);
  expect(createSessionToken()).toBeNull();
  expect(verifySessionToken('invalid')).toBe(false);
});

test('auth succeeds when env configured', () => {
  process.env.AGENCY_PASSCODE = 'secretPass123';
  process.env.SESSION_SECRET = 'randomSaltKey456';

  expect(verifyPasscode('secretPass123')).toBe(true);
  expect(verifyPasscode('wrong')).toBe(false);
  expect(verifyPasscode('')).toBe(false);

  const token = createSessionToken();
  expect(typeof token).toBe('string');
  expect(token!.length).toBe(64); // SHA-256 hex string

  expect(verifySessionToken(token!)).toBe(true);
  expect(verifySessionToken('tamperedToken')).toBe(false);
  expect(verifySessionToken(undefined)).toBe(false);

  // Rotating passcode invalidates previous session tokens
  process.env.AGENCY_PASSCODE = 'newPasscode789';
  expect(verifySessionToken(token!)).toBe(false);
});

test('rate limiter blocks after 5 failures and resets on clear', () => {
  const testIp = '192.0.2.42';
  clearFailures(testIp);

  expect(isRateLimited(testIp)).toBe(false);
  for (let i = 0; i < 4; i++) {
    recordFailure(testIp);
    expect(isRateLimited(testIp)).toBe(false);
  }
  recordFailure(testIp); // 5th failure
  expect(isRateLimited(testIp)).toBe(true);

  clearFailures(testIp);
  expect(isRateLimited(testIp)).toBe(false);
});
