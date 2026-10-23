import { TELEGRAM_ALERT_BOT_TOKEN, TELEGRAM_ALERT_CHAT_ID } from '$app/env/private';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface OpsAlert {
  channelName: string;
  handle?: string | null;
  slot: string;
  status: string;
  videoTitle?: string | null;
  videoUrl?: string | null;
  bountyUrl?: string | null;
  picName: string;
}

export function formatOpsAlert(p: OpsAlert): string {
  const time = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });
  const icon = p.status === 'SUBMITTED' ? '🚀' : '✅';
  const link = (u: string) => `<a href="${esc(u)}">${esc(u)}</a>`;
  return [
    `<b>${icon} [OPS] ${esc(p.channelName)} — ${esc(p.status)}</b>`,
    '',
    `📺 ${esc(p.handle || '-')} • ${esc(p.slot.toUpperCase())} (${time} WIB)`,
    p.videoTitle && `🎬 ${esc(p.videoTitle)}`,
    p.videoUrl && `🔗 ${link(p.videoUrl)}`,
    p.bountyUrl && `🎯 ${link(p.bountyUrl)}`,
    `👤 PIC: ${esc(p.picName)}`
  ].filter(Boolean).join('\n');
}

/** Never throws: alert failure must not block the DB write. */
export async function sendTelegramOpsAlert(p: OpsAlert): Promise<boolean> {
  const token = TELEGRAM_ALERT_BOT_TOKEN;
  const chatId = TELEGRAM_ALERT_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: formatOpsAlert(p), parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) console.warn('Telegram alert rejected:', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.warn('Telegram alert failed:', err);
    return false;
  }
}
