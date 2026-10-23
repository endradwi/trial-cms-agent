export async function sendTelegramOpsAlert(params: {
  channelName: string;
  handle?: string;
  slot: string;
  status: string;
  videoTitle?: string;
  videoUrl?: string;
  bountyUrl?: string;
  picName: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_ALERT_BOT_TOKEN || '8836527555:***';
  const chatId = process.env.TELEGRAM_ALERT_CHAT_ID || '1575704919';

  if (!token || !chatId) return;

  const time = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
  const icon = params.status === 'SUBMITTED' ? '🚀' : (params.status === 'UPLOADED' ? '✅' : '📝');
  
  const text = `<b>${icon} [OPS CMS] STATUS UPDATE</b>\n\n` +
    `📺 <b>Channel:</b> ${params.channelName} (<code>${params.handle || '-'}</code>)\n` +
    `⏰ <b>Slot:</b> ${params.slot.toUpperCase()} (${time} WIB)\n` +
    `📊 <b>Status:</b> <code>${params.status}</code>\n` +
    (params.videoTitle ? `🎬 <b>Judul:</b> ${params.videoTitle}\n` : '') +
    (params.videoUrl ? `🔗 <b>Video:</b> <a href="${params.videoUrl}">${params.videoUrl}</a>\n` : '') +
    (params.bountyUrl ? `🎯 <b>Bounty Submission:</b> <a href="${params.bountyUrl}">${params.bountyUrl}</a>\n` : '') +
    `👤 <b>PIC:</b> ${params.picName || 'Tim'}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    console.warn('Failed to dispatch Telegram Ops notification:', err);
  }
}
