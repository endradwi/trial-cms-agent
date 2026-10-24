<script lang="ts">
  import AgentBrainDialog from '#lib/components/AgentBrainDialog.svelte';
  import type { AgentProfile } from '#lib/agents.js';
  import { Brain, Search } from 'lucide-svelte';

  let { data } = $props();

  let selectedAgentSlug = $state<string | null>(null);
  let dialogOpen = $state(false);

  let selectedAgent = $derived(
    selectedAgentSlug ? (data.agents.find((a: AgentProfile) => a.slug === selectedAgentSlug) ?? null) : null
  );

  function inspectAgent(agent: AgentProfile) {
    selectedAgentSlug = agent.slug;
    dialogOpen = true;
  }
</script>

<svelte:head>
  <title>AI Agent Brain & Dossier — Option Agency</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
  <!-- Top Banner (Bright Palette) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-6 sm:p-7 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#2d2b28] flex items-center gap-2.5">
        <Brain size={24} class="text-[#8f7556]" />
        <span>AI Agent Brain & Dossier Management</span>
      </h1>
      <p class="text-sm text-[#7a756f] mt-1.5 font-mono">
        Master profil 7 AI agent agensi, skills repository, dan memori permanen (Supabase DB)
      </p>
    </div>

    <div class="flex items-center gap-2.5">
      <span class="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
        7 / 7 Online
      </span>
    </div>
  </div>

  <!-- Agent Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each data.agents as agent (agent.id)}
      <div
        class="bg-[#ffffff] border border-[#d9cfc7] hover:border-[#c9b59c] rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-xs"
      >
        <div>
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-[#efe9e3] border border-[#d9cfc7] flex items-center justify-center text-2xl shadow-2xs">
                {agent.avatarIcon}
              </div>
              <div>
                <h3 class="font-bold text-base text-[#2d2b28] group-hover:text-[#8f7556] transition-colors">
                  {agent.name}
                </h3>
                <span class="text-xs sm:text-sm font-mono text-[#7a756f] block">
                  {agent.role}
                </span>
              </div>
            </div>

            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-mono border {agent.status === 'WORKING'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-blue-50 text-blue-800 border-blue-300 font-medium'}"
            >
              {agent.status}
            </span>
          </div>

          <!-- Description / Personality -->
          <p class="text-xs sm:text-sm text-[#7a756f] leading-relaxed mb-4">
            {agent.personality}
          </p>

          <!-- Current Task Pill -->
          <div class="bg-[#f9f8f6] p-3 rounded-xl border border-[#d9cfc7] mb-4 text-xs sm:text-sm font-mono">
            <div class="text-xs text-[#7a756f] uppercase mb-1 font-bold">Aktivitas Terkini:</div>
            <div class="text-[#2d2b28] truncate font-medium">{agent.currentTask}</div>
          </div>

          <!-- Skills & Memories Count -->
          <div class="grid grid-cols-2 gap-2.5 text-xs sm:text-sm font-mono mb-4">
            <div class="bg-[#efe9e3] p-2.5 rounded-xl border border-[#d9cfc7] text-center">
              <span class="text-[#7a756f] block text-xs font-bold">SKILLS</span>
              <span class="text-[#2d2b28] font-bold text-sm sm:text-base">{agent.skills.length} terdaftar</span>
            </div>
            <div class="bg-[#efe9e3] p-2.5 rounded-xl border border-[#d9cfc7] text-center">
              <span class="text-[#7a756f] block text-xs font-bold">MEMORI</span>
              <span class="text-[#2d2b28] font-bold text-sm sm:text-base">{agent.memories.length} item</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button
          onclick={() => inspectAgent(agent)}
          class="w-full py-2.5 px-3.5 rounded-xl bg-[#efe9e3] hover:bg-[#d9cfc7] text-xs sm:text-sm font-mono font-bold text-[#2d2b28] transition-colors border border-[#c9b59c] flex items-center justify-center gap-2 shadow-2xs mt-2"
        >
          <Search size={16} class="text-[#8f7556]" />
          <span>Buka Dossier & Edit Memori</span>
        </button>
      </div>
    {/each}
  </div>
</div>

<!-- Modal Dialog -->
<AgentBrainDialog
  bind:open={dialogOpen}
  agent={selectedAgent}
/>
