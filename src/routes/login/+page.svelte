<script lang="ts">
  import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-svelte';
  import { enhance } from '$app/forms';

  let { data, form } = $props();
  let showPasscode = $state(false);
  let submitting = $state(false);
</script>

<svelte:head>
  <title>Restricted Access — Agency Ops Virtual HQ</title>
</svelte:head>

<div class="min-h-screen w-screen flex items-center justify-center p-4 bg-[#f9f8f6] font-sans antialiased text-[#2d2b28]">
  <div class="w-full max-w-sm">
    <div class="bg-[#ffffff] border border-[#d9cfc7] rounded-2xl p-6 sm:p-7 shadow-sm">
      <div class="flex items-center justify-between mb-5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9b59c] to-[#8f7556] flex items-center justify-center text-white shadow-xs">
          <Lock size={18} />
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#efe9e3] text-[#8f7556] border border-[#d9cfc7] font-bold">
          INTERNAL ONLY
        </span>
      </div>

      <h1 class="text-xl font-bold tracking-tight text-[#2d2b28]">Agency Ops Console</h1>
      <p class="text-xs text-[#7a756f] mt-1 font-mono">Option Agency — Virtual Headquarters</p>

      {#if form?.error}
        <div class="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
          {form.error}
        </div>
      {/if}

      <form
        method="POST"
        action="?/login"
        use:enhance={() => {
          submitting = true;
          return async ({ update }) => {
            await update();
            submitting = false;
          };
        }}
        class="mt-5 space-y-4"
      >
        <input type="hidden" name="redirect" value={data?.redirectTo ?? '/'} />

        <div>
          <label for="passcode" class="block text-[11px] font-mono uppercase tracking-wider text-[#7a756f] font-bold mb-1.5">
            Team Passcode
          </label>
          <div class="relative">
            <input
              id="passcode"
              name="passcode"
              type={showPasscode ? 'text' : 'password'}
              required
              autocomplete="current-password"
              placeholder="••••••••••••"
              class="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] text-[#2d2b28] text-sm font-mono placeholder:text-[#7a756f]/40 focus:outline-none focus:border-[#8f7556] focus:bg-[#ffffff] transition-colors"
            />
            <button
              type="button"
              onclick={() => (showPasscode = !showPasscode)}
              class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7a756f] hover:text-[#2d2b28]"
              aria-label={showPasscode ? 'Sembunyikan passcode' : 'Lihat passcode'}
            >
              {#if showPasscode}
                <EyeOff size={16} />
              {:else}
                <Eye size={16} />
              {/if}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          class="w-full py-2.5 px-4 rounded-xl bg-[#2d2b28] hover:bg-[#1a1917] disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <span>{submitting ? 'Verifying...' : 'Buka Akses'}</span>
          <ArrowRight size={14} />
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-[#d9cfc7]/60 flex items-center justify-between text-[10px] font-mono text-[#7a756f]">
        <span class="flex items-center gap-1">
          <ShieldCheck size={12} class="text-[#8f7556]" />
          HttpOnly Cookie Guard
        </span>
        <span>VPS 43.134.28.4</span>
      </div>
    </div>
  </div>
</div>
