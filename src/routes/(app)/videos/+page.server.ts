import type { PageServerLoad } from './$types';
import { supabase } from '#lib/server/supabase.js';
import { getLiveChannelViews, parseViewsString } from '#lib/server/channelViews.js';
import type { Channel } from '#lib/types.js';

export interface VideoVaultItem {
  id: string;
  title: string;
  views: string;
  viewsCount: number;
  channelName: string;
  channelHandle: string;
  channelSlug: string;
  category: string;
  bountyPlatform: string;
  url: string;
  thumbnailUrl: string;
  source: 'youtube_live' | 'sop_log';
  publishedAt?: string;
}

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent();
  const channels = (parentData.channels ?? []) as Channel[];
  const views = (parentData.channelViews ?? (await getLiveChannelViews())) as Record<string, any>;

  // Fetch all content_logs from Supabase
  const { data: logs } = await supabase.from('content_logs').select('*').order('date', { ascending: false });

  const videoMap = new Map<string, VideoVaultItem>();

  // 1. Ingest YouTube live scraped videos
  for (const ch of channels) {
    const stat = (ch.handle ? views[ch.handle] : undefined) ?? views['@' + ch.slug] ?? views[ch.slug];
    if (stat?.videos) {
      for (const v of stat.videos) {
        if (!v.id) continue;
        const viewsCount = v.viewsCount || parseViewsString(v.views);
        videoMap.set(v.id, {
          id: v.id,
          title: v.title || `${ch.name} Shorts`,
          views: v.views || '0 views',
          viewsCount,
          channelName: ch.name,
          channelHandle: ch.handle || `@${ch.slug}`,
          channelSlug: ch.slug,
          category: ch.category || 'clipper_us',
          bountyPlatform: ch.bounty_platform || 'Internal',
          url: `https://www.youtube.com/shorts/${v.id}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          source: 'youtube_live'
        });
      }
    }
  }

  // 2. Ingest uploaded videos from SOP content_logs
  for (const log of logs || []) {
    if (log.video_url && (log.status === 'UPLOADED' || log.status === 'SUBMITTED')) {
      const match = log.video_url.match(/shorts\/([a-zA-Z0-9_-]+)/) || log.video_url.match(/v=([a-zA-Z0-9_-]+)/);
      const vidId = match ? match[1] : log.id;
      const ch = channels.find((c) => c.id === log.channel_id);
      if (!videoMap.has(vidId) && ch) {
        videoMap.set(vidId, {
          id: vidId,
          title: log.video_title || `${ch.name} Video`,
          views: 'Uploaded',
          viewsCount: 0,
          channelName: ch.name,
          channelHandle: ch.handle || `@${ch.slug}`,
          channelSlug: ch.slug,
          category: ch.category || 'clipper_us',
          bountyPlatform: ch.bounty_platform || 'Internal',
          url: log.video_url,
          thumbnailUrl: match ? `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg` : '',
          source: 'sop_log',
          publishedAt: log.date
        });
      }
    }
  }

  const allVideos = Array.from(videoMap.values());
  // Sort descending by views count by default
  allVideos.sort((a, b) => b.viewsCount - a.viewsCount);

  return {
    videos: allVideos,
    channels
  };
};
