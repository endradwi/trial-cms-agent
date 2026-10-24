<script lang="ts">
  import { Film, Eye, Flame, Search, ExternalLink, Copy, Check, Filter, Sparkles, Tv, Layers } from 'lucide-svelte';
  import type { VideoVaultItem } from './+page.server.js';

  let { data } = $props();

  let searchQuery = $state('');
  let selectedCategory = $state<'ALL' | 'clipper_us' | 'clipper_indo' | 'affiliate'>('ALL');
  let selectedChannel = $state<string>('ALL');
  let sortBy = $state<'views_desc' | 'views_asc' | 'title_asc'>('views_desc');
  let copiedId = $state<string | null>(null);

  // Filter & Sort
  let filteredVideos = $derived.by(() => {
    let list = (data.videos as VideoVaultItem[]) || [];

    if (selectedCategory !== 'ALL') {
      list = list.filter((v) => v.category === selectedCategory);
    }

    if (selectedChannel !== 'ALL') {
      list = list.filter((v) => v.channelSlug === selectedChannel || v.channelHandle === selectedChannel);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q));
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'views_desc') return b.viewsCount - a.viewsCount;
      if (sortBy === 'views_asc') return a.viewsCount - b.viewsCount;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return 0;
    });
  });

  // KPI Metrics
  let totalVideos = $derived(data.videos?.length || 0);
  let totalViews = $derived(
    (data.videos || []).reduce((acc: number, curr: VideoVaultItem) => acc + (curr.viewsCount || 0), 0)
  );
  let topVideo = $derived(
    (data.videos || []).length > 0
      ? [...data.videos].sort((a: VideoVaultItem, b: VideoVaultItem) => b.viewsCount - a.viewsCount)[0]
      : null
  );

  async function copyToClipboard(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      copiedId = id;
      setTimeout(() => {
        copiedId = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  }
</script>

<svelte:head>
  <title>Video Vault — Agency Ops Virtual HQ</title>
</svelte:head>

<div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
  <!-- Top Header with Summary (ColorHunt Warm Light Palette) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-mono text-[#8f7556] uppercase tracking-wider font-bold">Content Repository</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-[#2d2b28] mt-1 flex items-center gap-2">
        <Film size={22} class="text-[#8f7556]" />
        <span>Video Vault & Content Library</span>
      </h1>
      <p class="text-xs text-[#7a756f] mt-1 font-mono">
        Katalog seluruh video yang sudah tayang & diproduksi di 13 channel medsos agensi.
      </p>
    </div>

    <!-- Total Count Pill -->
    <div class="flex items-center gap-2 text-xs font-mono bg-[#efe9e3] px-3.5 py-1.5 rounded-xl border border-[#d9cfc7] text-[#2d2b28]">
      <Layers size={14} class="text-[#8f7556]" />
      <span>Total Terdata:</span>
      <span class="font-bold text-[#8f7556]">{totalVideos} Video</span>
    </div>
  </div>

  <!-- KPI Cards Row -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Total Videos -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-4 rounded-xl shadow-2xs flex flex-col justify-between">
      <div class="text-[11px] font-mono text-[#7a756f] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
        <span>TOTAL KOLEKSI VIDEO</span>
        <Film size={15} class="text-[#8f7556]" />
      </div>
      <div class="text-2xl font-bold font-mono text-[#2d2b28]">
        {totalVideos} <span class="text-xs font-normal text-[#7a756f]">Shorts</span>
      </div>
      <div class="text-[10px] font-mono text-emerald-700 mt-2">
        Scraped live & verified
      </div>
    </div>

    <!-- Card 2: Total Views Accumulated -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-4 rounded-xl shadow-2xs flex flex-col justify-between">
      <div class="text-[11px] font-mono text-[#7a756f] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
        <span>TOTAL ACCUMULATED VIEWS</span>
        <Eye size={15} class="text-[#8f7556]" />
      </div>
      <div class="text-2xl font-bold font-mono text-[#2d2b28]">
        {totalViews.toLocaleString('id-ID')}+
      </div>
      <div class="text-[10px] font-mono text-emerald-700 mt-2">
        Tayangan organik YouTube
      </div>
    </div>

    <!-- Card 3: Top Performer Video -->
    <div class="bg-[#ffffff] border border-[#d9cfc7] p-4 rounded-xl shadow-2xs flex flex-col justify-between sm:col-span-2">
      <div class="text-[11px] font-mono text-[#7a756f] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <Sparkles size={14} class="text-amber-600" />
          <span>TOP PERFORMER VIDEO</span>
        </span>
        {#if topVideo}
          <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
            🔥 {topVideo.views}
          </span>
        {/if}
      </div>
      {#if topVideo}
        <div class="mt-1">
          <a
            href={topVideo.url}
            target="_blank"
            rel="noreferrer"
            class="text-xs font-bold text-[#2d2b28] hover:text-[#8f7556] line-clamp-1 transition-colors flex items-center gap-1"
          >
            <span>{topVideo.title}</span>
            <ExternalLink size={12} class="shrink-0" />
          </a>
          <div class="text-[10px] font-mono text-[#7a756f] mt-1 flex items-center gap-2">
            <span class="font-semibold text-[#8f7556]">{topVideo.channelName}</span>
            <span>•</span>
            <span>{topVideo.bountyPlatform}</span>
          </div>
        </div>
      {:else}
        <div class="text-xs text-[#7a756f] font-mono">Belum ada video terindeks</div>
      {/if}
    </div>
  </div>

  <!-- Filter & Search Controls Toolbar -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-4 rounded-2xl shadow-xs space-y-3">
    <!-- Category Filter Tabs -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-1.5 overflow-x-auto">
        <button
          onclick={() => (selectedCategory = 'ALL')}
          class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {selectedCategory === 'ALL'
            ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Semua ({totalVideos})
        </button>
        <button
          onclick={() => (selectedCategory = 'clipper_us')}
          class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {selectedCategory === 'clipper_us'
            ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Clipper US
        </button>
        <button
          onclick={() => (selectedCategory = 'clipper_indo')}
          class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {selectedCategory === 'clipper_indo'
            ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Clipper Indo
        </button>
        <button
          onclick={() => (selectedCategory = 'affiliate')}
          class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {selectedCategory === 'affiliate'
            ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
            : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
        >
          Affiliate US
        </button>
      </div>

      <!-- Result Count Info -->
      <div class="text-xs font-mono text-[#7a756f]">
        Menampilkan <span class="font-bold text-[#2d2b28]">{filteredVideos.length}</span> video
      </div>
    </div>

    <!-- Search & Sort Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a756f]" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari judul video atau nama channel..."
          class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] text-xs font-mono text-[#2d2b28] placeholder-[#7a756f]/60 focus:outline-none focus:border-[#8f7556] focus:bg-[#ffffff] transition-colors"
        />
      </div>

      <!-- Dropdown Selectors -->
      <div class="flex items-center gap-2">
        <!-- Channel Select -->
        <select
          bind:value={selectedChannel}
          class="px-3 py-2 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] text-xs font-mono text-[#2d2b28] focus:outline-none focus:border-[#8f7556]"
        >
          <option value="ALL">Semua Channel</option>
          {#each data.channels as ch}
            <option value={ch.slug}>{ch.name}</option>
          {/each}
        </select>

        <!-- Sort Select -->
        <select
          bind:value={sortBy}
          class="px-3 py-2 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] text-xs font-mono text-[#2d2b28] focus:outline-none focus:border-[#8f7556]"
        >
          <option value="views_desc">Views Tertinggi 🔥</option>
          <option value="views_asc">Views Terendah</option>
          <option value="title_asc">Judul A-Z</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Videos Grid -->
  {#if filteredVideos.length === 0}
    <div class="bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-12 text-center text-xs font-mono text-[#7a756f] space-y-2">
      <div class="text-2xl">🎬</div>
      <div class="font-bold text-[#2d2b28]">Tidak ada video yang cocok</div>
      <div>Coba ubah kata kunci pencarian atau reset filter kategori di atas.</div>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {#each filteredVideos as vid (vid.id)}
        <div class="bg-[#ffffff] border border-[#d9cfc7] hover:border-[#c9b59c] rounded-2xl overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group">
          <div>
            <!-- Video Thumbnail / Visual Header -->
            <div class="relative aspect-video bg-[#efe9e3] overflow-hidden">
              {#if vid.thumbnailUrl}
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center text-[#7a756f] font-mono text-xs">
                  <Tv size={24} />
                </div>
              {/if}

              <!-- View Pill Badge (Top Right) -->
              <div class="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-xs flex items-center gap-1">
                <Flame size={11} class="text-amber-400 fill-amber-400" />
                <span>{vid.views}</span>
              </div>

              <!-- Category Badge (Top Left) -->
              <div class="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold bg-[#2d2b28]/80 text-[#efe9e3] backdrop-blur-xs">
                {vid.category === 'clipper_us' ? 'Clipper US' : vid.category === 'clipper_indo' ? 'Clipper Indo' : 'Affiliate US'}
              </div>
            </div>

            <!-- Content Details -->
            <div class="p-4 space-y-2.5">
              <!-- Channel & Bounty info -->
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="font-bold text-[#2d2b28] truncate">{vid.channelName}</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#efe9e3] text-[#8f7556] border border-[#d9cfc7] font-semibold shrink-0">
                  {vid.bountyPlatform}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-xs font-semibold text-[#2d2b28] line-clamp-2 leading-relaxed group-hover:text-[#8f7556] transition-colors">
                {vid.title}
              </h3>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div class="p-3 pt-0 border-t border-[#d9cfc7]/50 flex items-center justify-between gap-2 mt-2">
            <!-- Open Shorts Link -->
            <a
              href={vid.url}
              target="_blank"
              rel="noreferrer"
              class="flex-1 py-1.5 px-3 rounded-lg bg-[#efe9e3] hover:bg-[#d9cfc7] text-[#2d2b28] text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#c9b59c]"
            >
              <span>Buka Shorts</span>
              <ExternalLink size={12} />
            </a>

            <!-- Copy Link Button -->
            <button
              onclick={() => copyToClipboard(vid.url, vid.id)}
              class="p-1.5 rounded-lg border border-[#d9cfc7] hover:bg-[#efe9e3] text-[#7a756f] hover:text-[#2d2b28] transition-colors shrink-0"
              title="Salin URL Shorts"
              aria-label="Salin URL Shorts"
            >
              {#if copiedId === vid.id}
                <Check size={14} class="text-emerald-600" />
              {:else}
                <Copy size={14} />
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
