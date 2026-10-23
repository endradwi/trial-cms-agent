<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { createClient } from '@supabase/supabase-js';
  import { BarChart3, ListTodo, Box, Brain, Zap, Clock, Calendar, Crown, Menu } from 'lucide-svelte';

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
      icon: BarChart3,
      badge: 'Live',
      desc: 'Telemetry, upload charts, and event stream'
    },
    {
      href: '/tasks',
      label: 'Channel Tasks',
      icon: ListTodo,
      badge: '13 Ch',
      desc: 'SOP upload slot scheduler & verification'
    },
    {
      href: '/hq',
      label: 'Virtual HQ 3D',
      icon: Box,
      badge: '3D Scene',
      desc: 'Interactive semi-isometric 3D agency office'
    },
    {
      href: '/agents',
      label: 'Agent Dossier',
      icon: Brain,
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

<div class="h-screen w-screen overflow-hidden flex bg-[#f9f8f6] text-[#2d2b28] font-sans antialiased selection:bg-[#c9b59c] selection:text-[#2d2b28]">
  <!-- Mobile Backdrop Overlay -->
  {#if sidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
      onclick={() => (sidebarOpen = false)}
    ></div>
  {/if}

  <!-- Supabase-style Sidebar (ColorHunt Warm Light Palette) -->
  <aside
    class="fixed inset-y-0 left-0 md:static flex flex-col border-r border-[#d9cfc7] bg-[#efe9e3] transition-all duration-200 z-30 shrink-0 {sidebarOpen
      ? 'w-64 translate-x-0'
      : '-translate-x-full md:translate-x-0 md:w-16'}"
  >
    <!-- Brand / Project Header -->
    <div class="h-14 border-b border-[#d9cfc7] flex items-center justify-between px-3.5 bg-[#efe9e3]">
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9b59c] to-[#8f7556] flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
          <Zap size={16} />
        </div>
        {#if sidebarOpen}
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-sm tracking-tight text-[#2d2b28] truncate flex items-center gap-1.5">
              Agency HQ
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#ffffff] text-[#8f7556] border border-[#d9cfc7] font-semibold">PROD</span>
            </span>
            <span class="text-[11px] font-mono text-[#7a756f] truncate flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              option-agency/main
            </span>
          </div>
        {/if}
      </div>
      <button
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="text-[#7a756f] hover:text-[#2d2b28] p-1.5 rounded-md hover:bg-[#d9cfc7]/40 transition-colors shrink-0"
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
        <div class="px-2.5 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#7a756f] font-bold">
          Operations Modules
        </div>
      {/if}

      {#each navItems as item}
        {@const active = isActive(item.href, page.url.pathname)}
        {@const Icon = item.icon}
        <a
          href={item.href}
          onclick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              sidebarOpen = false;
            }
          }}
          class="flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative {active
            ? 'bg-[#ffffff] text-[#2d2b28] font-bold border border-[#d9cfc7] shadow-sm'
            : 'text-[#7a756f] hover:text-[#2d2b28] hover:bg-[#f9f8f6]'}"
          title={!sidebarOpen ? item.label : undefined}
        >
          <Icon size={17} class="shrink-0 transition-transform group-hover:scale-110 {active ? 'text-[#8f7556]' : 'text-[#7a756f]'}" />
          {#if sidebarOpen}
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="truncate">{item.label}</span>
                {#if item.badge}
                  <span class="text-[9px] font-mono px-1.5 py-0.2 rounded border {active ? 'bg-[#c9b59c]/30 text-[#8f7556] border-[#c9b59c] font-bold' : 'bg-[#ffffff] text-[#7a756f] border-[#d9cfc7]'}">
                    {item.badge}
                  </span>
                {/if}
              </div>
            </div>
          {/if}
          {#if active}
            <div class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#c9b59c] rounded-r"></div>
          {/if}
        </a>
      {/each}
    </nav>

    <!-- Bottom Sidebar Status & User Info -->
    <div class="p-3 border-t border-[#d9cfc7] space-y-2 bg-[#efe9e3]">
      {#if sidebarOpen}
        <!-- Telemetry Indicators -->
        <div class="space-y-1.5 text-[11px] font-mono text-[#7a756f] bg-[#ffffff] p-2.5 rounded-lg border border-[#d9cfc7] shadow-xs">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full {isRealtimeActive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}"></span>
              Supabase DB
            </span>
            <span class="text-emerald-600 font-bold text-[10px]">Connected</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
              Telegram Bot
            </span>
            <span class="text-[#2d2b28] font-medium text-[10px]">@coco_vendor</span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-[#7a756f] pt-0.5 border-t border-[#d9cfc7]/60">
            <span>VPS Host</span>
            <span class="font-mono">43.134.28.4:3001</span>
          </div>
        </div>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-2.5 px-2 py-1.5 bg-[#ffffff] rounded-lg border border-[#d9cfc7] shadow-xs">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#c9b59c] to-[#8f7556] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            <Crown size={14} />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-[#2d2b28] truncate leading-tight">dude</span>
            <span class="text-[10px] font-mono text-[#7a756f] truncate">Owner & Tech Lead</span>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-2">
          <div class="w-2 h-2 rounded-full {isRealtimeActive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}" title="Supabase DB Connected"></div>
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#c9b59c] to-[#8f7556] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            <Crown size={14} />
          </div>
        </div>
      {/if}
    </div>
  </aside>

  <!-- Main Viewport (Top Bar + Dynamic Content) -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f9f8f6]">
    <!-- Top Bar -->
    <header class="h-14 border-b border-[#d9cfc7] bg-[#ffffff]/90 backdrop-blur px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
      <!-- Breadcrumb & Mobile Menu Toggle -->
      <div class="flex items-center gap-2 text-xs font-mono min-w-0">
        <button
          onclick={() => (sidebarOpen = !sidebarOpen)}
          class="md:hidden p-1.5 rounded-lg bg-[#efe9e3] border border-[#d9cfc7] text-[#2d2b28] shrink-0 hover:bg-[#d9cfc7]/50 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={16} />
        </button>
        <span class="text-[#7a756f] hidden sm:inline font-medium">Agency HQ</span>
        <span class="text-[#d9cfc7] hidden sm:inline">/</span>
        <span class="text-[#2d2b28] font-bold truncate max-w-[140px] sm:max-w-none">
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
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-emerald-500/40 bg-emerald-50 text-emerald-800">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
          <span class="font-semibold">Realtime Live</span>
        </div>

        <!-- Clock -->
        {#if currentTime}
          <div class="text-[11px] font-mono text-[#2d2b28] bg-[#efe9e3] px-2.5 py-1 rounded-md border border-[#d9cfc7] hidden lg:flex items-center gap-1 font-medium">
            <Clock size={12} class="text-[#8f7556]" />
            <span>{currentTime}</span>
          </div>
        {/if}

        <!-- Date Link Selector -->
        <a
          href="?date={data.today}"
          class="text-[11px] font-mono px-2 sm:px-2.5 py-1 rounded-md border border-[#d9cfc7] bg-[#ffffff] hover:bg-[#efe9e3] text-[#2d2b28] transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Calendar size={12} class="text-[#8f7556]" />
          <span class="hidden sm:inline font-medium">{data.today}</span>
          <span class="text-[9px] text-[#8f7556] font-bold">(Today)</span>
        </a>
      </div>
    </header>

    <!-- Content Workspace -->
    <main class="flex-1 min-w-0 overflow-y-auto bg-[#f9f8f6]">
      {@render children()}
    </main>
  </div>
</div>
