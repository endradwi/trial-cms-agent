import type { SlotTime } from './types';

export function isWeekend(dateStr: string): boolean {
  // dateStr is 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

export function getExpectedSlots(category: string, dateStr: string): SlotTime[] {
  const weekend = isWeekend(dateStr);

  switch (category) {
    case 'clipper_us':
      return weekend ? ['pagi', 'malam'] : ['malam'];
    case 'clipper_indo':
      return ['siang', 'sore', 'malam'];
    case 'affiliate':
      return ['siang', 'malam'];
    default:
      return ['malam'];
  }
}

export function getSlotLabel(slot: SlotTime): { label: string; time: string; icon: string } {
  switch (slot) {
    case 'pagi':
      return { label: 'Pagi', time: '06:30 - 10:00 WIB', icon: '🌅' };
    case 'siang':
      return { label: 'Siang', time: '12:00 - 13:00 WIB', icon: '☀️' };
    case 'sore':
      return { label: 'Sore', time: '17:00 - 17:30 WIB', icon: '🌇' };
    case 'malam':
      return { label: 'Malam', time: '20:00 - 21:30 WIB', icon: '🌙' };
  }
}

export function getStatusStyle(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'SUBMITTED':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', label: 'Bounty Submitted' };
    case 'UPLOADED':
      return { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', label: 'Video Uploaded' };
    case 'READY':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Ready to Upload' };
    case 'ON_HOLD':
      return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', label: 'On Hold' };
    case 'OFF':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Off / Rest' };
    case 'DRAFT':
    default:
      return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', label: 'Draft / Belum' };
  }
}

export function totalSlotsForChannel(channel: { category: string }, dateStr: string): number {
  return getExpectedSlots(channel.category, dateStr).length;
}

export function calculateLiveProgress(
  channels: Array<{ id: string; category: string; bounty_platform?: string | null }>,
  logs: Array<{ channel_id: string; slot: string; status: string }>,
  dateStr: string
) {
  let totalSlots = 0;
  let completedSlots = 0;
  let bountySubmitted = 0;

  for (const ch of channels) {
    const slots = getExpectedSlots(ch.category, dateStr);
    const chLogs = logs.filter((l) => l.channel_id === ch.id);
    const isBounty = !!ch.bounty_platform && ch.bounty_platform !== 'Internal' && ch.category === 'clipper_us';

    for (const slot of slots) {
      const st = chLogs.find((l) => l.slot === slot)?.status;
      if (st === 'OFF') continue;
      totalSlots++;
      if (st === 'UPLOADED' || st === 'SUBMITTED') completedSlots++;
      if (isBounty && st === 'SUBMITTED') bountySubmitted++;
    }
  }

  const percentage = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;
  return { totalSlots, completedSlots, percentage, bountySubmitted };
}
