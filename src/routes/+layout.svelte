<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { createClient } from '@supabase/supabase-js';

  let { data, children } = $props();

  let sidebarOpen = $state(false);
  let currentTime = $state('');
  let isRealtimeActive = $state(false);

  // Clock
  onMount(() => {
    sidebarOpen = window.innerWidth >= 768;
    const updateTime = () => {
      currentTime = new Date().toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' WIB';
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Supabase Realtime Health check
    if (data.supabaseUrl && data.supabaseKey) {
      try {
        const client = createClient(data.supabaseUrl, data.supabaseKey);
        const channel = client.channel('ops_layout_health');
        channel.subscribe((status) => {
          isRealtimeActive = status === 'SUBSCRIBED';
        });
        return () => {
          clearInterval(interval);
          client.removeChannel(channel);
        };
      } catch {
        isRealtimeActive = false;
      }
    }

    return () => clearInterval(interval);
  });

  const navItems = [
    {
      href: '/',
      label: 'Analytics & Live Logs',
      icon: '📊',
      badge: 'Live',
      desc: 'Telemetry, upload charts, and event stream'
    },
    {
      href: '/tasks',
      label: 'Channel Tasks',
      icon: '📋',
      badge: '13 Ch',
      desc: 'SOP upload slot scheduler & verification'
    },
    {
      href: '/hq',
      label: 'Virtual HQ 3D',
      icon: '🏢',
      badge: '3D Scene',
      desc: 'Interactive semi-isometric 3D agency office'
    },
    {
      href: '/agents',
      label: 'Agent Dossier',
      icon: '🧠',
      badge: '7 Agents',
      desc: 'Memory CRUD, skills, and system profiles'
    }
  ];

  function isActive(path: string, currentPath: string) {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }
</script>

<svelte:head>
  <title>Agency Ops Console — AI Virtual Headquarters</title>
</svelte:head>

<div class="h-screen w-screen overflow-hidden flex bg-[#010736] text-[#fcf1d0] font-sans antialiased selection:bg-[#22396f] selection:text-[#fcf1d0]">
  <!-- Mobile Backdrop Overlay -->
  {#if sidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
      onclick={() => (sidebarOpen = false)}
    ></div>
  {/if}

  <!-- Supabase-style Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 md:static flex flex-col border-r border-[#22396f]/50 bg-[#071330] transition-all duration-200 z-30 shrink-0 {sidebarOpen
      ? 'w-64 translate-x-0'
      : '-translate-x-full md:translate-x-0 md:w-16'}"
  >
    <!-- Brand / Project Header -->
    <div class="h-14 border-b border-[#22396f]/50 flex items-center justify-between px-3.5">
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#00e5ff] flex items-center justify-center font-bold text-xs text-[#010736] shadow-md shadow-[#00e5ff]/20 shrink-0">
          ⚡
        </div>
        {#if sidebarOpen}
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-sm tracking-tight text-[#fcf1d0] truncate flex items-center gap-1.5">
              Agency HQ
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#22396f]/60 text-[#8fa2cb] border border-[#22396f]">PROD</span>
            </span>
            <span class="text-[11px] font-mono text-[#8fa2cb]/70 truncate flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              option-agency/main
            </span>
          </div>
        {/if}
      </div>
      <button
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="text-[#8fa2cb] hover:text-[#fcf1d0] p-1.5 rounded-md hover:bg-[#0d1c42] transition-colors shrink-0"
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label="Toggle sidebar"
      >
        <svg class="w-4 h-4 transition-transform duration-200 {sidebarOpen ? '' : 'rotate-180'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      {#if sidebarOpen}
        <div class="px-2.5 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#8fa2cb]/60 font-semibold">
          Operations Modules
        </div>
      {/if}

      {#each navItems as item}
        {@const active = isActive(item.href, page.url.pathname)}
        <a
          href={item.href}
          onclick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              sidebarOpen = false;
            }
          }}
          class="flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative {active
            ? 'bg-[#0d1c42] text-[#fcf1d0] font-semibold border border-[#22396f] shadow-inner shadow-[#010736]/50'
            : 'text-[#8fa2cb] hover:text-[#fcf1d0] hover:bg-[#0d1c42]/60'}"
          title={!sidebarOpen ? item.label : undefined}
        >
          <span class="text-base shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
          {#if sidebarOpen}
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="truncate">{item.label}</span>
                {#if item.badge}
                  <span class="text-[9px] font-mono px-1.5 py-0.2 rounded border {active ? 'bg-[#22396f] text-[#fcf1d0] border-[#3b82f6]' : 'bg-[#010736]/60 text-[#8fa2cb] border-[#22396f]/40'}">
                    {item.badge}
                  </span>
                {/if}
              </div>
            </div>
          {/if}
          {#if active}
            <div class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00e5ff] rounded-r"></div>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- Bottom Sidebar Status & User Info -->
    <div class="p-3 border-t border-[#22396f]/50 space-y-2 bg-[#050e24]/70">
      {#if sidebarOpen}
        <!-- Telemetry Indicators -->
        <div class="space-y-1.5 text-[11px] font-mono text-[#8fa2cb]/80 bg-[#0d1c42]/50 p-2.5 rounded-lg border border-[#22396f]/40">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full {isRealtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}"></span>
              Supabase DB
            </span>
            <span class="text-emerald-400 font-semibold text-[10px]">Connected</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Telegram Bot
            </span>
            <span class="text-[#fcf1d0]/80 text-[10px]">@coco_vendor</span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-[#8fa2cb]/60 pt-0.5 border-t border-[#22396f]/30">
            <span>VPS Host</span>
            <span>43.134.28.4:3001</span>
          </div>
        </div>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2.5 px-1 py-1">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-[#010736] font-bold text-xs flex items-center justify-center shrink-0 shadow">
            👑
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-semibold text-[#fcf1d0] truncate leading-tight">dude</span>
            <span class="text-[10px] font-mono text-[#8fa2cb] truncate">Owner & Tech Lead</span>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-2">
          <div class="w-2 h-2 rounded-full {isRealtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}" title="Supabase DB Connected"></div>
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-[#010736] font-bold text-xs flex items-center justify-center shrink-0">
            👑
          </div>
        </div>
      {/if}
    </div>
  </aside>

  <!-- Main Viewport (Top Bar + Dynamic Content) -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#010736]">
    <!-- Top Bar -->
    <header class="h-14 border-b border-[#22396f]/50 bg-[#071330]/90 backdrop-blur px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
      <!-- Breadcrumb & Mobile Menu Toggle -->
      <div class="flex items-center gap-2 text-xs font-mono min-w-0">
        <button
          onclick={() => (sidebarOpen = !sidebarOpen)}
          class="md:hidden p-1.5 rounded-lg bg-[#0d1c42] border border-[#22396f] text-[#fcf1d0] shrink-0 hover:bg-[#22396f]/50 transition-colors"
          aria-label="Toggle menu"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span class="text-[#8fa2cb]/70 hidden sm:inline">Agency HQ</span>
        <span class="text-[#22396f] hidden sm:inline">/</span>
        <span class="text-[#fcf1d0] font-semibold truncate max-w-[140px] sm:max-w-none">
          {#if page.url.pathname === '/'}
            Analytics & Live Logs
          {:else if page.url.pathname.startsWith('/tasks')}
            Tasks & Slots
          {:else if page.url.pathname.startsWith('/hq')}
            Virtual HQ 3D
          {:else if page.url.pathname.startsWith('/agents')}
            Agent Dossier
          {:else}
            Console
          {/if}
        </span>
      </div>

      <!-- Quick Actions & Clocks -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Realtime Badge -->
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Realtime Live</span>
        </div>

        <!-- Clock -->
        {#if currentTime}
          <div class="text-[11px] font-mono text-[#8fa2cb] bg-[#0d1c42] px-2.5 py-1 rounded-md border border-[#22396f]/40 hidden lg:block">
            🕒 {currentTime}
          </div>
        {/if}

        <!-- Date Link Selector -->
        <a
          href="?date={data.today}"
          class="text-[11px] font-mono px-2 sm:px-2.5 py-1 rounded-md border border-[#22396f] bg-[#0d1c42] hover:bg-[#22396f]/40 text-[#fcf1d0] transition-colors flex items-center gap-1"
        >
          <span>📅</span>
          <span class="hidden sm:inline">{data.today}</span>
          <span class="text-[9px] text-[#00e5ff] font-bold">(Today)</span>
        </a>
      </div>
    </header>

    <!-- Content Workspace -->
    <main class="flex-1 min-w-0 overflow-y-auto">
      {@render children()}
    </main>
  </div>
</div>
