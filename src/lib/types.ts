export interface Channel {
  id: string;
  slug: string;
  name: string;
  handle?: string;
  platform: 'youtube_shorts' | 'tiktok' | 'pinterest';
  category: 'clipper_us' | 'clipper_indo' | 'affiliate';
  niche: string;
  target_daily_quota: number;
  bounty_platform?: string;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export type SlotTime = 'pagi' | 'siang' | 'sore' | 'malam';
export type ContentStatus = 'DRAFT' | 'READY' | 'UPLOADED' | 'SUBMITTED' | 'ON_HOLD' | 'OFF';

export interface ContentLog {
  id: string;
  channel_id: string;
  date: string; // YYYY-MM-DD
  slot: SlotTime;
  video_title?: string;
  video_url?: string;
  drive_url?: string;
  bounty_submission_url?: string;
  status: ContentStatus;
  views_count: number;
  pic_name: string;
  notes?: string;
  updated_at?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  channel_slug?: string;
  details?: string;
  created_at: string;
}

export interface ChannelCardData {
  channel: Channel;
  logs: ContentLog[];
  completedCount: number;
  isAllCompleted: boolean;
}
