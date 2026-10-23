// Run: bun test
import { expect, test } from 'bun:test';
import { getExpectedSlots } from '../src/lib/slots';
import { slotUpdateSchema } from '../src/lib/schemas';

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
