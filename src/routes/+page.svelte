<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { ChevronLeft, ChevronRight, AlertTriangle, Activity } from 'lucide-svelte';
  import { createClient } from '@supabase/supabase-js';
  import ChannelCard from '#lib/components/ChannelCard.svelte';
  import EditSlotDialog from '#lib/components/EditSlotDialog.svelte';
  import AgentBrainDialog from '#lib/components/AgentBrainDialog.svelte';
  import { getExpectedSlots } from '#lib/slots.js';
  import type { Channel, ContentLog, SlotTime } from '#lib/types.js';
  import type { AgentProfile } from '#lib/agents.js';

  let { data } = $props();

  // --- Agents from server (DB or fallback) ---
  let agents = $derived(data.agents);

  // --- Supabase Realtime (client-side, publishable key only) ---
  let realtimeCleanup: (() => void) | null = null;

  onMount(() => {
    const sbUrl = data.supabaseUrl;
    const sbKey = data.supabaseKey;
    if (!sbUrl || !sbKey) return;

    const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false } });

    const channel = sb.channel('agency-ops-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        invalidateAll(); // re-run server load
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_memories' }, () => {
        invalidateAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_logs' }, () => {
        invalidateAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        invalidateAll();
      })
      .subscribe();

    realtimeCleanup = () => { sb.removeChannel(channel); };
  });

  onDestroy(() => { realtimeCleanup?.(); });

  // --- Channel / CMS state ---
  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'clipper_us', label: 'US Shorts' },
    { id: 'clipper_indo', label: 'Indo' },
    { id: 'affiliate', label: 'Affiliate' }
  ] as const;
  let filter = $state<(typeof categories)[number]['id']>('all');

  const logsByChannel = $derived.by(() => {
    const m = new Map<string, ContentLog[]>();
    for (const l of data.logs) m.set(l.channel_id, [...(m.get(l.channel_id) ?? []), l]);
    return m;
  });

  const stats = $derived.by(() => {
    let expected = 0, live = 0, bountyExpected = 0, submitted = 0;
    for (const ch of data.channels) {
      const slots = getExpectedSlots(ch.category, data.selectedDate);
      const logs = logsByChannel.get(ch.id) ?? [];
      const isBounty = !!ch.bounty_platform && ch.bounty_platform !== 'Internal' && ch.category === 'clipper_us';
      for (const slot of slots) {
        const st = logs.find((l) => l.slot === slot)?.status;
        if (st === 'OFF') continue;
        expected++;
        if (isBounty) bountyExpected++;
        if (st === 'UPLOADED' || st === 'SUBMITTED') live++;
        if (isBounty && st === 'SUBMITTED') submitted++;
      }
    }
    return { expected, live, bountyExpected, submitted, pct: expected ? Math.round((live / expected) * 100) : 0 };
  });

  const jakartaHour = () => Number(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }));
  const overdue = $derived(
    (data.selectedDate < data.today || (data.selectedDate === data.today && jakartaHour() >= 21)) && stats.live < stats.expected
  );

  const visible = $derived(filter === 'all' ? data.channels : data.channels.filter((c) => c.category === filter));

  function shiftDate(days: number) {
    const d = new Date(data.selectedDate + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    goto(`?date=${d.toISOString().slice(0, 10)}`, { reset: false });
  }

  const dateLabel = $derived(
    new Date(data.selectedDate + 'T00:00:00Z').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })
  );

  let dialogOpen = $state(false);
  let editing = $state<{ channel: Channel; slot: SlotTime; log?: ContentLog } | null>(null);
  function onEditSlot(channel: Channel, slot: SlotTime, log?: ContentLog) {
    editing = { channel, slot, log };
    dialogOpen = true;
  }

  // --- 3D HQ (desktop only) ---
  let isDesktop = $state(false);
  let OfficeScene = $state<any>(null);
  let agentDialogOpen = $state(false);
  let selectedAgent = $state<AgentProfile | null>(null);

  onMount(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    isDesktop = mq.matches;
    const mqHandler = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
      if (e.matches && !OfficeScene) {
        import('#lib/components/OfficeScene.svelte').then((m) => (OfficeScene = m.default));
      }
    };
    mq.addEventListener('change', mqHandler);
    if (mq.matches) {
      import('#lib/components/OfficeScene.svelte').then((m) => (OfficeScene = m.default));
    }
  });

  function onAgentClick(agent: AgentProfile) {
    selectedAgent = agent;
    agentDialogOpen = true;
  }

  // Keep selectedAgent in sync when data refreshes (realtime)
  $effect(() => {
    if (selectedAgent && agents.length) {
      const fresh = agents.find(a => a.slug === selectedAgent!.slug);
      if (fresh) selectedAgent = fresh;
    }
  });

  const timeAgo = (iso: string) => {
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    return m < 1 ? 'baru saja' : m < 60 ? `${m}m lalu` : m < 1440 ? `${Math.floor(m / 60)}j lalu` : `${Math.floor(m / 1440)}h lalu`;
  };
</script>

<main class="mx-auto max-w-7xl px-4 py-5 font-mono flex flex-col gap-4">
  <header class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-base font-bold text-[#fcf1d0]">Agency Ops</h1>
      <p class="text-[11px] text-[#8fa2cb]">Progress upload harian {data.channels.length} channel</p>
    </div>

    <div class="flex items-center gap-1 rounded-xl border border-[#22396f] bg-[#0d1c42] p-1">
      <button type="button" onclick={() => shiftDate(-1)} aria-label="Hari sebelumnya" class="p-1.5 rounded-lg text-[#8fa2cb] hover:text-[#fcf1d0] hover:bg-[#22396f]/40">
        <ChevronLeft size={16} />
      </button>
      <input
        type="date"
        value={data.selectedDate}
        onchange={(e) => goto(`?date=${e.currentTarget.value}`, { reset: false })}
        aria-label="Pilih tanggal"
        class="bg-transparent text-xs text-[#fcf1d0] px-1 [color-scheme:dark] focus:outline-none"
      />
      <button type="button" onclick={() => shiftDate(1)} aria-label="Hari berikutnya" class="p-1.5 rounded-lg text-[#8fa2cb] hover:text-[#fcf1d0] hover:bg-[#22396f]/40">
        <ChevronRight size={16} />
      </button>
      {#if data.selectedDate !== data.today}
        <a href="/" class="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#22396f] text-[#fcf1d0]">Hari ini</a>
      {/if}
    </div>
  </header>

  {#if isDesktop && OfficeScene}
    <section aria-label="Virtual HQ 3D" class="hidden md:block">
      <OfficeScene {onAgentClick} agents={agents} />
    </section>
  {/if}

  {#if data.error}
    <p role="alert" class="text-xs text-rose-300 bg-rose-950/60 border border-rose-800 rounded-xl px-4 py-3">Database error: {data.error}</p>
  {/if}

  <section class="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Ringkasan hari ini">
    <div class="sm:col-span-2 rounded-2xl bg-[#0d1c42] border border-[#22396f]/60 p-4">
      <div class="flex items-baseline justify-between">
        <span class="text-[11px] text-[#8fa2cb] capitalize">{dateLabel}</span>
        <span class="text-xs font-bold text-[#fcf1d0]">{stats.pct}%</span>
      </div>
      <div class="mt-1 text-2xl font-bold text-[#fcf1d0]">
        {stats.live}<span class="text-[#8fa2cb] text-base">/{stats.expected} video live</span>
      </div>
      <div class="mt-3 h-2 rounded-full bg-[#010736] overflow-hidden" role="progressbar" aria-valuenow={stats.pct} aria-valuemin={0} aria-valuemax={100}>
        <div class="h-full rounded-full transition-all {stats.pct === 100 ? 'bg-emerald-400' : 'bg-[#fcf1d0]'}" style="width: {stats.pct}%"></div>
      </div>
    </div>

    <div class="rounded-2xl bg-[#0d1c42] border p-4 flex flex-col justify-between {overdue ? 'border-rose-600' : 'border-[#22396f]/60'}">
      <span class="text-[11px] text-[#8fa2cb]">Bounty submitted</span>
      <div class="text-2xl font-bold text-[#fcf1d0]">
        {stats.submitted}<span class="text-[#8fa2cb] text-base">/{stats.bountyExpected}</span>
      </div>
      {#if overdue}
        <span class="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-300">
          <AlertTriangle size={12} /> {stats.expected - stats.live} slot lewat jam 21:00
        </span>
      {/if}
    </div>
  </section>

  <nav class="flex gap-1.5 overflow-x-auto pb-1" aria-label="Filter lini bisnis">
    {#each categories as c}
      <button
        type="button"
        onclick={() => (filter = c.id)}
        aria-pressed={filter === c.id}
        class="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition {filter === c.id ? 'bg-[#fcf1d0] text-[#010736] border-[#fcf1d0]' : 'bg-[#0d1c42] text-[#8fa2cb] border-[#22396f]/60 hover:text-[#fcf1d0]'}"
      >
        {c.label}
      </button>
    {/each}
  </nav>

  <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
    <section class="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Channel">
      {#each visible as channel (channel.id)}
        <ChannelCard {channel} date={data.selectedDate} logs={logsByChannel.get(channel.id) ?? []} {onEditSlot} />
      {:else}
        <p class="text-xs text-[#8fa2cb] col-span-full">Belum ada channel aktif.</p>
      {/each}
    </section>

    <aside class="rounded-2xl bg-[#0d1c42] border border-[#22396f]/60 p-4 lg:sticky lg:top-4">
      <h2 class="flex items-center gap-1.5 text-xs font-bold text-[#fcf1d0] mb-3"><Activity size={13} /> Aktivitas terbaru</h2>
      <ul class="flex flex-col gap-2.5">
        {#each data.activity as a (a.id)}
          <li class="text-[11px] leading-snug border-l-2 border-[#22396f] pl-2.5">
            <div class="text-[#fcf1d0]"><b>{a.actor}</b> · {a.channel_slug} · {a.action}</div>
            {#if a.details}<div class="text-[#8fa2cb] truncate">{a.details}</div>{/if}
            <div class="text-[10px] text-[#8fa2cb]/60">{timeAgo(a.created_at)}</div>
          </li>
        {:else}
          <li class="text-[11px] text-[#8fa2cb]">Belum ada aktivitas.</li>
        {/each}
      </ul>
    </aside>
  </div>
</main>

{#if editing}
  <EditSlotDialog bind:open={dialogOpen} onClose={() => { dialogOpen = false; editing = null; }} channel={editing.channel} slot={editing.slot} date={data.selectedDate} log={editing.log} />
{/if}

<AgentBrainDialog bind:open={agentDialogOpen} agent={selectedAgent} />
