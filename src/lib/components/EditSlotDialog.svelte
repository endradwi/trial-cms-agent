<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { X, ExternalLink, CheckCircle2, Loader2 } from 'lucide-svelte';
  import type { Channel, ContentLog, SlotTime, ContentStatus } from '../types';
  import { getSlotLabel } from '../slots';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { applyAction } from '$app/forms';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    channel: Channel;
    slot: SlotTime;
    date: string;
    log?: ContentLog;
  }

  let {
    open = $bindable(false),
    onClose = () => {},
    channel,
    slot,
    date,
    log
  }: Props = $props();

  const slotInfo = $derived(getSlotLabel(slot));

  let status = $state<ContentStatus>('DRAFT');
  let videoTitle = $state('');
  let videoUrl = $state('');
  let driveUrl = $state('');
  let bountyUrl = $state('');
  let picName = $state('Tim');
  let notes = $state('');
  let saving = $state(false);
  let errorMsg = $state('');

  $effect(() => {
    if (open) {
      status = log?.status || 'DRAFT';
      videoTitle = log?.video_title || '';
      videoUrl = log?.video_url || '';
      driveUrl = log?.drive_url || '';
      bountyUrl = log?.bounty_submission_url || '';
      picName = log?.pic_name || 'Tim';
      notes = log?.notes || '';
      errorMsg = '';
    }
  });

  const statuses: Array<{ id: ContentStatus; label: string; icon: string; class: string }> = [
    { id: 'DRAFT', label: 'Draft / Belum', icon: '⚪', class: 'border-rose-700/50 hover:bg-rose-950/40 text-rose-300' },
    { id: 'READY', label: 'Ready di Storage', icon: '🟡', class: 'border-amber-700/50 hover:bg-amber-950/40 text-amber-300' },
    { id: 'UPLOADED', label: 'Video Uploaded', icon: '🟢', class: 'border-teal-700/50 hover:bg-teal-950/40 text-teal-300' },
    { id: 'SUBMITTED', label: 'Bounty Submitted', icon: '🚀', class: 'border-emerald-600 hover:bg-emerald-950/40 text-emerald-300' },
    { id: 'ON_HOLD', label: 'On Hold (Eval)', icon: '⏸️', class: 'border-purple-700/50 hover:bg-purple-950/40 text-purple-300' },
    { id: 'OFF', label: 'Off / Libur', icon: '⛔', class: 'border-slate-700 hover:bg-slate-900 text-slate-400' }
  ];
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all" />
    <Dialog.Content class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-[#0d1c42] p-5 border border-[#22396f] shadow-2xl font-mono text-[#fcf1d0] max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-[#22396f]/40">
        <div>
          <Dialog.Title class="text-sm font-bold flex items-center gap-2">
            <span>{channel.name}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-[#010736] border border-[#22396f] text-[#8fa2cb]">{channel.handle || channel.slug}</span>
          </Dialog.Title>
          <Dialog.Description class="text-xs text-[#8fa2cb] mt-0.5">
            Slot {slotInfo.label} ({slotInfo.time}) • {date}
          </Dialog.Description>
        </div>
        <Dialog.Close class="p-1 rounded-lg text-[#8fa2cb] hover:text-[#fcf1d0] hover:bg-[#22396f]/30">
          <X size={16} />
        </Dialog.Close>
      </div>

      <form
        method="POST"
        action={`?date=${date}&/updateSlot`}
        class="mt-4 flex flex-col gap-3"
        use:enhance={() => {
          saving = true;
          errorMsg = '';
          return async ({ result }) => {
            saving = false;
            if (result.type === 'success') {
              open = false; onClose();
              await invalidateAll();
            } else if (result.type === 'redirect') {
              open = false; onClose();
              await invalidateAll();
            } else if (result.type === 'failure') {
              errorMsg = String(result.data?.error ?? 'Gagal menyimpan');
            } else if (result.type === 'error') {
              errorMsg = result.error?.message ?? 'Server error';
            }
          };
        }}
      >
        <input type="hidden" name="channel_id" value={channel.id} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="slot" value={slot} />
        <input type="hidden" name="status" value={status} />

        <!-- Status Selector Grid -->
        <div class="flex flex-col gap-1.5">
          <span class="text-[11px] font-bold text-[#8fa2cb] uppercase">Status Konten</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {#each statuses as item}
              <button
                type="button"
                onclick={() => status = item.id}
                class="py-1.5 px-2 rounded-lg text-[10px] font-bold border transition text-left flex items-center gap-1.5 {status === item.id ? 'bg-[#22396f] border-[#fcf1d0] text-[#fcf1d0] shadow-md ring-1 ring-[#fcf1d0]/50' : `bg-[#010736] ${item.class}`}"
              >
                <span>{item.icon}</span>
                <span class="truncate">{item.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Video Title -->
        <div class="flex flex-col gap-1">
          <label for="video_title" class="text-[11px] font-bold text-[#8fa2cb]">Judul Video / Topik</label>
          <input
            id="video_title"
            name="video_title"
            bind:value={videoTitle}
            placeholder="Contoh: Ahmed Klip 14 - Corporate Dating"
            class="w-full bg-[#010736] border border-[#22396f]/60 rounded-xl px-3 py-2 text-xs text-[#fcf1d0] placeholder:text-[#8fa2cb]/40 focus:outline-none focus:border-[#fcf1d0]"
          />
        </div>

        <!-- Public Video URL -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <label for="video_url" class="text-[11px] font-bold text-[#8fa2cb]">Link Video Medsos (Shorts / TikTok / Pin)</label>
            {#if videoUrl}
              <a href={videoUrl} target="_blank" rel="noreferrer" class="text-[10px] text-[#fcf1d0] hover:underline flex items-center gap-1">
                <span>Buka</span>
                <ExternalLink size={10} />
              </a>
            {/if}
          </div>
          <input
            id="video_url"
            name="video_url"
            type="url"
            bind:value={videoUrl}
            placeholder="https://youtube.com/shorts/... atau https://tiktok.com/..."
            class="w-full bg-[#010736] border border-[#22396f]/60 rounded-xl px-3 py-2 text-xs text-[#fcf1d0] placeholder:text-[#8fa2cb]/40 focus:outline-none focus:border-[#fcf1d0]"
          />
        </div>

        <!-- Bounty Submission URL (If Bounty Channel) -->
        {#if channel.bounty_platform && channel.bounty_platform !== 'Internal'}
          <div class="flex flex-col gap-1 p-2.5 bg-[#010736]/60 rounded-xl border border-[#22396f]/40">
            <div class="flex items-center justify-between">
              <label for="bounty_url" class="text-[11px] font-bold text-[#fcf1d0]">
                Link Bukti Submission Bounty ({channel.bounty_platform})
              </label>
              {#if bountyUrl}
                <a href={bountyUrl} target="_blank" rel="noreferrer" class="text-[10px] text-emerald-300 hover:underline flex items-center gap-1">
                  <span>Cek Bounty</span>
                  <ExternalLink size={10} />
                </a>
              {/if}
            </div>
            <input
              id="bounty_url"
              name="bounty_submission_url"
              type="url"
              bind:value={bountyUrl}
              placeholder="https://whop.com/checkout/... atau bukti form submit"
              class="w-full bg-[#010736] border border-[#22396f]/60 rounded-lg px-2.5 py-1.5 text-xs text-[#fcf1d0] placeholder:text-[#8fa2cb]/40 focus:outline-none focus:border-[#fcf1d0]"
            />
            <span class="text-[9px] text-[#8fa2cb]">Wajib disubmit langsung setelah upload agar link tidak kadaluarsa!</span>
          </div>
        {/if}

        <!-- Raw Drive URL & PIC -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label for="drive_url" class="text-[11px] font-bold text-[#8fa2cb]">Link Google Drive (Opsional)</label>
            <input
              id="drive_url"
              name="drive_url"
              type="url"
              bind:value={driveUrl}
              placeholder="https://drive.google.com/..."
              class="w-full bg-[#010736] border border-[#22396f]/60 rounded-xl px-3 py-1.5 text-xs text-[#fcf1d0] placeholder:text-[#8fa2cb]/40 focus:outline-none focus:border-[#fcf1d0]"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="pic_name" class="text-[11px] font-bold text-[#8fa2cb]">PIC Operator / Tim</label>
            <input
              id="pic_name"
              name="pic_name"
              bind:value={picName}
              placeholder="Nama Editor"
              class="w-full bg-[#010736] border border-[#22396f]/60 rounded-xl px-3 py-1.5 text-xs text-[#fcf1d0] placeholder:text-[#8fa2cb]/40 focus:outline-none focus:border-[#fcf1d0]"
            />
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-1">
          <label for="notes" class="text-[11px] font-bold text-[#8fa2cb]">Catatan Evaluasi (Opsional)</label>
          <input
            id="notes"
            name="notes"
            bind:value={notes}
            placeholder="Catatan kendala, sound trending yang dipakai, dll"
            class="w-full bg-[#010736] border border-[#22396f]/60 rounded-xl px-3 py-1.5 text-xs text-[#fcf1d0] placeholder:text-[#8fa2cb]/40 focus:outline-none focus:border-[#fcf1d0]"
          />
        </div>

        {#if errorMsg}
          <p role="alert" class="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg px-3 py-2">{errorMsg}</p>
        {/if}

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#22396f]/40 mt-1">
          <button
            type="button"
            onclick={() => open = false}
            class="px-4 py-2 rounded-xl text-xs font-bold text-[#8fa2cb] hover:text-[#fcf1d0] hover:bg-[#22396f]/20 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            class="px-5 py-2 rounded-xl text-xs font-bold bg-[#fcf1d0] hover:bg-[#ebdca6] text-[#010736] transition shadow-lg flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
          >
            {#if saving}
              <Loader2 size={14} class="animate-spin" />
            {:else}
              <CheckCircle2 size={14} />
            {/if}
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
