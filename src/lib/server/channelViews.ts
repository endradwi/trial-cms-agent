import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export interface ChannelVideoStat {
  id: string;
  title: string;
  views: string;
}

export interface ChannelViewSummary {
  handle: string;
  videos: ChannelVideoStat[];
  latestVideo?: ChannelVideoStat;
  latestViewsText: string;
  totalViewsCount: number;
}

function parseViewsString(str: string): number {
  if (!str) return 0;
  const clean = str.toLowerCase().replace('views', '').replace('view', '').trim();
  if (clean.includes('k')) {
    return Math.round(parseFloat(clean.replace('k', '')) * 1000);
  }
  if (clean.includes('m')) {
    return Math.round(parseFloat(clean.replace('m', '')) * 1000000);
  }
  const num = parseInt(clean.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

export async function getLiveChannelViews(): Promise<Record<string, ChannelViewSummary>> {
  const filePath = '/tmp/all_channels_data.json';
  const summaries: Record<string, ChannelViewSummary> = {};

  if (!existsSync(filePath)) {
    return summaries;
  }

  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);

    for (const [handle, vids] of Object.entries(data)) {
      if (Array.isArray(vids) && vids.length > 0) {
        const validVids = vids.filter((v: any) => v && v.id && v.views);
        const latest = validVids[0];
        let totalViews = 0;
        for (const v of validVids) {
          totalViews += parseViewsString(v.views);
        }

        summaries[handle] = {
          handle,
          videos: validVids,
          latestVideo: latest,
          latestViewsText: latest ? latest.views : '0 views',
          totalViewsCount: totalViews
        };
      }
    }
  } catch (err) {
    console.error('Error reading live channel views:', err);
  }

  return summaries;
}
