<script lang="ts">
  import { onMount } from 'svelte';
  import OfficeScene from '#lib/components/OfficeScene.svelte';
  import AgentBrainDialog from '#lib/components/AgentBrainDialog.svelte';
  import type { AgentProfile } from '#lib/agents.js';
  import { Box } from 'lucide-svelte';

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

<div class="h-full w-full flex flex-col relative overflow-hidden bg-[#f9f8f6]">
  <!-- Top HUD Bar (Bright Palette) -->
  <div class="h-12 border-b border-[#d9cfc7] bg-[#ffffff]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 shadow-2xs">
    <div class="flex items-center gap-3">
      <Box size={18} class="text-[#8f7556]" />
      <div>
        <h2 class="text-xs font-bold text-[#2d2b28] font-mono">3D Virtual Headquarters</h2>
        <p class="text-[10px] text-[#7a756f] font-mono hidden sm:block">Kantor Virtual Semi-Isometric — Klik meja / avatar agent untuk inspeksi</p>
      </div>
    </div>

    <!-- Agent Quick Selector Pills -->
    <div class="hidden lg:flex items-center gap-1.5 overflow-x-auto">
      {#each data.agents as ag}
        <button
          onclick={() => handleAgentClick(ag)}
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-[#d9cfc7] bg-[#efe9e3] hover:bg-[#ffffff] text-[#2d2b28] transition-colors shadow-2xs font-medium"
        >
          <span>{ag.avatarIcon}</span>
          <span>{ag.name}</span>
          <span class="w-1.5 h-1.5 rounded-full {ag.status === 'WORKING' ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
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
