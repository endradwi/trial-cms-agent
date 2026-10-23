<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { enhance } from '$app/forms';
  import { createClient } from '@supabase/supabase-js';
  import { calculateLiveProgress } from '#lib/slots.js';
  import type { ActivityLog, Channel, ContentLog } from '#lib/types.js';
  import type { ChannelViewSummary } from '#lib/server/channelViews.js';

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
</script>

<div class="p-6 max-w-7xl mx-auto space-y-6">
  <!-- Top Welcome & Telemetry Header -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0d1c42]/80 border border-[#22396f] p-6 rounded-2xl shadow-xl">
    <div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-mono text-[#00e5ff] uppercase tracking-wider font-semibold">Live Operational Telemetry</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-[#fcf1d0] mt-1">
        Command Center & Live Channel Analytics
      </h1>
      <p class="text-xs text-[#8fa2cb] mt-1 font-mono">
        Status real-time 13 channel media sosial, performa views terkini, & live activity stream para AI agent.
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
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22396f] to-[#0d1c42] hover:from-[#314f96] hover:to-[#172c63] text-xs font-mono font-bold text-[#fcf1d0] border border-[#3b82f6]/50 shadow-lg shadow-[#00e5ff]/5 transition-all disabled:opacity-50"
      >
        <span class={isRefreshing ? 'animate-spin' : ''}>🔄</span>
        <span>{isRefreshing ? 'Scraping YouTube Views...' : 'Refresh Live Views'}</span>
      </button>
    </form>
  </div>

  <!-- KPI Metric Summary Cards (Supabase Style) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Total Live Views -->
    <div class="bg-[#0d1c42] border border-[#22396f] p-5 rounded-2xl shadow flex flex-col justify-between relative overflow-hidden">
      <div>
        <div class="flex items-center justify-between text-xs font-mono text-[#8fa2cb] mb-1">
          <span>TOTAL VIEWS TERPANTAU</span>
          <span class="text-base">👁️</span>
        </div>
        <div class="text-2xl font-bold font-mono text-[#00e5ff] tracking-tight">
          {totalLiveViews.toLocaleString('id-ID')}+
        </div>
      </div>
      <div class="text-[11px] font-mono text-emerald-400 mt-3 flex items-center gap-1">
        <span>●</span>
        <span>Live scrape dari YouTube Shorts</span>
      </div>
      <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-[#00e5ff]/5 rounded-full blur-xl pointer-events-none"></div>
    </div>

    <!-- Card 2: SOP Uploads Today -->
    <div class="bg-[#0d1c42] border border-[#22396f] p-5 rounded-2xl shadow flex flex-col justify-between relative overflow-hidden">
      <div>
        <div class="flex items-center justify-between text-xs font-mono text-[#8fa2cb] mb-1">
          <span>PROGRESS UPLOAD HARI INI</span>
          <span class="text-base">🎬</span>
        </div>
        <div class="text-2xl font-bold font-mono text-[#10b981] tracking-tight">
          {progress.completedSlots} / {progress.totalSlots}
          <span class="text-xs text-[#8fa2cb] font-normal">({progress.percentage}%)</span>
        </div>
      </div>
      <div class="w-full bg-[#010736] h-1.5 rounded-full mt-3 overflow-hidden">
        <div class="bg-[#10b981] h-full transition-all duration-500" style="width: {progress.percentage}%"></div>
      </div>
      <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-[#10b981]/5 rounded-full blur-xl pointer-events-none"></div>
    </div>

    <!-- Card 3: Bounty Submissions -->
    <div class="bg-[#0d1c42] border border-[#22396f] p-5 rounded-2xl shadow flex flex-col justify-between relative overflow-hidden">
      <div>
        <div class="flex items-center justify-between text-xs font-mono text-[#8fa2cb] mb-1">
          <span>BOUNTY SUBMITTED</span>
          <span class="text-base">🎯</span>
        </div>
        <div class="text-2xl font-bold font-mono text-[#fcf1d0] tracking-tight">
          {progress.bountySubmitted} clips
        </div>
      </div>
      <div class="text-[11px] font-mono text-[#8fa2cb] mt-3">
        Whop • ClipHaus • Content Rewards • Reach
      </div>
      <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-[#fcf1d0]/5 rounded-full blur-xl pointer-events-none"></div>
    </div>

    <!-- Card 4: AI Workforce -->
    <div class="bg-[#0d1c42] border border-[#22396f] p-5 rounded-2xl shadow flex flex-col justify-between relative overflow-hidden">
      <div>
        <div class="flex items-center justify-between text-xs font-mono text-[#8fa2cb] mb-1">
          <span>AI AGENT WORKFORCE</span>
          <span class="text-base">🤖</span>
        </div>
        <div class="text-2xl font-bold font-mono text-[#fcf1d0] tracking-tight">
          7 / 7 Online
        </div>
      </div>
      <div class="text-[11px] font-mono text-emerald-400 mt-3 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Coco, Satria, Dimas, Salsa, Layla...</span>
      </div>
      <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
    </div>
  </div>

  <!-- SECTION: LIVE CHANNEL VIEWS (Biar lu gak perlu nanya si Coco lagi!) -->
  <div class="bg-[#0d1c42] border border-[#22396f] rounded-2xl p-6 shadow-xl space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#22396f]/60 pb-4">
      <div>
        <h2 class="text-lg font-bold text-[#fcf1d0] flex items-center gap-2">
          <span>📺</span>
          <span>Live Views per Channel (Real-Time YouTube Shorts & Affiliate)</span>
        </h2>
        <p class="text-xs text-[#8fa2cb] font-mono mt-0.5">
          Data real view scrape langsung dari YouTube Shorts tiap channel agensi
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs font-mono text-[#8fa2cb]">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Monitored: 13 Channels</span>
      </div>
    </div>

    <!-- Grid of Live Channel View Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.channels as ch (ch.id)}
        {@const stat = (ch.handle ? viewsData[ch.handle] : undefined) ?? viewsData['@' + ch.slug]}
        <div class="bg-[#071330] border border-[#22396f]/70 hover:border-[#00e5ff]/50 rounded-xl p-4 flex flex-col justify-between transition-all group">
          <div>
            <!-- Channel Header -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 class="font-bold text-sm text-[#fcf1d0] group-hover:text-[#00e5ff] transition-colors flex items-center gap-1.5">
                  <span>{ch.name}</span>
                </h3>
                <span class="text-[11px] font-mono text-[#8fa2cb]">{ch.handle}</span>
              </div>

              <!-- Live Views Pill -->
              {#if stat?.latestViewsText}
                <span class="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 shadow">
                  🔥 {stat.latestViewsText}
                </span>
              {:else}
                <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#22396f]/40 text-[#8fa2cb] border border-[#22396f]/40">
                  {ch.platform === 'tiktok' ? 'TikTok Indo' : 'Pending Index'}
                </span>
              {/if}
            </div>

            <!-- Niche & Bounty Sponsor -->
            <div class="text-[11px] font-mono text-[#8fa2cb]/80 mb-3 bg-[#010736] px-2.5 py-1.5 rounded-lg border border-[#22396f]/30">
              <span class="text-[#00e5ff] font-semibold">{ch.bounty_platform || 'Affiliate'}</span> • {ch.niche}
            </div>

            <!-- Latest Video Title & Link -->
            {#if stat?.latestVideo}
              <div class="bg-[#0d1c42]/60 p-2.5 rounded-lg border border-[#22396f]/40 mb-3">
                <div class="text-[10px] font-mono text-[#8fa2cb]/70 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Video Terbaru:</span>
                  <a
                    href="https://www.youtube.com/shorts/{stat.latestVideo.id}"
                    target="_blank"
                    rel="noreferrer"
                    class="text-[#00e5ff] hover:underline flex items-center gap-0.5"
                  >
                    <span>Buka Shorts</span>
                    <span>↗</span>
                  </a>
                </div>
                <p class="text-xs text-[#fcf1d0] font-medium line-clamp-2 leading-snug">
                  {stat.latestVideo.title}
                </p>
              </div>
            {/if}
          </div>

          <!-- Footer card -->
          <div class="pt-2 border-t border-[#22396f]/30 flex items-center justify-between text-[11px] font-mono text-[#8fa2cb]">
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full {stat ? 'bg-emerald-400' : 'bg-blue-400'}"></span>
              <span>{ch.category === 'clipper_us' ? 'Clipper US' : ch.category === 'clipper_indo' ? 'Clipper Indo' : 'Affiliate US'}</span>
            </span>
            <a href="/tasks" class="text-[#00e5ff] hover:underline">
              Kelola SOP →
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- SECTION: LIVE LOG EXPLORER (Supabase Logs Explorer Style) -->
  <div class="bg-[#0d1c42] border border-[#22396f] rounded-2xl p-6 shadow-xl space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#22396f]/60 pb-4">
      <div>
        <h2 class="text-lg font-bold text-[#fcf1d0] flex items-center gap-2">
          <span>📜</span>
          <span>Live Operations & Agent Event Stream</span>
        </h2>
        <p class="text-xs text-[#8fa2cb] font-mono mt-0.5">
          Realtime event log dari webhook Telegram, upload SOP, dan inter-agent dispatcher
        </p>
      </div>

      <!-- Filter Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          onclick={() => (logFilter = 'ALL')}
          class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors {logFilter === 'ALL'
            ? 'bg-[#22396f] text-[#fcf1d0] font-bold border border-[#00e5ff]/50'
            : 'text-[#8fa2cb] hover:bg-[#071330]'}"
        >
          Semua
        </button>
        <button
          onclick={() => (logFilter = 'UPLOAD')}
          class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors {logFilter === 'UPLOAD'
            ? 'bg-[#22396f] text-[#10b981] font-bold border border-[#10b981]/50'
            : 'text-[#8fa2cb] hover:bg-[#071330]'}"
        >
          Uploads
        </button>
        <button
          onclick={() => (logFilter = 'SUBMITTED')}
          class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors {logFilter === 'SUBMITTED'
            ? 'bg-[#22396f] text-[#00e5ff] font-bold border border-[#00e5ff]/50'
            : 'text-[#8fa2cb] hover:bg-[#071330]'}"
        >
          Bounties
        </button>
      </div>
    </div>

    <!-- Live Terminal Stream Container -->
    <div class="bg-[#050e24] border border-[#22396f]/60 rounded-xl p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2 select-text">
      {#if filteredLogs.length === 0}
        <div class="text-[#8fa2cb]/60 py-6 text-center">
          Belum ada aktivitas yang tercatat untuk filter ini.
        </div>
      {:else}
        {#each filteredLogs as log (log.id)}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg bg-[#071330]/60 hover:bg-[#0d1c42] border border-[#22396f]/30 transition-colors">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="text-[10px] text-[#8fa2cb]/60 shrink-0">
                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>

              <span class="px-2 py-0.5 rounded text-[10px] font-bold shrink-0 {log.action.includes('UPLOADED')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : log.action.includes('SUBMITTED')
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'}">
                {log.action}
              </span>

              <span class="text-[#fcf1d0] font-semibold shrink-0">
                {log.actor || 'System'}
              </span>

              {#if log.channel_slug}
                <span class="text-[10px] text-[#8fa2cb] bg-[#010736] px-1.5 py-0.2 rounded border border-[#22396f]/40 shrink-0">
                  {log.channel_slug}
                </span>
              {/if}

              {#if log.details}
                <span class="text-[#8fa2cb] truncate text-[11px]">
                  {log.details}
                </span>
              {/if}
            </div>

            <span class="text-[9px] text-emerald-400/80 shrink-0 self-end sm:self-center">
              ● live
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
