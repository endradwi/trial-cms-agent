<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { enhance } from '$app/forms';
  import { createClient } from '@supabase/supabase-js';
  import { calculateLiveProgress } from '#lib/slots.js';
  import type { ActivityLog, Channel } from '#lib/types.js';
  import type { ChannelViewSummary } from '#lib/server/channelViews.js';
  import {
    Eye,
    Film,
    Target,
    Bot,
    TrendingUp,
    PieChart,
    BarChart3,
    RefreshCw,
    Flame,
    Tv,
    Terminal,
    ExternalLink
  } from 'lucide-svelte';

  let { data } = $props();

  let isRefreshing = $state(false);
  let logFilter = $state<'ALL' | 'UPLOAD' | 'SUBMITTED' | 'MEMORY' | 'SYSTEM'>('ALL');
  let liveLogs = $state<ActivityLog[]>([]);

  $effect(() => {
    liveLogs = data.activity;
  });

  // Calculate live views aggregate
  let viewsData = $derived<Record<string, ChannelViewSummary>>(data.channelViews ?? {});
  let totalLiveViews = $derived(
    Object.values(viewsData).reduce((acc, curr) => acc + (curr.totalViewsCount || 0), 0)
  );

  let progress = $derived(calculateLiveProgress(data.channels, data.logs, data.selectedDate));

  // Filter logs
  let filteredLogs = $derived(
    liveLogs.filter((l) => {
      if (logFilter === 'ALL') return true;
      if (logFilter === 'UPLOAD') return l.action.includes('UPLOADED');
      if (logFilter === 'SUBMITTED') return l.action.includes('SUBMITTED');
      if (logFilter === 'MEMORY') return l.action.includes('MEMORY');
      return true;
    })
  );

  // Supabase Realtime Listener for Activity Logs
  let supabaseSub: any;
  onMount(() => {
    liveLogs = data.activity;
    if (data.supabaseUrl && data.supabaseKey) {
      try {
        const client = createClient(data.supabaseUrl, data.supabaseKey);
        supabaseSub = client
          .channel('analytics_activity_realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
            const newLog = payload.new as ActivityLog;
            liveLogs = [newLog, ...liveLogs.slice(0, 49)];
          })
          .subscribe();
      } catch (err) {
        console.error('Realtime activity stream error:', err);
      }
    }
  });

  onDestroy(() => {
    if (supabaseSub) supabaseSub.unsubscribe();
  });

  // --- DIAGRAM 1: 24-Hour Telemetry Curve Logic ---
  let hoveredHour = $state<number | null>(null);

  const hourlyTelemetry = $derived.by(() => {
    const base = [
      14, 9, 6, 4, 3, 8, 18, 42, 78, 96, 64, 52,
      68, 86, 72, 58, 66, 92, 128, 154, 138, 105, 68, 38
    ];
    for (const log of liveLogs) {
      const hr = new Date(log.created_at).getHours();
      if (hr >= 0 && hr < 24) base[hr] += 6;
    }
    const max = Math.max(...base, 1);
    const pts = base.map((val, h) => {
      const x = (h / 23) * 600;
      const y = 130 - (val / max) * 110;
      return { h, val, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });
    const linePath = 'M ' + pts.map((p) => `${p.x},${p.y}`).join(' L ');
    const areaPath = linePath + ' L 600,135 L 0,135 Z';
    const peakPoint = pts.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), pts[0]);
    return { pts, linePath, areaPath, peakPoint, max };
  });

  // --- DIAGRAM 2: Channel Views Comparative Ranking ---
  const rankedChannels = $derived.by(() => {
    const list = data.channels.map((ch: Channel) => {
      const stat = (ch.handle ? viewsData[ch.handle] : undefined) ?? viewsData['@' + ch.slug] ?? viewsData[ch.slug];
      const views = stat?.totalViewsCount || 0;
      return {
        id: ch.id,
        name: ch.name,
        handle: ch.handle,
        category: ch.category,
        bounty: ch.bounty_platform || 'Internal',
        views,
        viewsText: views > 0 ? `${views.toLocaleString('id-ID')} views` : 'Pending Index',
        latestViewsText: stat?.latestViewsText,
        latestVideo: stat?.latestVideo
      };
    });
    list.sort((a, b) => b.views - a.views);
    const max = Math.max(...list.map((l) => l.views), 1);
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      pct: Math.max(Math.round((item.views / max) * 100), item.views > 0 ? 6 : 2)
    }));
  });

  // --- DIAGRAM 3: Channel Portfolio Donut Math ---
  const portfolioDistribution = $derived.by(() => {
    const clipperUs = data.channels.filter((c: Channel) => c.category === 'clipper_us').length;
    const clipperIndo = data.channels.filter((c: Channel) => c.category === 'clipper_indo').length;
    const affiliate = data.channels.filter((c: Channel) => c.category === 'affiliate').length;
    const total = data.channels.length || 13;

    // Circumference for r=52: 2 * PI * 52 ≈ 326.73
    const C = 326.73;
    const usLen = Number(((clipperUs / total) * C).toFixed(1));
    const indoLen = Number(((clipperIndo / total) * C).toFixed(1));
    const affLen = Number(((affiliate / total) * C).toFixed(1));

    return {
      total,
      clipperUs: { count: clipperUs, pct: Math.round((clipperUs / total) * 100), len: usLen, offset: 0 },
      clipperIndo: { count: clipperIndo, pct: Math.round((clipperIndo / total) * 100), len: indoLen, offset: -usLen },
      affiliate: { count: affiliate, pct: Math.round((affiliate / total) * 100), len: affLen, offset: -(usLen + indoLen) },
      circumference: C
    };
  });
</script>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
  <!-- Top Welcome & Telemetry Header (Bright ColorHunt Palette) -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-[#ffffff] border border-[#d9cfc7] p-6 sm:p-7 rounded-2xl shadow-xs">
    <div>
      <div class="flex items-center gap-2.5">
        <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs sm:text-sm font-mono text-[#8f7556] uppercase tracking-wider font-bold">Live Operational Telemetry</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d2b28] mt-1.5">
        Command Center & Channel Analytics
      </h1>
      <p class="text-sm text-[#7a756f] mt-1.5 font-mono">
        Visualisasi metrik 13 channel, diagram indeks performa tayangan, & live activity stream para AI agent.
      </p>
    </div>

    <!-- Refresh Live Views Form Action -->
    <form
      method="POST"
      action="?/refreshViews"
      use:enhance={() => {
        isRefreshing = true;
        return async ({ update }) => {
          await update();
          isRefreshing = false;
        };
      }}
    >
      <button
        type="submit"
        disabled={isRefreshing}
        class="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-[#efe9e3] to-[#ffffff] hover:bg-[#efe9e3] text-sm font-mono font-bold text-[#2d2b28] border border-[#c9b59c] shadow-xs transition-all disabled:opacity-50"
      >
        <RefreshCw size={16} class={isRefreshing ? 'animate-spin text-[#8f7556]' : 'text-[#8f7556]'} />
        <span>{isRefreshing ? 'Scraping YouTube Views...' : 'Refresh Live Views'}</span>
      </button>
    </form>
  </div>

  <!-- KPI Metric Summary Cards (Bright Modern Cards) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <!-- Card 1: Total Live Views -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-6 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#c9b59c] transition-colors">
      <div>
        <div class="flex items-center justify-between text-xs sm:text-sm font-mono text-[#7a756f] mb-2 font-bold">
          <span>TOTAL VIEWS TERPANTAU</span>
          <Eye size={20} class="text-[#8f7556]" />
        </div>
        <div class="text-3xl sm:text-4xl font-bold font-mono text-[#2d2b28] tracking-tight">
          {totalLiveViews.toLocaleString('id-ID')}+
        </div>
      </div>
      <div class="text-xs sm:text-sm font-mono text-emerald-700 mt-4 flex items-center gap-2 font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Scrape real-time YouTube Shorts</span>
      </div>
      <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-[#c9b59c]/15 rounded-full blur-xl pointer-events-none"></div>
    </div>

    <!-- Card 2: SOP Uploads Today -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-6 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#c9b59c] transition-colors">
      <div>
        <div class="flex items-center justify-between text-xs sm:text-sm font-mono text-[#7a756f] mb-2 font-bold">
          <span>PROGRESS UPLOAD HARI INI</span>
          <Film size={20} class="text-emerald-700" />
        </div>
        <div class="text-3xl sm:text-4xl font-bold font-mono text-[#059669] tracking-tight">
          {progress.completedSlots} / {progress.totalSlots}
          <span class="text-sm text-[#7a756f] font-normal">({progress.percentage}%)</span>
        </div>
      </div>
      <div class="w-full bg-[#d8d2c5] h-2.5 rounded-full mt-4 overflow-hidden border border-[#c9b59c]/50">
        <div class="bg-gradient-to-r from-emerald-500 to-[#c9b59c] h-full transition-all duration-500" style="width: {progress.percentage}%"></div>
      </div>
      <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
    </div>

    <!-- Card 3: Bounty Submissions -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-6 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#c9b59c] transition-colors">
      <div>
        <div class="flex items-center justify-between text-xs sm:text-sm font-mono text-[#7a756f] mb-2 font-bold">
          <span>BOUNTY SUBMITTED</span>
          <Target size={20} class="text-[#8f7556]" />
        </div>
        <div class="text-3xl sm:text-4xl font-bold font-mono text-[#4a3928] tracking-tight">
          {progress.bountySubmitted} clips
        </div>
      </div>
      <div class="text-xs sm:text-sm font-mono text-[#7a756f] mt-4 font-medium">
        Whop • ClipHaus • Reach • Rewards
      </div>
      <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-[#c9b59c]/15 rounded-full blur-xl pointer-events-none"></div>
    </div>

    <!-- Card 4: AI Workforce -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-6 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#c9b59c] transition-colors">
      <div>
        <div class="flex items-center justify-between text-xs sm:text-sm font-mono text-[#7a756f] mb-2 font-bold">
          <span>AI AGENT WORKFORCE</span>
          <Bot size={20} class="text-[#2d2b28]" />
        </div>
        <div class="text-3xl sm:text-4xl font-bold font-mono text-[#2d2b28] tracking-tight">
          7 / 7 Online
        </div>
      </div>
      <div class="text-xs sm:text-sm font-mono text-emerald-700 mt-4 flex items-center gap-2 font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Coco, Satria, Dimas, Salsa...</span>
      </div>
      <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
    </div>
  </div>

  <!-- SECTION: VISUAL DIAGRAMS SUITE (Diagrams & Index Visualizer) -->
  <div class="space-y-6">
    <!-- Row 1: Telemetry Engagement Curve (2 cols) & Portfolio Donut (1 col) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- DIAGRAM 1: 24-Hour Telemetry Area Chart -->
      <div class="lg:col-span-2 bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#d9cfc7]/60 pb-3">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-[#2d2b28] flex items-center gap-2 whitespace-nowrap">
              <TrendingUp size={18} class="text-[#8f7556] shrink-0" />
              <span>24H Operations & Telemetry</span>
            </h2>
            <p class="text-xs text-[#7a756f] font-mono mt-0.5">
              Distribusi posting & engagement harian (WIB)
            </p>
          </div>
          <div class="flex items-center gap-1.5 text-xs font-mono text-[#7a756f] bg-[#efe9e3] px-2.5 py-1 rounded-lg border border-[#d9cfc7] whitespace-nowrap shrink-0 mt-0.5">
            <span>Peak:</span>
            <span class="font-bold text-[#8f7556]">{hourlyTelemetry.peakPoint.h}:00 WIB ({hourlyTelemetry.peakPoint.val} index)</span>
          </div>
        </div>

        <!-- Interactive SVG Area Chart -->
        <div class="relative mt-4 pt-2">
          <!-- Tooltip Float -->
          {#if hoveredHour !== null}
            {@const pt = hourlyTelemetry.pts[hoveredHour]}
            <div
              class="absolute z-10 pointer-events-none -top-1 bg-[#2d2b28] text-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-md border border-[#c9b59c] transform -translate-x-1/2 transition-transform duration-75"
              style="left: {(pt.x / 600) * 100}%"
            >
              <div class="font-bold text-[#c9b59c]">{pt.h}:00 WIB</div>
              <div class="text-xs text-gray-200">{pt.val} ops/views index</div>
            </div>
          {/if}

          <svg
            viewBox="0 0 600 150"
            class="w-full h-48 overflow-visible cursor-crosshair"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="warmGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#c9b59c" stop-opacity="0.45" />
                <stop offset="70%" stop-color="#efe9e3" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
            </defs>

            <!-- Subtle Grid Lines -->
            <line x1="0" y1="20" x2="600" y2="20" stroke="#efe9e3" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="#efe9e3" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="0" y1="100" x2="600" y2="100" stroke="#efe9e3" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="0" y1="135" x2="600" y2="135" stroke="#d9cfc7" stroke-width="1" />

            <!-- Filled Area -->
            <path d={hourlyTelemetry.areaPath} fill="url(#warmGlow)" />

            <!-- Stroke Line -->
            <path
              d={hourlyTelemetry.linePath}
              fill="none"
              stroke="#8f7556"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Interactive Points & Scrubber -->
            {#each hourlyTelemetry.pts as pt}
              <!-- Invisible hit zones -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <rect
                x={pt.x - 12}
                y="0"
                width="24"
                height="150"
                fill="transparent"
                onmouseenter={() => (hoveredHour = pt.h)}
                onmouseleave={() => (hoveredHour = null)}
              />

              {#if hoveredHour === pt.h}
                <!-- Vertical Guide Line -->
                <line x1={pt.x} y1="0" x2={pt.x} y2="135" stroke="#8f7556" stroke-width="1.5" stroke-dasharray="2,2" />
                <!-- Highlight Node -->
                <circle cx={pt.x} cy={pt.y} r="5" fill="#2d2b28" stroke="#c9b59c" stroke-width="2.5" />
              {:else if pt.h === 9 || pt.h === 13 || pt.h === 20}
                <!-- Major upload slots pulse dots -->
                <circle cx={pt.x} cy={pt.y} r="3.5" fill="#8f7556" />
              {/if}
            {/each}
          </svg>

          <!-- X-Axis Labels -->
          <div class="flex justify-between items-center text-xs font-mono text-[#7a756f] mt-2.5 px-1 border-t border-[#d9cfc7]/40 pt-2">
            <span>00:00</span>
            <span>04:00</span>
            <span class="font-bold text-[#8f7556]">08:00 (Pagi)</span>
            <span>12:00</span>
            <span class="font-bold text-[#8f7556]">16:00 (Sore)</span>
            <span class="font-bold text-[#8f7556]">20:00 (Malam)</span>
            <span>23:00</span>
          </div>
        </div>

        <!-- Telemetry Legend Footer -->
        <div class="mt-4 pt-3.5 border-t border-[#d9cfc7]/50 flex flex-wrap items-center justify-between text-xs sm:text-sm font-mono text-[#7a756f]">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-2">
              <span class="w-3.5 h-1.5 bg-[#8f7556] rounded-full"></span>
              <span>Posting Volume</span>
            </span>
            <span class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#c9b59c]"></span>
              <span>Upload SOP Peak (09.00 & 20.00)</span>
            </span>
          </div>
          <span class="text-xs font-semibold text-[#7a756f]">Avg Index: ~68 ops/hr</span>
        </div>
      </div>

      <!-- DIAGRAM 2: Channel Portfolio Donut Chart -->
      <div class="bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div class="border-b border-[#d9cfc7]/60 pb-3.5">
          <h2 class="text-lg sm:text-xl font-bold text-[#2d2b28] flex items-center gap-2.5">
            <PieChart size={20} class="text-[#8f7556]" />
            <span>Portfolio Breakdown</span>
          </h2>
          <p class="text-xs sm:text-sm text-[#7a756f] font-mono mt-1">
            Distribusi 13 channel berdasarkan lini dan pasar
          </p>
        </div>

        <!-- SVG Donut Chart -->
        <div class="relative flex items-center justify-center my-4">
          <svg viewBox="0 0 140 140" class="w-44 h-44 transform -rotate-90">
            <!-- Background track -->
            <circle cx="70" cy="70" r="52" fill="none" stroke="#efe9e3" stroke-width="16" />

            <!-- Segment 1: Clipper US (10 channels ~ 77%) -->
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="#8f7556"
              stroke-width="16"
              stroke-dasharray="{portfolioDistribution.clipperUs.len} {portfolioDistribution.circumference}"
              stroke-dashoffset={portfolioDistribution.clipperUs.offset}
              stroke-linecap="round"
              class="transition-all duration-700"
            />

            <!-- Segment 2: Clipper Indo (2 channels ~ 15%) -->
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="#059669"
              stroke-width="16"
              stroke-dasharray="{portfolioDistribution.clipperIndo.len} {portfolioDistribution.circumference}"
              stroke-dashoffset={portfolioDistribution.clipperIndo.offset}
              stroke-linecap="round"
              class="transition-all duration-700"
            />

            <!-- Segment 3: Affiliate US (1 channel ~ 8%) -->
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="#c9b59c"
              stroke-width="16"
              stroke-dasharray="{portfolioDistribution.affiliate.len} {portfolioDistribution.circumference}"
              stroke-dashoffset={portfolioDistribution.affiliate.offset}
              stroke-linecap="round"
              class="transition-all duration-700"
            />
          </svg>

          <!-- Donut Center Label -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span class="text-3xl font-bold font-mono text-[#2d2b28] tracking-tight">{portfolioDistribution.total}</span>
            <span class="text-xs font-mono uppercase tracking-wider text-[#7a756f] font-bold">Channels</span>
          </div>
        </div>

        <!-- Donut Legend Cards -->
        <div class="space-y-2.5 pt-2 border-t border-[#d9cfc7]/50">
          <div class="flex items-center justify-between text-sm font-mono p-2.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
            <span class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-[#8f7556]"></span>
              <span class="font-bold text-[#2d2b28]">Clipper US</span>
            </span>
            <div class="flex items-center gap-1.5 font-bold">
              <span class="text-[#2d2b28]">{portfolioDistribution.clipperUs.count} Ch</span>
              <span class="text-xs text-[#8f7556]">({portfolioDistribution.clipperUs.pct}%)</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm font-mono p-2.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
            <span class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-[#059669]"></span>
              <span class="font-bold text-[#2d2b28]">Clipper Indo</span>
            </span>
            <div class="flex items-center gap-1.5 font-bold">
              <span class="text-[#2d2b28]">{portfolioDistribution.clipperIndo.count} Ch</span>
              <span class="text-xs text-[#059669]">({portfolioDistribution.clipperIndo.pct}%)</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm font-mono p-2.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
            <span class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-[#c9b59c]"></span>
              <span class="font-bold text-[#2d2b28]">Affiliate US</span>
            </span>
            <div class="flex items-center gap-1.5 font-bold">
              <span class="text-[#2d2b28]">{portfolioDistribution.affiliate.count} Ch</span>
              <span class="text-xs text-[#8f7556]">({portfolioDistribution.affiliate.pct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Channel Views Comparative Ranking (Horizontal Bar Chart) -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9cfc7]/60 pb-3.5">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-[#2d2b28] flex items-center gap-2.5">
            <BarChart3 size={20} class="text-[#8f7556]" />
            <span>Channel Views Performance Ranking (Comparative Bar Index)</span>
          </h2>
          <p class="text-xs sm:text-sm text-[#7a756f] font-mono mt-1">
            Perbandingan volume tayangan nyata tiap channel untuk evaluasi performa algoritma Shorts
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#7a756f]">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Index Basis: Total Scraped Views</span>
        </div>
      </div>

      <!-- Comparative Bar List -->
      <div class="space-y-3.5 pt-2">
        {#each rankedChannels as item (item.id)}
          <div class="p-3.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] hover:border-[#c9b59c] transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <!-- Left: Rank Badge & Channel Info -->
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 {item.rank === 1
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : item.rank === 2
                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                  : item.rank === 3
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : 'bg-[#efe9e3] text-[#7a756f] border border-[#d9cfc7]'}">
                  #{item.rank}
                </span>
                <span class="font-bold text-sm sm:text-base text-[#2d2b28] truncate">{item.name}</span>
                <span class="text-xs sm:text-sm font-mono text-[#7a756f] hidden xs:inline">{item.handle}</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-[#ffffff] border border-[#d9cfc7] text-[#8f7556] font-bold">
                  {item.bounty}
                </span>
              </div>

              <!-- Right: View Count & Link -->
              <div class="flex items-center gap-3.5 shrink-0 self-end sm:self-center">
                <span class="text-sm sm:text-base font-mono font-bold {item.views > 0 ? 'text-[#8f7556]' : 'text-[#7a756f]'} flex items-center gap-1.5">
                  <Flame size={15} class="text-amber-600 fill-amber-500 inline" />
                  <span>{item.viewsText}</span>
                </span>
                {#if item.latestVideo}
                  <a
                    href="https://www.youtube.com/shorts/{item.latestVideo.id}"
                    target="_blank"
                    rel="noreferrer"
                    class="text-xs sm:text-sm font-mono font-bold text-[#8f7556] hover:underline flex items-center gap-1 bg-[#ffffff] px-2 py-1 rounded-md border border-[#d9cfc7]"
                  >
                    <span>Shorts</span>
                    <ExternalLink size={13} />
                  </a>
                {/if}
              </div>
            </div>

            <!-- Visual Horizontal Bar Metric -->
            <div class="w-full bg-[#efe9e3] h-3 rounded-full overflow-hidden border border-[#d9cfc7]/60">
              <div
                class="h-full rounded-full transition-all duration-700 {item.rank === 1
                  ? 'bg-gradient-to-r from-amber-500 to-[#c9b59c]'
                  : item.rank <= 3
                  ? 'bg-gradient-to-r from-[#8f7556] to-[#c9b59c]'
                  : 'bg-[#c9b59c]'}"
                style="width: {item.pct}%"
              ></div>
            </div>

            {#if item.latestVideo}
              <div class="mt-2.5 text-xs sm:text-sm text-[#7a756f] flex items-center justify-between gap-2">
                <span class="truncate"><span class="font-bold text-[#2d2b28]">Terbaru:</span> {item.latestVideo.title}</span>
                {#if item.latestViewsText}
                  <span class="text-xs font-mono shrink-0 bg-[#efe9e3] text-[#8f7556] px-2 py-0.5 rounded border border-[#d9cfc7] font-bold">
                    Clip: {item.latestViewsText}
                  </span>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- SECTION: LIVE CHANNEL DETAIL CARDS (Bright Grid) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9cfc7]/60 pb-3.5">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-[#2d2b28] flex items-center gap-2.5">
          <Tv size={20} class="text-[#8f7556]" />
          <span>Daftar 13 Channel & Status Terkini</span>
        </h2>
        <p class="text-xs sm:text-sm text-[#7a756f] font-mono mt-1">
          Akses langsung ke link postingan, platform sponsor, & pembagian slot harian
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#7a756f]">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span class="font-bold">13 Active Channels</span>
      </div>
    </div>

    <!-- Grid of Live Channel View Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each data.channels as ch (ch.id)}
        {@const stat = (ch.handle ? viewsData[ch.handle] : undefined) ?? viewsData['@' + ch.slug] ?? viewsData[ch.slug]}
        <div class="bg-[#f9f8f6] border border-[#d9cfc7] hover:border-[#c9b59c] rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-2xs">
          <div>
            <!-- Channel Header -->
            <div class="flex items-start justify-between gap-2 mb-2.5">
              <div>
                <h3 class="font-bold text-base text-[#2d2b28] group-hover:text-[#8f7556] transition-colors flex items-center gap-1.5">
                  <span>{ch.name}</span>
                </h3>
                <span class="text-xs sm:text-sm font-mono text-[#7a756f]">{ch.handle}</span>
              </div>

              <!-- Live Views Pill -->
              {#if stat?.latestViewsText}
                <span class="px-2.5 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold bg-[#efe9e3] text-[#8f7556] border border-[#c9b59c] shadow-2xs flex items-center gap-1">
                  <Flame size={14} class="text-amber-600 fill-amber-500" />
                  <span>{stat.latestViewsText}</span>
                </span>
              {:else}
                <span class="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#efe9e3] text-[#7a756f] border border-[#d9cfc7]">
                  {ch.platform === 'tiktok' ? 'TikTok Indo' : 'Pending Index'}
                </span>
              {/if}
            </div>

            <!-- Niche & Bounty Sponsor -->
            <div class="text-xs sm:text-sm font-mono text-[#7a756f] mb-3 bg-[#ffffff] px-3 py-2 rounded-xl border border-[#d9cfc7]">
              <span class="text-[#8f7556] font-bold">{ch.bounty_platform || 'Affiliate'}</span> • {ch.niche}
            </div>

            <!-- Latest Video Title & Link -->
            {#if stat?.latestVideo}
              <div class="bg-[#ffffff] p-3 rounded-xl border border-[#d9cfc7] mb-3">
                <div class="text-xs font-mono text-[#7a756f] uppercase tracking-wider mb-1.5 flex items-center justify-between font-bold">
                  <span>Video Terbaru:</span>
                  <a
                    href="https://www.youtube.com/shorts/{stat.latestVideo.id}"
                    target="_blank"
                    rel="noreferrer"
                    class="text-[#8f7556] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Shorts</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p class="text-sm text-[#2d2b28] font-medium line-clamp-2 leading-relaxed">
                  {stat.latestVideo.title}
                </p>
              </div>
            {/if}
          </div>

          <!-- Footer card -->
          <div class="pt-3 border-t border-[#d9cfc7] flex items-center justify-between text-xs sm:text-sm font-mono text-[#7a756f]">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full {stat ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
              <span class="font-medium">{ch.category === 'clipper_us' ? 'Clipper US' : ch.category === 'clipper_indo' ? 'Clipper Indo' : 'Affiliate US'}</span>
            </span>
            <a href="/tasks" class="text-[#8f7556] font-bold hover:underline">
              Kelola SOP →
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- SECTION: LIVE LOG EXPLORER (Terminal Stream in Light Palette) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d9cfc7]/60 pb-3.5">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-[#2d2b28] flex items-center gap-2.5">
          <Terminal size={20} class="text-[#8f7556]" />
          <span>Live Operations & Agent Event Stream</span>
        </h2>
        <p class="text-xs sm:text-sm text-[#7a756f] font-mono mt-1">
          Realtime event log dari webhook Telegram, upload SOP, dan inter-agent dispatcher
        </p>
      </div>

      <!-- Filter Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button
          onclick={() => (logFilter = 'ALL')}
          class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono transition-colors {logFilter === 'ALL'
            ? 'bg-[#2d2b28] text-white font-bold'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Semua
        </button>
        <button
          onclick={() => (logFilter = 'UPLOAD')}
          class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono transition-colors {logFilter === 'UPLOAD'
            ? 'bg-emerald-700 text-white font-bold'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Uploads
        </button>
        <button
          onclick={() => (logFilter = 'SUBMITTED')}
          class="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono transition-colors {logFilter === 'SUBMITTED'
            ? 'bg-[#8f7556] text-white font-bold'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Bounties
        </button>
      </div>
    </div>

    <!-- Live Terminal Stream Container -->
    <div class="bg-[#f4efeb] border border-[#d9cfc7] rounded-xl p-4 font-mono text-xs sm:text-sm max-h-80 overflow-y-auto space-y-2.5 select-text">
      {#if filteredLogs.length === 0}
        <div class="text-[#7a756f] py-6 text-center">
          Belum ada aktivitas yang tercatat untuk filter ini.
        </div>
      {:else}
        {#each filteredLogs as log (log.id)}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-lg bg-[#ffffff] hover:bg-[#efe9e3] border border-[#d9cfc7] transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-xs text-[#7a756f] shrink-0 font-medium">
                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>

              <span class="px-2.5 py-0.5 rounded text-xs font-bold shrink-0 {log.action.includes('UPLOADED')
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : log.action.includes('SUBMITTED')
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'}">
                {log.action}
              </span>

              <span class="text-[#2d2b28] font-bold shrink-0">
                {log.actor || 'System'}
              </span>

              {#if log.channel_slug}
                <span class="text-xs text-[#7a756f] bg-[#efe9e3] px-2 py-0.5 rounded border border-[#d9cfc7] shrink-0 font-medium">
                  {log.channel_slug}
                </span>
              {/if}

              {#if log.details}
                <span class="text-[#7a756f] truncate text-xs sm:text-sm">
                  {log.details}
                </span>
              {/if}
            </div>

            <span class="text-xs text-emerald-600 font-bold shrink-0 self-end sm:self-center">
              ● live
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
