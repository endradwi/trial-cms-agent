import type { PageServerLoad, Actions } from './$types';
import { supabase } from '#lib/supabase';
import { sendTelegramOpsAlert } from '#lib/telegram';
import type { Channel, ContentLog } from '#lib/types';
import { fail } from '@sveltejs/kit';

function getJakartaDate(): string {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const jakarta = new Date(utc + (3600000 * 7));
  return jakarta.toISOString().split('T')[0];
}

export const load: PageServerLoad = async ({ url }) => {
  const selectedDate = url.searchParams.get('date') || getJakartaDate();

  try {
    // 1. Fetch channels ordered by sort_order
    const { data: channels, error: chErr } = await supabase
      .from('channels')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (chErr) {
      console.error('Failed to load channels:', chErr);
    }

    // 2. Fetch content logs for selected date
    const { data: logs, error: logErr } = await supabase
      .from('content_logs')
      .select('*')
      .eq('date', selectedDate);

    if (logErr) {
      console.error('Failed to load logs:', logErr);
    }

    return {
      selectedDate,
      channels: (channels as Channel[]) || [],
      logs: (logs as ContentLog[]) || [],
      dbReady: !chErr && !logErr
    };
  } catch (err: any) {
    return {
      selectedDate,
      channels: [],
      logs: [],
      dbReady: false,
      error: err.message
    };
  }
};

export const actions: Actions = {
  updateSlot: async ({ request }) => {
    const formData = await request.formData();
    const channelId = formData.get('channel_id') as string;
    const date = formData.get('date') as string;
    const slot = formData.get('slot') as string;
    const status = (formData.get('status') as string) || 'DRAFT';
    const videoTitle = (formData.get('video_title') as string) || '';
    const videoUrl = (formData.get('video_url') as string) || '';
    const bountyUrl = (formData.get('bounty_submission_url') as string) || '';
    const driveUrl = (formData.get('drive_url') as string) || '';
    const picName = (formData.get('pic_name') as string) || 'Tim';
    const notes = (formData.get('notes') as string) || '';
    const channelName = (formData.get('channel_name') as string) || 'Channel';
    const handle = (formData.get('handle') as string) || '';

    if (!channelId || !date || !slot) {
      return fail(400, { error: 'Channel ID, tanggal, dan slot wajib diisi' });
    }

    try {
      const { data, error } = await supabase
        .from('content_logs')
        .upsert(
          {
            channel_id: channelId,
            date,
            slot,
            status,
            video_title: videoTitle.trim() || null,
            video_url: videoUrl.trim() || null,
            bounty_submission_url: bountyUrl.trim() || null,
            drive_url: driveUrl.trim() || null,
            pic_name: picName.trim() || 'Tim',
            notes: notes.trim() || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'channel_id,date,slot' }
        )
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        return fail(500, { error: error.message });
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        actor: picName,
        action: `Update status ${slot.toUpperCase()} -> ${status}`,
        channel_slug: channelName,
        details: videoTitle || videoUrl || status
      });

      // Dispatch Telegram Alert if status is UPLOADED or SUBMITTED
      if (status === 'UPLOADED' || status === 'SUBMITTED') {
        await sendTelegramOpsAlert({
          channelName,
          handle,
          slot,
          status,
          videoTitle,
          videoUrl,
          bountyUrl,
          picName
        });
      }

      return { success: true, log: data };
    } catch (err: any) {
      return fail(500, { error: err.message });
    }
  }
};
