<script lang="ts">
  import type { Channel, ContentLog, SlotTime } from '../types';
  import { getExpectedSlots, getSlotLabel, getStatusStyle } from '../slots';
  import { ExternalLink, Edit3 } from 'lucide-svelte';

  let {
    channel,
    date,
    logs = [],
    onEditSlot
  }: {
    channel: Channel;
    date: string;
    logs: ContentLog[];
    onEditSlot: (channel: Channel, slot: SlotTime, currentLog?: ContentLog) => void;
  } = $props();

  const expectedSlots = $derived(getExpectedSlots(channel.category, date));

  const logsBySlot = $derived.by(() => {
    const map = new Map<SlotTime, ContentLog>();
    for (const log of logs) {
      map.set(log.slot, log);
    }
    return map;
  });

  const completedCount = $derived.by(() => {
    let count = 0;
    for (const slot of expectedSlots) {
      const l = logsBySlot.get(slot);
      if (l && (l.status === 'UPLOADED' || l.status === 'SUBMITTED')) {
        count++;
      }
    }
    return count;
  });

  const isAllDone = $derived(completedCount >= expectedSlots.length && expectedSlots.length > 0);

  const categoryBadge = $derived.by(() => {
    switch (channel.category) {
      case 'clipper_us':
        return { label: 'US Bounty Shorts', bg: 'bg-red-950/70 border-red-700/50 text-red-300' };
      case 'clipper_indo':
        return { label: 'Indo Clipper', bg: 'bg-blue-950/70 border-blue-700/50 text-blue-300' };
      case 'affiliate':
        return { label: 'Affiliate', bg: 'bg-emerald-950/70 border-emerald-700/50 text-emerald-300' };
      default:
        return { label: channel.category, bg: 'bg-slate-900 border-slate-700 text-slate-300' };
    }
  });
</script>

<div class="p-4 rounded-2xl bg-[#0d1c42] border {isAllDone ? 'border-emerald-600/70 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-[#22396f]/50'} flex flex-col justify-between gap-3 shadow-xl transition-all">
  <!-- Channel Header -->
  <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-[#22396f]/30">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="font-bold text-sm text-[#fcf1d0] truncate">{channel.name}</h3>
        <span class="text-[9px] px-1.5 py-0.5 rounded border font-bold font-mono {categoryBadge.bg}">
          {categoryBadge.label}
        </span>
      </div>
      <div class="flex items-center gap-2 mt-0.5 text-xs text-[#8fa2cb] font-mono">
        <span class="truncate">{channel.handle || channel.slug}</span>
        <span>•</span>
        <span class="truncate text-[11px] text-[#8fa2cb]/70">{channel.niche}</span>
      </div>
    </div>

    <!-- Daily Quota Pill -->
    <div class="flex flex-col items-end flex-shrink-0 font-mono">
      <span class="text-[11px] px-2 py-0.5 rounded-full border font-bold {isAllDone ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-[#010736] text-[#fcf1d0] border-[#22396f]'}">
        {completedCount}/{expectedSlots.length} Live
      </span>
      {#if channel.bounty_platform && channel.bounty_platform !== 'Internal'}
        <span class="text-[9px] text-[#8fa2cb]/80 mt-1">
          Bounty: <span class="text-[#fcf1d0] font-bold">{channel.bounty_platform}</span>
        </span>
      {/if}
    </div>
  </div>

  <!-- Slots Container -->
  <div class="flex flex-col gap-2 font-mono">
    {#each expectedSlots as slot}
      {@const log = logsBySlot.get(slot)}
      {@const slotInfo = getSlotLabel(slot)}
      {@const statusStyle = getStatusStyle(log?.status || 'DRAFT')}
      {@const isDone = log?.status === 'UPLOADED' || log?.status === 'SUBMITTED'}

      <div
        role="button"
        tabindex="0"
        aria-label="Edit slot {slotInfo.label} {channel.name}"
        onclick={() => onEditSlot(channel, slot, log)}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEditSlot(channel, slot, log))}
        class="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 {isDone ? 'bg-[#010736] border-emerald-800/40 hover:border-emerald-500' : 'bg-[#010736]/80 border-[#22396f]/40 hover:border-[#fcf1d0]/50'}"
      >
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">{slotInfo.icon}</span>
            <span class="font-bold text-[#fcf1d0]">{slotInfo.label}</span>
            <span class="text-[10px] text-[#8fa2cb] hidden sm:inline">({slotInfo.time})</span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border {statusStyle.bg} {statusStyle.text} {statusStyle.border}">
              {statusStyle.label}
            </span>
            <Edit3 size={12} class="text-[#8fa2cb]" aria-hidden="true" />
          </div>
        </div>

        {#if log?.video_title || log?.video_url || log?.bounty_submission_url}
          <div class="flex flex-col gap-1 pt-1 border-t border-[#22396f]/20 text-[11px]">
            {#if log.video_title}
              <div class="text-[#fcf1d0] truncate font-medium">
                "{log.video_title}"
              </div>
            {/if}

            <div class="flex items-center justify-between text-[10px] text-[#8fa2cb]">
              <div class="flex items-center gap-2">
                {#if log.video_url}
                  <a
                    href={log.video_url}
                    target="_blank"
                    rel="noreferrer"
                    onclick={(e: MouseEvent) => e.stopPropagation()}
                    class="text-[#fcf1d0] hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <span>Tonton Video</span>
                    <ExternalLink size={10} />
                  </a>
                {/if}
                {#if log.bounty_submission_url}
                  <a
                    href={log.bounty_submission_url}
                    target="_blank"
                    rel="noreferrer"
                    onclick={(e: MouseEvent) => e.stopPropagation()}
                    class="text-emerald-300 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <span>Bukti Bounty</span>
                    <ExternalLink size={10} />
                  </a>
                {/if}
              </div>

              {#if log.pic_name}
                <span class="text-[#8fa2cb]/70">PIC: {log.pic_name}</span>
              {/if}
            </div>
          </div>
        {:else}
          <div class="text-[10px] text-[#8fa2cb]/50 italic">
            Klik untuk input link video & ganti status
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
