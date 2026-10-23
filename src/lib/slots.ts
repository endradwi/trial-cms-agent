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
      return { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-600', label: 'Bounty Submitted' };
    case 'UPLOADED':
      return { bg: 'bg-teal-950/80', text: 'text-teal-300', border: 'border-teal-500', label: 'Video Uploaded' };
    case 'READY':
      return { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-600', label: 'Ready to Upload' };
    case 'ON_HOLD':
      return { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-600', label: 'On Hold' };
    case 'OFF':
      return { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-700', label: 'Off / Rest' };
    case 'DRAFT':
    default:
      return { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-600', label: 'Draft / Belum' };
  }
}
