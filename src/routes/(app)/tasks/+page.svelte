<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createClient } from '@supabase/supabase-js';
  import { invalidateAll } from '$app/navigation';
  import ChannelCard from '#lib/components/ChannelCard.svelte';
  import EditSlotDialog from '#lib/components/EditSlotDialog.svelte';
  import { totalSlotsForChannel, calculateLiveProgress } from '#lib/slots.js';
  import type { Channel, ContentLog, SlotTime } from '#lib/types.js';
  import { ListTodo } from 'lucide-svelte';

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

<svelte:head>
  <title>Channel Tasks & SOP Upload — Option Agency</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
  <!-- Top Header with Summary Bar (Bright Palette) -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-[#ffffff] border border-[#d9cfc7] p-6 sm:p-7 rounded-2xl shadow-xs">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d2b28] flex items-center gap-2.5">
        <ListTodo size={24} class="text-[#8f7556]" />
        <span>Channel Tasks & SOP Upload Schedule</span>
      </h1>
      <p class="text-sm text-[#7a756f] mt-1.5 font-mono">
        Tracking target kuota 13 channel medsos (Clipper US, Indo & Affiliate) — {data.selectedDate}
      </p>
    </div>

    <!-- Live Progress Counters -->
    <div class="flex items-center gap-6 shrink-0">
      <div class="text-right">
        <div class="text-xs font-mono text-[#7a756f] uppercase tracking-wider font-bold">Video Live</div>
        <div class="text-2xl sm:text-3xl font-bold font-mono text-[#059669]">
          {progress.completedSlots} / {progress.totalSlots}
          <span class="text-sm text-[#7a756f] font-normal">({progress.percentage}%)</span>
        </div>
      </div>

      <div class="h-10 w-px bg-[#d9cfc7]"></div>

      <div class="text-right">
        <div class="text-xs font-mono text-[#7a756f] uppercase tracking-wider font-bold">Bounty Submitted</div>
        <div class="text-2xl sm:text-3xl font-bold font-mono text-[#8f7556]">
          {progress.bountySubmitted}
        </div>
      </div>
    </div>
  </div>

  <!-- Filters & Search Toolbar -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-[#ffffff] p-4 rounded-2xl border border-[#d9cfc7] shadow-2xs">
    <!-- Category Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
      <button
        onclick={() => (filterCategory = 'ALL')}
        class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-colors {filterCategory === 'ALL'
          ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
          : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
      >
        Semua (13)
      </button>
      <button
        onclick={() => (filterCategory = 'clipper_us')}
        class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-colors {filterCategory === 'clipper_us'
          ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
          : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
      >
        Clipper US (10)
      </button>
      <button
        onclick={() => (filterCategory = 'clipper_indo')}
        class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-colors {filterCategory === 'clipper_indo'
          ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
          : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
      >
        Clipper Indo (2)
      </button>
      <button
        onclick={() => (filterCategory = 'affiliate')}
        class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono transition-colors {filterCategory === 'affiliate'
          ? 'bg-[#2d2b28] text-white font-bold shadow-xs'
          : 'text-[#7a756f] hover:bg-[#efe9e3]'}"
      >
        Affiliate (1)
      </button>
    </div>

    <!-- Search Input -->
    <div class="w-full sm:w-72">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari channel / handle..."
        class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#2d2b28] placeholder-[#7a756f]/60 focus:outline-none focus:border-[#8f7556]"
      />
    </div>
  </div>

  <!-- Channel Cards Grid -->
  {#if filteredChannels.length === 0}
    <div class="text-center py-16 text-[#7a756f] font-mono text-sm bg-[#ffffff] rounded-2xl border border-dashed border-[#d9cfc7]">
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
