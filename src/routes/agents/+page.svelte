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

<div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
  <!-- Top Banner (Bright Palette) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-bold tracking-tight text-[#2d2b28] flex items-center gap-2">
        <Brain size={20} class="text-[#8f7556]" />
        <span>AI Agent Brain & Dossier Management</span>
      </h1>
      <p class="text-xs text-[#7a756f] mt-1 font-mono">
        Master profil 7 AI agent agensi, skills repository, dan memori permanen (Supabase DB)
      </p>
    </div>

    <div class="flex items-center gap-2">
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
        7 / 7 Online
      </span>
    </div>
  </div>

  <!-- Agent Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each data.agents as agent (agent.id)}
      <div
        class="bg-[#ffffff] border border-[#d9cfc7] hover:border-[#c9b59c] rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xs"
      >
        <div>
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-[#efe9e3] border border-[#d9cfc7] flex items-center justify-center text-2xl shadow-2xs">
                {agent.avatarIcon}
              </div>
              <div>
                <h3 class="font-bold text-sm text-[#2d2b28] group-hover:text-[#8f7556] transition-colors">
                  {agent.name}
                </h3>
                <span class="text-[11px] font-mono text-[#7a756f]">
                  {agent.role}
                </span>
              </div>
            </div>

            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-mono border {agent.status === 'WORKING'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                : 'bg-blue-50 text-blue-800 border-blue-300 font-medium'}"
            >
              {agent.status}
            </span>
          </div>

          <!-- Description / Personality -->
          <p class="text-xs text-[#7a756f] leading-relaxed mb-4">
            {agent.personality}
          </p>

          <!-- Current Task Pill -->
          <div class="bg-[#f9f8f6] p-2.5 rounded-lg border border-[#d9cfc7] mb-4 text-[11px] font-mono">
            <div class="text-[10px] text-[#7a756f] uppercase mb-0.5 font-semibold">Aktivitas Terkini:</div>
            <div class="text-[#2d2b28] truncate font-medium">{agent.currentTask}</div>
          </div>

          <!-- Skills & Memories Count -->
          <div class="grid grid-cols-2 gap-2 text-[11px] font-mono mb-4">
            <div class="bg-[#efe9e3] p-2 rounded-lg border border-[#d9cfc7] text-center">
              <span class="text-[#7a756f] block text-[10px] font-semibold">SKILLS</span>
              <span class="text-[#2d2b28] font-bold">{agent.skills.length} terdaftar</span>
            </div>
            <div class="bg-[#efe9e3] p-2 rounded-lg border border-[#d9cfc7] text-center">
              <span class="text-[#7a756f] block text-[10px] font-semibold">MEMORI</span>
              <span class="text-[#2d2b28] font-bold">{agent.memories.length} item</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button
          onclick={() => inspectAgent(agent)}
          class="w-full py-2 px-3 rounded-xl bg-[#efe9e3] hover:bg-[#d9cfc7] text-xs font-mono font-bold text-[#2d2b28] transition-colors border border-[#c9b59c] flex items-center justify-center gap-2 shadow-2xs"
        >
          <Search size={14} class="text-[#8f7556]" />
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
