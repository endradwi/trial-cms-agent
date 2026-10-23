import { readFile, writeFile } from 'node:fs/promises';
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

const CHANNEL_TARGETS: Array<{ slug: string; handle: string; url: string }> = [
  { slug: 'optioncomedy', handle: '@optioncomedy', url: 'https://www.youtube.com/@optioncomedy/shorts' },
  { slug: 'optionspeak', handle: '@OptionSpeak-i7c', url: 'https://www.youtube.com/@OptionSpeak-i7c/shorts' },
  { slug: 'optionvideo', handle: '@optionvideo-u8y', url: 'https://www.youtube.com/@optionvideo-u8y/shorts' },
  { slug: 'optionfamily', handle: '@OptionFamily-p2g', url: 'https://www.youtube.com/@OptionFamily-p2g/shorts' },
  { slug: 'optionquest', handle: '@optionquest-k4y', url: 'https://www.youtube.com/@optionquest-k4y/shorts' },
  { slug: 'popframe', handle: '@thepopframe', url: 'https://www.youtube.com/@thepopframe/shorts' },
  { slug: 'optioncards', handle: '@optioncards', url: 'https://www.youtube.com/@optioncards-pulls/shorts' },
  { slug: 'optionmarket', handle: '@optionmarket5', url: 'https://www.youtube.com/@optionmarket-l6o/shorts' }
];

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

// In-memory cache
let cachedSummaries: Record<string, ChannelViewSummary> = {};
let lastFetchedTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function fetchLiveViewsFromYouTube(): Promise<Record<string, ChannelViewSummary>> {
  const summaries: Record<string, ChannelViewSummary> = {};
  const rawDiskExport: Record<string, ChannelVideoStat[]> = {};

  await Promise.allSettled(
    CHANNEL_TARGETS.map(async (target) => {
      try {
        const res = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        const html = await res.text();
        const match = html.match(/var ytInitialData = ({.*?});<\/script>/) || html.match(/window\["ytInitialData"\] = ({.*?});/);
        if (!match) return;

        const data = JSON.parse(match[1]);
        const tab = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer;
        const items = tab?.content?.richGridRenderer?.contents || [];
        const vids: ChannelVideoStat[] = [];

        for (const it of items) {
          const vm = it?.richItemRenderer?.content?.shortsLockupViewModel;
          if (vm) {
            const vidId = vm?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
            const title = vm?.overlayMetadata?.primaryText?.content || '';
            const views = vm?.overlayMetadata?.secondaryText?.content || '';
            if (vidId) {
              vids.push({ id: vidId, title, views });
            }
          }
        }

        if (vids.length > 0) {
          const latest = vids[0];
          let totalViews = 0;
          for (const v of vids) {
            totalViews += parseViewsString(v.views);
          }

          const summary: ChannelViewSummary = {
            handle: target.handle,
            videos: vids,
            latestVideo: latest,
            latestViewsText: latest.views || '0 views',
            totalViewsCount: totalViews
          };

          // Index by handle, slug, and @slug for versatile matching
          summaries[target.handle] = summary;
          summaries[target.slug] = summary;
          summaries[`@${target.slug}`] = summary;
          rawDiskExport[target.handle] = vids;
        }
      } catch (err) {
        console.error(`Error scraping ${target.handle}:`, err);
      }
    })
  );

  // Write snapshot to container /tmp if possible
  try {
    await writeFile('/tmp/all_channels_data.json', JSON.stringify(rawDiskExport, null, 2));
  } catch (err) {
    // ignore filesystem write errors
  }

  if (Object.keys(summaries).length > 0) {
    cachedSummaries = summaries;
    lastFetchedTime = Date.now();
  }

  return cachedSummaries;
}

export async function getLiveChannelViews(force = false): Promise<Record<string, ChannelViewSummary>> {
  const now = Date.now();

  // Return cache if still valid
  if (!force && Object.keys(cachedSummaries).length > 0 && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedSummaries;
  }

  // Check if file exists on disk
  if (!force && existsSync('/tmp/all_channels_data.json')) {
    try {
      const raw = await readFile('/tmp/all_channels_data.json', 'utf-8');
      const data = JSON.parse(raw);
      const fileSummaries: Record<string, ChannelViewSummary> = {};

      for (const [handle, vids] of Object.entries(data)) {
        if (Array.isArray(vids) && vids.length > 0) {
          const validVids = vids.filter((v: any) => v && v.id && v.views);
          const latest = validVids[0];
          let totalViews = 0;
          for (const v of validVids) {
            totalViews += parseViewsString(v.views);
          }

          const s: ChannelViewSummary = {
            handle,
            videos: validVids,
            latestVideo: latest,
            latestViewsText: latest ? latest.views : '0 views',
            totalViewsCount: totalViews
          };

          fileSummaries[handle] = s;
          const cleanKey = handle.replace('@', '').toLowerCase();
          fileSummaries[cleanKey] = s;
          fileSummaries[`@${cleanKey}`] = s;
        }
      }

      if (Object.keys(fileSummaries).length > 0) {
        cachedSummaries = fileSummaries;
        lastFetchedTime = now;
        return cachedSummaries;
      }
    } catch (err) {
      console.warn('Could not read disk views file, falling back to live fetch:', err);
    }
  }

  // Trigger live fetch
  return await fetchLiveViewsFromYouTube();
}
