-- ============================================================
-- FASE 3: Agent Brain & Live Sync — DDL + Seed
-- Run di Supabase SQL Editor: https://supabase.com/dashboard/project/xzspptnoaazsrffpxwvn/sql/new
-- ============================================================

-- 1. TABEL AGENTS
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL,
    avatar_icon TEXT NOT NULL DEFAULT '🤖',
    accent_color TEXT NOT NULL DEFAULT '#22396F',
    status TEXT NOT NULL DEFAULT 'IDLE',
    current_task TEXT,
    personality TEXT,
    desk_position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL AGENT_MEMORIES
CREATE TABLE IF NOT EXISTS public.agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL AGENT_SKILLS
CREATE TABLE IF NOT EXISTS public.agent_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_memories_agent ON public.agent_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent ON public.agent_skills(agent_id);

-- ============================================================
-- SEED: 7 Agent Profiles
-- ============================================================

INSERT INTO public.agents (slug, name, title, role, avatar_icon, accent_color, status, current_task, personality, desk_position) VALUES
  ('coco', 'Coco', 'PA & Central Orchestrator', 'Executive Personal Assistant & Task Dispatcher (@coco_vendor_bot)', '👑', '#FFE600', 'IDLE', 'Standby koordinasi task & jadwal 13 channel', 'Responsif, terorganisir tinggi, mengawal seluruh koordinasi agensi dan briefing pagi.', '{"x":0,"y":0,"z":2}'),
  ('satria', 'Satria', 'Tech Lead & Lead Software Engineer', 'Divisi Software House, Architecture, Code Review, Fullstack & DevOps', '💻', '#00E5FF', 'WORKING', 'Mengembangkan Agency Ops Monolith & Zero-Token Telegram Spy', 'Senior Pragmatic Developer: Tegas, rasional, YAGNI, anti-slop, mengutamakan working software over comprehensive documentation.', '{"x":4.5,"y":0,"z":-1}'),
  ('dimas', 'Dimas', 'Head of Video Clipper', 'Video Editing Engine, Kinetic Subtitles, Hook Banner & FFmpeg Stream-Slicing', '🎬', '#FF6B00', 'IDLE', 'Standby antrean klip YouTube Shorts & TikTok', 'Spesialis video retensi tinggi: paham ritme visual, punchy subtitles, dan aturan anti-banned medsos.', '{"x":-4.5,"y":0,"z":-1}'),
  ('salsa', 'Salsa', 'Lead Copywriter & Hooks Specialist', 'Viral Hook Titles, Platform-Specific Metadata & SEO Keywords', '📢', '#FF2A85', 'IDLE', 'Menyusun hook bank untuk kampanye Whop & SEGA', 'Kreatif, tajam dalam psikologi audiens, anti-clickbait murahan tapi sangat clicky.', '{"x":-4.5,"y":0,"z":2.5}'),
  ('layla', 'Layla', 'Bounty Hunter & QA Manager', 'Quality Gate & Compliance Submissions (Whop, ClipHaus, Reach, Content Rewards)', '🎯', '#10B981', 'IDLE', 'Monitoring verifikasi submission bounty hari ini', 'Teliti, disiplin tenggat waktu, sangat protektif terhadap aturan brand agar klip tidak didiskualifikasi.', '{"x":4.5,"y":0,"z":2.5}'),
  ('budi', 'Budi', 'Content Researcher', 'Viral Topic Discovery, Sound Trend Watcher, & Competitor Analytics', '🔍', '#3B82F6', 'IDLE', 'Analisis retensi topik gaming & comedy podcast', 'Berbasis data analitik, fokus pada heatmap lonjakan retensi penonton.', '{"x":-2.5,"y":0,"z":-3.5}'),
  ('raka', 'Raka', 'Automation & Scraper Engineer', 'Scraper Pipeline, Telegram Bot Gateway, & API Integrations', '🤖', '#A855F7', 'IDLE', 'Standby Telegram Gateway port 9119 & alerting', 'Tenang, metodis, ahli dalam automasi headless browser dan event queue.', '{"x":2.5,"y":0,"z":-3.5}')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, title = EXCLUDED.title, role = EXCLUDED.role,
  avatar_icon = EXCLUDED.avatar_icon, accent_color = EXCLUDED.accent_color,
  personality = EXCLUDED.personality, desk_position = EXCLUDED.desk_position,
  updated_at = now();

-- ============================================================
-- SEED: Agent Skills
-- ============================================================

INSERT INTO public.agent_skills (agent_id, name, description, category)
SELECT a.id, s.name, s.description, s.category
FROM (VALUES
  ('coco', 'morning-briefing', 'Ekstraksi metrik & rekap performa 13 channel setiap jam 08:30 WIB', 'ops'),
  ('coco', 'bounty-dispatch', 'Delegasi task bounty ke Dimas & tim clipper', 'workflow'),
  ('coco', 'channel-scheduler', 'Mengawal slot upload harian agar zero miss', 'scheduling'),
  ('satria', 'software-house-lead', 'Pedoman standar arsitektur, TDD, code review, dan sprint delivery', 'architecture'),
  ('satria', 'lean-cicd-devops', 'Setup Docker, Coolify reverse proxy, dan deployment VPS Ubuntu', 'devops'),
  ('satria', 'antislop-code', 'Code review hygiene: membersihkan boilerplate comments & generic AI slop', 'quality'),
  ('satria', 'requesting-code-review', 'Security scan, input validation sanitization, dan error boundary', 'security'),
  ('dimas', 'short-form-clipping', 'Potong video 9:16 vertikal dengan kinetic word-by-word subtitles', 'video'),
  ('dimas', 'video-stream-pipeline', 'Stream slicing native via yt-dlp dan FFmpeg (zero temp file bloat)', 'media'),
  ('dimas', 'kinetic-caption-engineering', 'Styling subtitle dinamis (Hormozi box & glow animation)', 'design'),
  ('salsa', 'antislop-copywriting', 'Menulis judul & caption punchy tanpa klise AI generik', 'copy'),
  ('salsa', 'metadata-optimization', 'Format judul YouTube Shorts <50 char & TikTok SEO curiosity gap', 'seo'),
  ('layla', 'bounty-compliance-check', 'Validasi Do''s & Don''ts campaign sebelum video diunggah', 'qa'),
  ('layla', 'submission-automation', 'Eksekusi setor link bukti upload ke portal bounty secepatnya', 'workflow'),
  ('budi', 'competitor-news-monitor', 'Pantau channel kompetitor dan tren algoritma Shorts/TikTok', 'research'),
  ('budi', 'heatmap-analysis', 'Identifikasi segmen paling banyak ditonton ulang (most replayed)', 'analytics'),
  ('raka', 'terminal-automation', 'Automasi cronjob dan background queue processing', 'automation'),
  ('raka', 'telegram-gateway', 'Routing pesan multi-agent via Telegram bot gateway', 'bot')
) AS s(agent_slug, name, description, category)
JOIN public.agents a ON a.slug = s.agent_slug;

-- ============================================================
-- SEED: Agent Memories
-- ============================================================

INSERT INTO public.agent_memories (agent_id, category, content)
SELECT a.id, m.category, m.content
FROM (VALUES
  ('coco', 'convention', 'Owner wajib disapa "dude" di semua bot/agent.'),
  ('coco', 'target', 'Target finansial: $1.500 sebelum 31 Desember 2026.'),
  ('coco', 'ops', 'Morning Executive Briefing dikirim maksimal jam 09:00 WIB.'),
  ('satria', 'rule', 'The Best Code is the Code Never Written (YAGNI).'),
  ('satria', 'infra', 'VPS Coolify di 43.134.28.4 (cheat-clip & agency-ops).'),
  ('satria', 'db', 'Gunakan Supabase PostgreSQL cloud untuk zero VPS disk/RAM overhead.'),
  ('dimas', 'clipper_rule', 'Hook banner atas wajib fade-out setelah 5-10 detik (maksimal 30s), dilarang statis full video.'),
  ('dimas', 'workflow', 'Batch standard: 3 video per batch (durasi 20-30 detik).'),
  ('dimas', 'storage', 'Gunakan Cloudflare R2 direct stream untuk zero disk burden.'),
  ('salsa', 'seo', 'Judul Shorts wajib <50 karakter agar tidak terpotong di feed mobile.'),
  ('salsa', 'tiktok', 'TikTok butuh caption curiosity gap pendek + 4-6 hashtag relevan.'),
  ('layla', 'bounty_rule', 'Semua bounty clip wajib disubmit SEGERA setelah posting untuk mencegah link expired.'),
  ('layla', 'affiliate', 'Amazon Associates (optionmarket-20) wajib TANPA VPN untuk cegah anti-fraud ban.'),
  ('budi', 'retention', 'Prioritaskan klip dengan lonjakan retensi >80% pada 5 detik pertama.'),
  ('raka', 'telegram', 'Telegram bot di group tidak bisa melihat sesama bot; inter-agent dispatch wajib server-side.')
) AS m(agent_slug, category, content)
JOIN public.agents a ON a.slug = m.agent_slug;

-- ============================================================
-- REALTIME: Enable realtime on agents table for live status sync
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_memories;

-- ============================================================
-- RLS: Permissive anon access (tighten when auth is added)
-- ============================================================

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "anon_update_agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "anon_read_memories" ON public.agent_memories FOR SELECT USING (true);
CREATE POLICY "anon_all_memories" ON public.agent_memories FOR ALL USING (true);
CREATE POLICY "anon_read_skills" ON public.agent_skills FOR SELECT USING (true);
