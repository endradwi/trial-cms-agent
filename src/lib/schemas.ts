import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .transform((v) => v || null)
  .refine((v) => v === null || /^https?:\/\//i.test(v), 'URL harus diawali http:// atau https://');

const optionalText = (max: number) => z.string().trim().max(max).transform((v) => v || null);

export const slotUpdateSchema = z.object({
  channel_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD'),
  slot: z.enum(['pagi', 'siang', 'sore', 'malam']),
  status: z.enum(['DRAFT', 'READY', 'UPLOADED', 'SUBMITTED', 'ON_HOLD', 'OFF']),
  video_title: optionalText(200),
  video_url: optionalUrl,
  bounty_submission_url: optionalUrl,
  drive_url: optionalUrl,
  pic_name: z.string().trim().max(60).transform((v) => v || 'Tim'),
  notes: optionalText(500)
});

export type SlotUpdate = z.infer<typeof slotUpdateSchema>;
