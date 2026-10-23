<script lang="ts">
  import { onMount } from 'svelte';
  import OfficeScene from '#lib/components/OfficeScene.svelte';
  import AgentBrainDialog from '#lib/components/AgentBrainDialog.svelte';
  import type { AgentProfile } from '#lib/agents.js';

  let { data } = $props();

  let selectedAgentSlug = $state<string | null>(null);
  let dialogOpen = $state(false);

  let selectedAgent = $derived(
    selectedAgentSlug ? (data.agents.find((a: AgentProfile) => a.slug === selectedAgentSlug) ?? null) : null
  );

  function handleAgentClick(agent: AgentProfile) {
    selectedAgentSlug = agent.slug;
    dialogOpen = true;
  }
</script>

<div class="h-full w-full flex flex-col relative overflow-hidden bg-[#010736]">
  <!-- Top HUD Bar -->
  <div class="h-12 border-b border-[#22396f]/50 bg-[#071330]/80 backdrop-blur px-6 flex items-center justify-between shrink-0 z-10">
    <div class="flex items-center gap-3">
      <span class="text-base">🏢</span>
      <div>
        <h2 class="text-xs font-bold text-[#fcf1d0] font-mono">3D Virtual Headquarters</h2>
        <p class="text-[10px] text-[#8fa2cb] font-mono">Kantor Virtual Semi-Isometric — Klik meja / avatar agent untuk inspeksi</p>
      </div>
    </div>

    <!-- Agent Quick Selector Pills -->
    <div class="hidden lg:flex items-center gap-1.5 overflow-x-auto">
      {#each data.agents as ag}
        <button
          onclick={() => handleAgentClick(ag)}
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-[#22396f] bg-[#0d1c42]/80 hover:bg-[#22396f]/60 text-[#fcf1d0] transition-colors"
        >
          <span>{ag.avatarIcon}</span>
          <span>{ag.name}</span>
          <span class="w-1.5 h-1.5 rounded-full {ag.status === 'WORKING' ? 'bg-emerald-400' : 'bg-blue-400'}"></span>
        </button>
      {/each}
    </div>
  </div>

  <!-- 3D Canvas Viewport (Edge to edge) -->
  <div class="flex-1 w-full h-full relative">
    <OfficeScene
      agents={data.agents}
      onAgentClick={handleAgentClick}
    />
  </div>

  <!-- Agent Brain Dossier Modal -->
  <AgentBrainDialog
    bind:open={dialogOpen}
    agent={selectedAgent}
  />
</div>
