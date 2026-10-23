import type { LayoutServerLoad } from './$types';
import { supabase } from '#lib/server/supabase.js';
import { toAgentProfile, FALLBACK_AGENTS } from '#lib/agents.js';
import { getLiveChannelViews } from '#lib/server/channelViews.js';
import type { ActivityLog, Channel, ContentLog, AgentRow, AgentMemoryRow, AgentSkillRow } from '#lib/types.js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$app/env/private';

const jakartaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const load: LayoutServerLoad = async ({ url }) => {
  const param = url.searchParams.get('date');
  const selectedDate = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : jakartaToday();

  const [ch, logs, activity, agentsRes, skillsRes, memoriesRes, channelViews] = await Promise.all([
    supabase.from('channels').select('*').eq('active', true).order('sort_order'),
    supabase.from('content_logs').select('*').eq('date', selectedDate),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(40),
    supabase.from('agents').select('*').order('slug'),
    supabase.from('agent_skills').select('*').eq('active', true),
    supabase.from('agent_memories').select('*').order('created_at'),
    getLiveChannelViews()
  ]);

  const error = ch.error?.message || logs.error?.message || activity.error?.message || null;
  if (error) console.error('Supabase load error:', error);

  const agents = agentsRes.error
    ? FALLBACK_AGENTS
    : (agentsRes.data as AgentRow[]).map(row =>
        toAgentProfile(row, (skillsRes.data ?? []) as AgentSkillRow[], (memoriesRes.data ?? []) as AgentMemoryRow[])
      );

  return {
    selectedDate,
    today: jakartaToday(),
    channels: (ch.data ?? []) as Channel[],
    logs: (logs.data ?? []) as ContentLog[],
    activity: (activity.data ?? []) as ActivityLog[],
    agents,
    channelViews,
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    error
  };
};
