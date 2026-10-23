<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { enhance } from '$app/forms';
  import { X, Brain, Wrench, Sparkles, Activity, Plus, Pencil, Trash2, Check } from 'lucide-svelte';
  import type { AgentProfile } from '#lib/agents.js';

  let {
    open = $bindable(false),
    agent
  }: {
    open: boolean;
    agent: AgentProfile | null;
  } = $props();

  let activeTab = $state<'overview' | 'skills' | 'memories'>('overview');

  // Memory editor state
  let editingMemId = $state<string | null>(null);
  let editingContent = $state('');
  let addingMemory = $state(false);
  let newCategory = $state('');
  let newContent = $state('');

  function startEdit(mem: { id?: string; content: string }) {
    editingMemId = mem.id ?? null;
    editingContent = mem.content;
  }
  function cancelEdit() { editingMemId = null; editingContent = ''; }
  function cancelAdd() { addingMemory = false; newCategory = ''; newContent = ''; }

  const statusBadge = $derived.by(() => {
    switch (agent?.status) {
      case 'WORKING':
        return { label: 'Working on Task', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
      case 'THINKING':
        return { label: 'Analyzing / Thinking', bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
      case 'RESTING':
        return { label: 'Resting / Cooldown', bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' };
      case 'IDLE':
      default:
        return { label: 'Standby / Idle', bg: 'bg-blue-50 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-all" />
    <Dialog.Content class="fixed left-[50%] top-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-[#ffffff] p-6 border border-[#d9cfc7] shadow-2xl font-mono text-[#2d2b28] max-h-[90vh] overflow-y-auto">
      {#if agent}
        <!-- Header -->
        <div class="flex items-start justify-between pb-4 border-b border-[#d9cfc7]">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-2xs"
              style="background-color: {agent.accentColor}20; border-color: {agent.accentColor}60;"
            >
              {agent.avatarIcon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <Dialog.Title class="text-base font-bold text-[#2d2b28]">
                  {agent.name}
                </Dialog.Title>
                <span class="text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 {statusBadge.bg}">
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse {statusBadge.dot}"></span>
                  <span>{statusBadge.label}</span>
                </span>
              </div>
              <Dialog.Description class="text-xs text-[#7a756f] mt-0.5">
                {agent.title}
              </Dialog.Description>
            </div>
          </div>

          <Dialog.Close class="p-1 rounded-lg text-[#7a756f] hover:text-[#2d2b28] hover:bg-[#efe9e3]">
            <X size={18} />
          </Dialog.Close>
        </div>

        <!-- Live Task Banner -->
        <div class="my-3 p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] flex items-start gap-2.5">
          <Activity size={16} class="text-[#8f7556] mt-0.5 flex-shrink-0 animate-pulse" />
          <div class="text-xs">
            <span class="text-[#7a756f] text-[10px] uppercase font-bold block">Aktivitas Terkini:</span>
            <span class="text-[#2d2b28] font-medium leading-relaxed">{agent.currentTask}</span>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="grid grid-cols-3 gap-1 p-1 bg-[#efe9e3] rounded-xl border border-[#d9cfc7] mb-4 text-xs font-bold">
          <button
            type="button"
            onclick={() => activeTab = 'overview'}
            class="py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 {activeTab === 'overview' ? 'bg-[#ffffff] text-[#2d2b28] shadow-xs' : 'text-[#7a756f] hover:text-[#2d2b28]'}"
          >
            <Brain size={13} />
            <span>Sifat & Role</span>
          </button>
          <button
            type="button"
            onclick={() => activeTab = 'skills'}
            class="py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 {activeTab === 'skills' ? 'bg-[#ffffff] text-[#2d2b28] shadow-xs' : 'text-[#7a756f] hover:text-[#2d2b28]'}"
          >
            <Wrench size={13} />
            <span>Skills ({agent.skills.length})</span>
          </button>
          <button
            type="button"
            onclick={() => { activeTab = 'memories'; cancelEdit(); cancelAdd(); }}
            class="py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 {activeTab === 'memories' ? 'bg-[#ffffff] text-[#2d2b28] shadow-xs' : 'text-[#7a756f] hover:text-[#2d2b28]'}"
          >
            <Sparkles size={13} />
            <span>Memori ({agent.memories.length})</span>
          </button>
        </div>

        <!-- Tab Content -->
        {#if activeTab === 'overview'}
          <div class="flex flex-col gap-3 text-xs leading-relaxed">
            <div class="p-3.5 bg-[#f9f8f6] rounded-xl border border-[#d9cfc7]">
              <span class="text-[10px] text-[#7a756f] uppercase font-bold block mb-1">Tanggung Jawab Utama:</span>
              <p class="text-[#2d2b28]">{agent.role}</p>
            </div>

            <div class="p-3.5 bg-[#f9f8f6] rounded-xl border border-[#d9cfc7]">
              <span class="text-[10px] text-[#7a756f] uppercase font-bold block mb-1">Kepribadian & Gaya Komunikasi:</span>
              <p class="text-[#2d2b28] italic">"{agent.personality}"</p>
            </div>
          </div>
        {:else if activeTab === 'skills'}
          <div class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {#each agent.skills as skill}
              <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#8f7556]"></span>
                    <span class="font-bold text-xs text-[#2d2b28]">{skill.name}</span>
                  </div>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-[#ffffff] border border-[#d9cfc7] text-[#7a756f] font-bold uppercase">
                    {skill.category}
                  </span>
                </div>
                <p class="text-[11px] text-[#7a756f] leading-relaxed pl-3.5">
                  {skill.description}
                </p>
              </div>
            {/each}
          </div>
        {:else if activeTab === 'memories'}
          <div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {#each agent.memories as mem}
              <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] flex flex-col gap-1 text-xs group">
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-bold text-[#8f7556] uppercase tracking-wider">🏷️ {mem.category}</span>
                  {#if mem.id}
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {#if editingMemId === mem.id}
                        <form method="POST" action="?/updateMemory" use:enhance={() => { return async ({ update }) => { cancelEdit(); await update(); }; }}>
                          <input type="hidden" name="id" value={mem.id} />
                          <input type="hidden" name="content" value={editingContent} />
                          <button type="submit" class="p-0.5 rounded text-emerald-600 hover:bg-emerald-50" title="Simpan"><Check size={12} /></button>
                        </form>
                        <button type="button" onclick={cancelEdit} class="p-0.5 rounded text-[#7a756f] hover:bg-[#efe9e3]" title="Batal"><X size={12} /></button>
                      {:else}
                        <button type="button" onclick={() => startEdit(mem)} class="p-0.5 rounded text-[#7a756f] hover:text-[#2d2b28] hover:bg-[#efe9e3]" title="Edit"><Pencil size={12} /></button>
                        <form method="POST" action="?/deleteMemory" use:enhance>
                          <input type="hidden" name="id" value={mem.id} />
                          <button type="submit" class="p-0.5 rounded text-rose-600 hover:bg-rose-50" title="Hapus"><Trash2 size={12} /></button>
                        </form>
                      {/if}
                    </div>
                  {/if}
                </div>
                {#if editingMemId === mem.id}
                  <textarea
                    bind:value={editingContent}
                    rows={2}
                    class="w-full bg-[#ffffff] border border-[#d9cfc7] rounded-lg text-[11px] text-[#2d2b28] p-2 mt-1 focus:outline-none focus:border-[#8f7556] resize-none"
                  ></textarea>
                {:else}
                  <p class="text-[#2d2b28] text-[11px] leading-relaxed pl-1 pt-0.5">
                    • {mem.content}
                  </p>
                {/if}
              </div>
            {:else}
              <p class="text-[11px] text-[#7a756f]">Belum ada memori tersimpan.</p>
            {/each}

            <!-- Add new memory form -->
            {#if addingMemory}
              <form method="POST" action="?/addMemory" use:enhance={() => { return async ({ update }) => { cancelAdd(); await update(); }; }}
                class="p-3 rounded-xl bg-[#ffffff] border border-emerald-400 flex flex-col gap-2"
              >
                <input type="hidden" name="agent_id" value={agent.id} />
                <input
                  bind:value={newCategory}
                  name="category"
                  placeholder="Kategori (misal: rule, ops, infra)"
                  required
                  class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-lg text-[11px] text-[#2d2b28] p-2 focus:outline-none focus:border-[#8f7556] placeholder:text-[#7a756f]/50"
                />
                <textarea
                  bind:value={newContent}
                  name="content"
                  placeholder="Isi memori baru…"
                  required
                  rows={2}
                  class="w-full bg-[#f9f8f6] border border-[#d9cfc7] rounded-lg text-[11px] text-[#2d2b28] p-2 focus:outline-none focus:border-[#8f7556] resize-none placeholder:text-[#7a756f]/50"
                ></textarea>
                <div class="flex items-center gap-2">
                  <button type="submit" class="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500 shadow-xs">Simpan</button>
                  <button type="button" onclick={cancelAdd} class="px-3 py-1 rounded-lg bg-[#efe9e3] text-[#7a756f] text-[10px] font-bold hover:text-[#2d2b28]">Batal</button>
                </div>
              </form>
            {:else}
              <button
                type="button"
                onclick={() => (addingMemory = true)}
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#d9cfc7] text-[11px] text-[#7a756f] hover:text-[#2d2b28] hover:border-[#8f7556] transition"
              >
                <Plus size={13} /> Tambah memori baru
              </button>
            {/if}
          </div>
        {/if}
      {:else}
        <Dialog.Title class="sr-only">Agent Dossier</Dialog.Title>
        <Dialog.Description class="sr-only">Detail profil agent</Dialog.Description>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
