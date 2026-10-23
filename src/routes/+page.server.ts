import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { supabase } from '#lib/server/supabase.js';
import { sendTelegramOpsAlert } from '#lib/server/telegram.js';
import { slotUpdateSchema } from '#lib/schemas.js';
import type { ActivityLog, Channel, ContentLog } from '#lib/types.js';

const jakartaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const load: PageServerLoad = async ({ url }) => {
  const param = url.searchParams.get('date');
  const selectedDate = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : jakartaToday();

  const [ch, logs, activity] = await Promise.all([
    supabase.from('channels').select('*').eq('active', true).order('sort_order'),
    supabase.from('content_logs').select('*').eq('date', selectedDate),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(15)
  ]);

  const error = ch.error?.message || logs.error?.message || activity.error?.message || null;
  if (error) console.error('Supabase load error:', error);

  return {
    selectedDate,
    today: jakartaToday(),
    channels: (ch.data ?? []) as Channel[],
    logs: (logs.data ?? []) as ContentLog[],
    activity: (activity.data ?? []) as ActivityLog[],
    error
  };
};

export const actions: Actions = {
  updateSlot: async ({ request }) => {
    const parsed = slotUpdateSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) {
      return fail(400, { error: parsed.error.issues.map((i: { path: PropertyKey[]; message: string }) => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }
    const input = parsed.data;

    // Channel name/handle come from DB, never from the client.
    const { data: channel, error: chErr } = await supabase
      .from('channels')
      .select('name, handle, slug')
      .eq('id', input.channel_id)
      .single();
    if (chErr || !channel) return fail(404, { error: 'Channel tidak ditemukan' });

    const { data: prev } = await supabase
      .from('content_logs')
      .select('status')
      .match({ channel_id: input.channel_id, date: input.date, slot: input.slot })
      .maybeSingle();

    const { error } = await supabase
      .from('content_logs')
      .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: 'channel_id,date,slot' });
    if (error) return fail(500, { error: error.message });

    await supabase.from('activity_logs').insert({
      actor: input.pic_name,
      action: `${input.slot.toUpperCase()} → ${input.status}`,
      channel_slug: channel.slug,
      details: input.video_title || input.video_url
    });

    // Alert only on transition into a live status, so re-saving doesn't spam.
    const live = ['UPLOADED', 'SUBMITTED'];
    let alerted = false;
    if (live.includes(input.status) && prev?.status !== input.status) {
      alerted = await sendTelegramOpsAlert({
        channelName: channel.name,
        handle: channel.handle,
        slot: input.slot,
        status: input.status,
        videoTitle: input.video_title,
        videoUrl: input.video_url,
        bountyUrl: input.bounty_submission_url,
        picName: input.pic_name
      });
    }

    return { success: true, alerted };
  }
};
