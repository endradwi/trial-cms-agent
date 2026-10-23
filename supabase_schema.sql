-- AGENCY OPERATIONS CMS SCHEMA (12+ Channels, Logs, Audit)
-- Execute this script once in Supabase SQL Editor: https://supabase.com/dashboard/project/xzspptnoaazsrffpxwvn/sql/new

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    handle TEXT,
    platform TEXT NOT NULL, -- 'youtube_shorts', 'tiktok', 'pinterest'
    category TEXT NOT NULL, -- 'clipper_us', 'clipper_indo', 'affiliate'
    niche TEXT NOT NULL,
    target_daily_quota INT NOT NULL DEFAULT 1,
    bounty_platform TEXT DEFAULT 'Whop',
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CONTENT SCHEDULE & UPLOAD LOGS
CREATE TABLE IF NOT EXISTS public.content_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    slot TEXT NOT NULL, -- 'pagi', 'siang', 'sore', 'malam'
    video_title TEXT,
    video_url TEXT,
    drive_url TEXT,
    bounty_submission_url TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'READY', 'UPLOADED', 'SUBMITTED', 'ON_HOLD', 'OFF'
    views_count INT DEFAULT 0,
    pic_name TEXT DEFAULT 'Tim',
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(channel_id, date, slot)
);

-- 3. AUDIT & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    channel_slug TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) but allow read/write for anon and authenticated
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on channels" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Allow public all on channels" ON public.channels FOR ALL USING (true);

CREATE POLICY "Allow public read on content_logs" ON public.content_logs FOR SELECT USING (true);
CREATE POLICY "Allow public all on content_logs" ON public.content_logs FOR ALL USING (true);

CREATE POLICY "Allow public read on activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public all on activity_logs" ON public.activity_logs FOR ALL USING (true);

-- Enable Realtime for content_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_logs;

-- SEED 13 ACTIVE CHANNELS FROM MASTER CALENDAR
INSERT INTO public.channels (slug, name, handle, platform, category, niche, target_daily_quota, bounty_platform, sort_order) VALUES
('optioncomedy', 'Option Comedy', '@optioncomedy', 'youtube_shorts', 'clipper_us', 'Ahmed Comedy / Bounty', 1, 'Whop', 1),
('optionspeak', 'Option Speak', '@OptionSpeak-i7c', 'youtube_shorts', 'clipper_us', 'Mark Manson / Self-Help', 1, 'Whop', 2),
('optionvideo', 'Option Video', '@optionvideo-u8y', 'youtube_shorts', 'clipper_us', 'Escape / Ridge / Tech', 1, 'Whop', 3),
('optionfamily', 'Option Family', 'Option Family', 'youtube_shorts', 'clipper_us', 'Zach Justice / Pop Culture', 1, 'Whop', 4),
('optionquest', 'Option Quest', '@optionquest-k4y', 'youtube_shorts', 'clipper_us', 'Gaming / SEGA / Elden Ring', 1, 'Reach', 5),
('popframe', 'Popframe', 'Popframe', 'youtube_shorts', 'clipper_us', 'TSHA / Alyssa Clips', 1, 'ClipHaus', 6),
('optioncards', 'Option Cards', 'Option Cards', 'youtube_shorts', 'clipper_us', 'Nettyworth / Finance', 1, 'Content Rewards', 7),
('billroyce', 'Billi Royce', 'Billi Royce', 'youtube_shorts', 'clipper_us', 'Celebrity / Pop News', 1, 'Whop', 8),
('cocojones', 'Coco Jones', 'Coco Jones', 'youtube_shorts', 'clipper_us', 'Bounty Creator Clips', 1, 'Whop', 9),
('henrymorris', 'Henry Morris', 'Henry Morris', 'youtube_shorts', 'clipper_us', 'Tech / Commentary', 1, 'Whop', 10),
('kisahcuan', 'Kisah Cuan', '@kisahcuan', 'tiktok', 'clipper_indo', 'Bevan Crypto / Trading (3x/hari)', 3, 'Internal', 11),
('ruangcerita', 'Ruang Cerita', '@ruangcerita.id', 'tiktok', 'clipper_indo', 'Vior ProtaBumin (3x/hari)', 3, 'Internal', 12),
('optionmarket', 'Option Market', '@optionmarket5', 'youtube_shorts', 'affiliate', 'Amazon Affiliate (Store: optionmarket-20)', 2, 'Amazon / Benable', 13)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    handle = EXCLUDED.handle,
    niche = EXCLUDED.niche,
    target_daily_quota = EXCLUDED.target_daily_quota;
