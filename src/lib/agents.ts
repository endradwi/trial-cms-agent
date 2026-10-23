import type { AgentRow, AgentMemoryRow, AgentSkillRow } from '#lib/types.js';

export interface AgentProfile {
  id: string;
  slug: string;
  name: string;
  title: string;
  role: string;
  avatarIcon: string;
  accentColor: string;
  status: 'IDLE' | 'WORKING' | 'THINKING' | 'RESTING';
  currentTask: string;
  personality: string;
  deskPos: { x: number; y: number; z: number };
  skills: Array<{ id?: string; name: string; description: string; category: string }>;
  memories: Array<{ id?: string; category: string; content: string }>;
}

/** Map DB row + joined skills/memories into the shape components expect */
export function toAgentProfile(
  row: AgentRow,
  skills: AgentSkillRow[],
  memories: AgentMemoryRow[]
): AgentProfile {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    role: row.role,
    avatarIcon: row.avatar_icon,
    accentColor: row.accent_color,
    status: row.status,
    currentTask: row.current_task ?? 'Standby',
    personality: row.personality ?? '',
    deskPos: row.desk_position,
    skills: skills.filter(s => s.agent_id === row.id).map(s => ({ id: s.id, name: s.name, description: s.description ?? '', category: s.category })),
    memories: memories.filter(m => m.agent_id === row.id).map(m => ({ id: m.id, category: m.category, content: m.content }))
  };
}

/** Hardcoded fallback when DB tables don't exist yet */
export const FALLBACK_AGENTS: AgentProfile[] = [
  { id: 'agent_coco', slug: 'coco', name: 'Coco', title: 'PA & Central Orchestrator', role: 'Executive Personal Assistant & Task Dispatcher (@coco_vendor_bot)', avatarIcon: '👑', accentColor: '#FFE600', status: 'IDLE', currentTask: 'Standby koordinasi task & jadwal 13 channel', personality: 'Responsif, terorganisir tinggi, mengawal seluruh koordinasi agensi dan briefing pagi.', deskPos: { x: 0, y: 0, z: 2 }, skills: [], memories: [] },
  { id: 'agent_satria', slug: 'satria', name: 'Satria', title: 'Tech Lead & Lead Software Engineer', role: 'Divisi Software House, Architecture, Code Review, Fullstack & DevOps', avatarIcon: '💻', accentColor: '#00E5FF', status: 'WORKING', currentTask: 'Mengembangkan Agency Ops Monolith & Zero-Token Telegram Spy', personality: 'Senior Pragmatic Developer: Tegas, rasional, YAGNI, anti-slop.', deskPos: { x: 4.5, y: 0, z: -1 }, skills: [], memories: [] },
  { id: 'agent_dimas', slug: 'dimas', name: 'Dimas', title: 'Head of Video Clipper', role: 'Video Editing Engine, Kinetic Subtitles, Hook Banner & FFmpeg Stream-Slicing', avatarIcon: '🎬', accentColor: '#FF6B00', status: 'IDLE', currentTask: 'Standby antrean klip YouTube Shorts & TikTok', personality: 'Spesialis video retensi tinggi.', deskPos: { x: -4.5, y: 0, z: -1 }, skills: [], memories: [] },
  { id: 'agent_salsa', slug: 'salsa', name: 'Salsa', title: 'Lead Copywriter & Hooks Specialist', role: 'Viral Hook Titles, Platform-Specific Metadata & SEO Keywords', avatarIcon: '📢', accentColor: '#FF2A85', status: 'IDLE', currentTask: 'Menyusun hook bank', personality: 'Kreatif, tajam dalam psikologi audiens.', deskPos: { x: -4.5, y: 0, z: 2.5 }, skills: [], memories: [] },
  { id: 'agent_layla', slug: 'layla', name: 'Layla', title: 'Bounty Hunter & QA Manager', role: 'Quality Gate & Compliance Submissions', avatarIcon: '🎯', accentColor: '#10B981', status: 'IDLE', currentTask: 'Monitoring bounty submission', personality: 'Teliti, disiplin tenggat waktu.', deskPos: { x: 4.5, y: 0, z: 2.5 }, skills: [], memories: [] },
  { id: 'agent_budi', slug: 'budi', name: 'Budi', title: 'Content Researcher', role: 'Viral Topic Discovery, Sound Trend Watcher, & Competitor Analytics', avatarIcon: '🔍', accentColor: '#3B82F6', status: 'IDLE', currentTask: 'Analisis retensi topik', personality: 'Berbasis data analitik.', deskPos: { x: -2.5, y: 0, z: -3.5 }, skills: [], memories: [] },
  { id: 'agent_raka', slug: 'raka', name: 'Raka', title: 'Automation & Scraper Engineer', role: 'Scraper Pipeline, Telegram Bot Gateway, & API Integrations', avatarIcon: '🤖', accentColor: '#A855F7', status: 'IDLE', currentTask: 'Standby Telegram Gateway', personality: 'Tenang, metodis, ahli automasi.', deskPos: { x: 2.5, y: 0, z: -3.5 }, skills: [], memories: [] }
];
