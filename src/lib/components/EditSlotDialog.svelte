<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { X, ExternalLink, CheckCircle2, Loader2 } from 'lucide-svelte';
  import type { Channel, ContentLog, SlotTime, ContentStatus } from '../types';
  import { getSlotLabel } from '../slots';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

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

  const statuses: Array<{ id: ContentStatus; label: string; dotClass: string; class: string }> = [
    { id: 'DRAFT', label: 'Draft / Belum', dotClass: 'bg-rose-500', class: 'border-rose-300 hover:bg-rose-50 text-rose-800' },
    { id: 'READY', label: 'Ready di Storage', dotClass: 'bg-amber-500', class: 'border-amber-300 hover:bg-amber-50 text-amber-800' },
    { id: 'UPLOADED', label: 'Video Uploaded', dotClass: 'bg-teal-500', class: 'border-teal-300 hover:bg-teal-50 text-teal-800' },
    { id: 'SUBMITTED', label: 'Bounty Submitted', dotClass: 'bg-emerald-500', class: 'border-emerald-300 hover:bg-emerald-50 text-emerald-800' },
    { id: 'ON_HOLD', label: 'On Hold (Eval)', dotClass: 'bg-purple-500', class: 'border-purple-300 hover:bg-purple-50 text-purple-800' },
    { id: 'OFF', label: 'Off / Libur', dotClass: 'bg-slate-400', class: 'border-slate-300 hover:bg-slate-50 text-slate-700' }
  ];
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-all" />
    <Dialog.Content class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-[#ffffff] p-6 border border-[#d9cfc7] shadow-2xl font-mono text-[#2d2b28] max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3.5 border-b border-[#d9cfc7]">
        <div>
          <Dialog.Title class="text-base font-bold flex items-center gap-2">
            <span>{channel.name}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-[#efe9e3] border border-[#d9cfc7] text-[#7a756f]">{channel.handle || channel.slug}</span>
          </Dialog.Title>
          <Dialog.Description class="text-xs sm:text-sm text-[#7a756f] mt-1">
            Slot {slotInfo.label} ({slotInfo.time}) • {date}
          </Dialog.Description>
        </div>
        <Dialog.Close class="p-1.5 rounded-lg text-[#7a756f] hover:text-[#2d2b28] hover:bg-[#efe9e3]">
          <X size={18} />
        </Dialog.Close>
      </div>

      <form
        method="POST"
        action={`?date=${date}&/updateSlot`}
        class="mt-5 flex flex-col gap-3.5"
        use:enhance={() => {
          saving = true;
          errorMsg = '';
          return async ({ result }) => {
            saving = false;
            if (result.type === 'success' || result.type === 'redirect') {
              open = false;
              onClose();
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
        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold text-[#7a756f] uppercase tracking-wider">Status Konten</span>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {#each statuses as item}
              <button
                type="button"
                onclick={() => status = item.id}
                class="py-2 px-2.5 rounded-xl text-xs font-bold border transition text-left flex items-center gap-2 {status === item.id ? 'bg-[#2d2b28] border-[#2d2b28] text-white shadow-sm' : `bg-[#f9f8f6] ${item.class}`}"
              >
                <span class="w-2.5 h-2.5 rounded-full {item.dotClass} shrink-0"></span>
                <span class="truncate">{item.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Video Title -->
        <div class="flex flex-col gap-1.5">
          <label for="video_title" class="text-xs font-bold text-[#7a756f]">Judul Video / Topik</label>
          <input
            id="video_title"
            name="video_title"
            bind:value={videoTitle}
            placeholder="Contoh: Ahmed Klip 14 - Corporate Dating"
            class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#2d2b28] placeholder:text-[#7a756f]/50 focus:outline-none focus:border-[#8f7556]"
          />
        </div>

        <!-- Public Video URL -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label for="video_url" class="text-xs font-bold text-[#7a756f]">Link Video Medsos (Shorts / TikTok / Pin)</label>
            {#if videoUrl}
              <a href={videoUrl} target="_blank" rel="noreferrer" class="text-xs text-[#8f7556] hover:underline flex items-center gap-1 font-bold">
                <span>Buka</span>
                <ExternalLink size={12} />
              </a>
            {/if}
          </div>
          <input
            id="video_url"
            name="video_url"
            type="url"
            bind:value={videoUrl}
            placeholder="https://youtube.com/shorts/... atau https://tiktok.com/..."
            class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#2d2b28] placeholder:text-[#7a756f]/50 focus:outline-none focus:border-[#8f7556]"
          />
        </div>

        <!-- Bounty Submission URL (If Bounty Channel) -->
        {#if channel.bounty_platform && channel.bounty_platform !== 'Internal'}
          <div class="flex flex-col gap-1.5 p-3 bg-[#f9f8f6] rounded-xl border border-[#d9cfc7]">
            <div class="flex items-center justify-between">
              <label for="bounty_url" class="text-xs font-bold text-[#2d2b28]">
                Link Bukti Submission Bounty ({channel.bounty_platform})
              </label>
              {#if bountyUrl}
                <a href={bountyUrl} target="_blank" rel="noreferrer" class="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-bold">
                  <span>Cek Bounty</span>
                  <ExternalLink size={12} />
                </a>
              {/if}
            </div>
            <input
              id="bounty_url"
              name="bounty_submission_url"
              type="url"
              bind:value={bountyUrl}
              placeholder="https://whop.com/checkout/... atau bukti form submit"
              class="w-full bg-[#ffffff] border border-[#d9cfc7] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#2d2b28] placeholder:text-[#7a756f]/50 focus:outline-none focus:border-[#8f7556]"
            />
            <span class="text-xs text-[#7a756f]">Wajib disubmit langsung setelah upload agar link tidak kadaluarsa!</span>
          </div>
        {/if}

        <!-- Raw Drive URL & PIC -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="drive_url" class="text-xs font-bold text-[#7a756f]">Link Google Drive (Opsional)</label>
            <input
              id="drive_url"
              name="drive_url"
              type="url"
              bind:value={driveUrl}
              placeholder="https://drive.google.com/..."
              class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2d2b28] placeholder:text-[#7a756f]/50 focus:outline-none focus:border-[#8f7556]"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="pic_name" class="text-xs font-bold text-[#7a756f]">PIC Operator / Tim</label>
            <input
              id="pic_name"
              name="pic_name"
              bind:value={picName}
              placeholder="Nama Editor"
              class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2d2b28] placeholder:text-[#7a756f]/50 focus:outline-none focus:border-[#8f7556]"
            />
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-1.5">
          <label for="notes" class="text-xs font-bold text-[#7a756f]">Catatan Evaluasi (Opsional)</label>
          <input
            id="notes"
            name="notes"
            bind:value={notes}
            placeholder="Catatan kendala, sound trending yang dipakai, dll"
            class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2d2b28] placeholder:text-[#7a756f]/50 focus:outline-none focus:border-[#8f7556]"
          />
        </div>

        {#if errorMsg}
          <p role="alert" class="text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 font-bold">{errorMsg}</p>
        {/if}

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-3.5 border-t border-[#d9cfc7] mt-1">
          <button
            type="button"
            onclick={() => open = false}
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#7a756f] hover:text-[#2d2b28] hover:bg-[#efe9e3] transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2d2b28] hover:bg-[#1c1917] text-white transition shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-60"
          >
            {#if saving}
              <Loader2 size={16} class="animate-spin" />
            {:else}
              <CheckCircle2 size={16} />
            {/if}
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
