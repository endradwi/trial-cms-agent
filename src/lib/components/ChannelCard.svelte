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
        return { label: 'US Bounty Shorts', bg: 'bg-rose-50 border-rose-300 text-rose-800' };
      case 'clipper_indo':
        return { label: 'Indo Clipper', bg: 'bg-blue-50 border-blue-300 text-blue-800' };
      case 'affiliate':
        return { label: 'Affiliate', bg: 'bg-amber-50 border-amber-300 text-amber-800' };
      default:
        return { label: channel.category, bg: 'bg-gray-100 border-gray-300 text-gray-800' };
    }
  });
</script>

<div class="p-4 rounded-2xl bg-[#ffffff] border {isAllDone ? 'border-emerald-500 shadow-xs' : 'border-[#d9cfc7]'} flex flex-col justify-between gap-3 shadow-xs transition-all hover:border-[#c9b59c]">
  <!-- Channel Header -->
  <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-[#d9cfc7]">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="font-bold text-sm text-[#2d2b28] truncate">{channel.name}</h3>
        <span class="text-[9px] px-1.5 py-0.5 rounded border font-bold font-mono {categoryBadge.bg}">
          {categoryBadge.label}
        </span>
      </div>
      <div class="flex items-center gap-2 mt-0.5 text-xs text-[#7a756f] font-mono">
        <span class="truncate">{channel.handle || channel.slug}</span>
        <span>•</span>
        <span class="truncate text-[11px] text-[#7a756f]">{channel.niche}</span>
      </div>
    </div>

    <!-- Daily Quota Pill -->
    <div class="flex flex-col items-end flex-shrink-0 font-mono">
      <span class="text-[11px] px-2 py-0.5 rounded-full border font-bold {isAllDone ? 'bg-emerald-50 text-emerald-800 border-emerald-400' : 'bg-[#efe9e3] text-[#2d2b28] border-[#d9cfc7]'}">
        {completedCount}/{expectedSlots.length} Live
      </span>
      {#if channel.bounty_platform && channel.bounty_platform !== 'Internal'}
        <span class="text-[9px] text-[#7a756f] mt-1">
          Bounty: <span class="text-[#8f7556] font-bold">{channel.bounty_platform}</span>
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
        class="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 {isDone ? 'bg-[#ffffff] border-emerald-400 hover:border-emerald-600' : 'bg-[#f9f8f6] border-[#d9cfc7] hover:border-[#c9b59c]'}"
      >
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">{slotInfo.icon}</span>
            <span class="font-bold text-[#2d2b28]">{slotInfo.label}</span>
            <span class="text-[10px] text-[#7a756f] hidden sm:inline">({slotInfo.time})</span>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border {statusStyle.bg} {statusStyle.text} {statusStyle.border}">
              {statusStyle.label}
            </span>
            <Edit3 size={12} class="text-[#7a756f]" aria-hidden="true" />
          </div>
        </div>

        {#if log?.video_title || log?.video_url || log?.bounty_submission_url}
          <div class="flex flex-col gap-1 pt-1 border-t border-[#d9cfc7]/60 text-[11px]">
            {#if log.video_title}
              <div class="text-[#2d2b28] truncate font-medium">
                "{log.video_title}"
              </div>
            {/if}

            <div class="flex items-center justify-between text-[10px] text-[#7a756f]">
              <div class="flex items-center gap-2">
                {#if log.video_url}
                  <a
                    href={log.video_url}
                    target="_blank"
                    rel="noreferrer"
                    onclick={(e) => e.stopPropagation()}
                    class="text-[#8f7556] hover:underline flex items-center gap-0.5 font-bold"
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
                    onclick={(e) => e.stopPropagation()}
                    class="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <span>Bukti Bounty</span>
                    <ExternalLink size={10} />
                  </a>
                {/if}
              </div>

              {#if log.pic_name}
                <span class="text-[#7a756f]">PIC: {log.pic_name}</span>
              {/if}
            </div>
          </div>
        {:else}
          <div class="text-[10px] text-[#7a756f] italic">
            Klik untuk input link video & ganti status
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
