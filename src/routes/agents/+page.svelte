<script lang="ts">
  import AgentBrainDialog from '#lib/components/AgentBrainDialog.svelte';
  import type { AgentProfile } from '#lib/agents.js';

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

<div class="p-6 max-w-7xl mx-auto space-y-6">
  <!-- Top Banner -->
  <div class="bg-[#0d1c42]/80 border border-[#22396f] p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-bold tracking-tight text-[#fcf1d0] flex items-center gap-2">
        <span>🧠</span>
        <span>AI Agent Brain & Dossier Management</span>
      </h1>
      <p class="text-xs text-[#8fa2cb] mt-1 font-mono">
        Master profil 7 AI agent agensi, skills repository, dan memori permanen (Supabase DB)
      </p>
    </div>

    <div class="flex items-center gap-2">
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        7 / 7 Online
      </span>
    </div>
  </div>

  <!-- Agent Cards Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each data.agents as agent (agent.id)}
      <div
        class="bg-[#0d1c42] border border-[#22396f] hover:border-[#00e5ff]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg"
      >
        <div>
          <!-- Header Card -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-[#010736] border border-[#22396f] flex items-center justify-center text-2xl shadow">
                {agent.avatarIcon}
              </div>
              <div>
                <h3 class="font-bold text-sm text-[#fcf1d0] group-hover:text-[#00e5ff] transition-colors">
                  {agent.name}
                </h3>
                <span class="text-[11px] font-mono text-[#8fa2cb]">
                  {agent.role}
                </span>
              </div>
            </div>

            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-mono border {agent.status === 'WORKING'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}"
            >
              {agent.status}
            </span>
          </div>

          <!-- Description / Personality -->
          <p class="text-xs text-[#8fa2cb] leading-relaxed mb-4">
            {agent.personality}
          </p>

          <!-- Current Task Pill -->
          <div class="bg-[#010736] p-2.5 rounded-lg border border-[#22396f]/40 mb-4 text-[11px] font-mono">
            <div class="text-[10px] text-[#8fa2cb]/70 uppercase mb-0.5">Aktivitas Terkini:</div>
            <div class="text-[#fcf1d0] truncate">{agent.currentTask}</div>
          </div>

          <!-- Skills & Memories Count -->
          <div class="grid grid-cols-2 gap-2 text-[11px] font-mono mb-4">
            <div class="bg-[#071330] p-2 rounded border border-[#22396f]/30 text-center">
              <span class="text-[#8fa2cb] block text-[10px]">SKILLS</span>
              <span class="text-[#fcf1d0] font-bold">{agent.skills.length} terdaftar</span>
            </div>
            <div class="bg-[#071330] p-2 rounded border border-[#22396f]/30 text-center">
              <span class="text-[#8fa2cb] block text-[10px]">MEMORI</span>
              <span class="text-[#fcf1d0] font-bold">{agent.memories.length} item</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button
          onclick={() => inspectAgent(agent)}
          class="w-full py-2 px-3 rounded-lg bg-[#22396f]/50 hover:bg-[#22396f] text-xs font-mono text-[#fcf1d0] transition-colors border border-[#22396f] flex items-center justify-center gap-2"
        >
          <span>🔍</span>
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
