<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createClient } from '@supabase/supabase-js';
  import { invalidateAll } from '$app/navigation';
  import ChannelCard from '#lib/components/ChannelCard.svelte';
  import EditSlotDialog from '#lib/components/EditSlotDialog.svelte';
  import { totalSlotsForChannel, calculateLiveProgress } from '#lib/slots.js';
  import type { Channel, ContentLog, SlotTime } from '#lib/types.js';

  let { data } = $props();

  let filterCategory = $state<'ALL' | 'clipper_us' | 'clipper_indo' | 'affiliate'>('ALL');
  let searchQuery = $state('');

  // Dialog edit state
  let dialogOpen = $state(false);
  let activeChannel = $state<Channel | null>(null);
  let activeSlot = $state<SlotTime>('malam');

  function openEdit(channel: Channel, slot: SlotTime) {
    activeChannel = channel;
    activeSlot = slot;
    dialogOpen = true;
  }

  // Filter channels
  let filteredChannels = $derived(
    data.channels
      .filter((c: Channel) => filterCategory === 'ALL' || c.category === filterCategory)
      .filter((c: Channel) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.handle?.toLowerCase().includes(q) ?? false) || (c.niche?.toLowerCase().includes(q) ?? false);
      })
  );

  // Stats calculation
  let progress = $derived(calculateLiveProgress(data.channels, data.logs, data.selectedDate));

  // Supabase Realtime Listener
  let supabaseSub: any;
  onMount(() => {
    if (data.supabaseUrl && data.supabaseKey) {
      try {
        const client = createClient(data.supabaseUrl, data.supabaseKey);
        supabaseSub = client
          .channel('tasks_page_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'content_logs' }, () => {
            invalidateAll();
          })
          .subscribe();
      } catch (err) {
        console.error('Realtime tasks listener failed:', err);
      }
    }
  });

  onDestroy(() => {
    if (supabaseSub) supabaseSub.unsubscribe();
  });
</script>

<div class="p-6 max-w-7xl mx-auto space-y-6">
  <!-- Top Header with Summary Bar -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d1c42]/80 border border-[#22396f] p-5 rounded-2xl shadow-xl">
    <div>
      <h1 class="text-xl font-bold tracking-tight text-[#fcf1d0] flex items-center gap-2">
        <span>📋</span>
        <span>Channel Tasks & SOP Upload Schedule</span>
      </h1>
      <p class="text-xs text-[#8fa2cb] mt-1 font-mono">
        Tracking target kuota 13 channel medsos (Clipper US, Indo & Affiliate) — {data.selectedDate}
      </p>
    </div>

    <!-- Live Progress Counters -->
    <div class="flex items-center gap-6">
      <div class="text-right">
        <div class="text-[11px] font-mono text-[#8fa2cb] uppercase tracking-wider">Video Live</div>
        <div class="text-lg font-bold font-mono text-[#10b981]">
          {progress.completedSlots} / {progress.totalSlots}
          <span class="text-xs text-[#8fa2cb] font-normal">({progress.percentage}%)</span>
        </div>
      </div>

      <div class="h-8 w-px bg-[#22396f]"></div>

      <div class="text-right">
        <div class="text-[11px] font-mono text-[#8fa2cb] uppercase tracking-wider">Bounty Submitted</div>
        <div class="text-lg font-bold font-mono text-[#00e5ff]">
          {progress.bountySubmitted}
        </div>
      </div>
    </div>
  </div>

  <!-- Filters & Search Toolbar -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#071330] p-3 rounded-xl border border-[#22396f]/60">
    <!-- Category Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
      <button
        onclick={() => (filterCategory = 'ALL')}
        class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {filterCategory === 'ALL'
          ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow'
          : 'text-[#8fa2cb] hover:bg-[#0d1c42]'}"
      >
        Semua (13)
      </button>
      <button
        onclick={() => (filterCategory = 'clipper_us')}
        class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {filterCategory === 'clipper_us'
          ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow'
          : 'text-[#8fa2cb] hover:bg-[#0d1c42]'}"
      >
        🇺🇸 Clipper US (10)
      </button>
      <button
        onclick={() => (filterCategory = 'clipper_indo')}
        class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {filterCategory === 'clipper_indo'
          ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow'
          : 'text-[#8fa2cb] hover:bg-[#0d1c42]'}"
      >
        🇮🇩 Clipper Indo (2)
      </button>
      <button
        onclick={() => (filterCategory = 'affiliate')}
        class="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors {filterCategory === 'affiliate'
          ? 'bg-[#22396f] text-[#fcf1d0] font-bold shadow'
          : 'text-[#8fa2cb] hover:bg-[#0d1c42]'}"
      >
        🛒 Affiliate (1)
      </button>
    </div>

    <!-- Search Input -->
    <div class="w-full sm:w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari channel / handle..."
        class="w-full bg-[#0d1c42] border border-[#22396f] rounded-lg px-3 py-1.5 text-xs text-[#fcf1d0] placeholder-[#8fa2cb]/50 focus:outline-none focus:border-[#00e5ff]"
      />
    </div>
  </div>

  <!-- Channel Cards Grid -->
  {#if filteredChannels.length === 0}
    <div class="text-center py-16 text-[#8fa2cb] font-mono text-sm bg-[#071330]/40 rounded-2xl border border-dashed border-[#22396f]">
      Tidak ada channel yang cocok dengan filter.
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {#each filteredChannels as channel (channel.id)}
        <ChannelCard
          {channel}
          date={data.selectedDate}
          logs={data.logs.filter((l: ContentLog) => l.channel_id === channel.id)}
          onEditSlot={(ch, slot) => openEdit(ch, slot)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- Edit Slot Modal Dialog -->
{#if activeChannel}
  <EditSlotDialog
    bind:open={dialogOpen}
    channel={activeChannel}
    slot={activeSlot}
    date={data.selectedDate}
    log={data.logs.find((l: ContentLog) => l.channel_id === activeChannel?.id && l.slot === activeSlot)}
  />
{/if}
