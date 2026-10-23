# 🏛️ PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Project Name: Agency Ops & 3D Virtual Headquarters (agency-ops)
**Document Version:** 1.1.0  
**Status:** Approved for Implementation  
**Author:** Satria (Tech Lead) & Aal (Owner/Dude)  
**Date:** Oktober 2026  

---

## 1. Executive Summary & Visi Produk
**Agency Ops** adalah *Command Center* terintegrasi berbasis web monolitik yang menggabungkan dua kapabilitas utama:
1. **Mobile-First Operations CMS:** Sistem pencatatan dan pemantauan distribusi konten harian untuk 13+ channel media sosial agensi (US Clipper Bounty, Indo Clipper, dan Affiliate) dengan notifikasi instan tanpa membuang token AI.
2. **Desktop 3D Virtual Headquarters:** Visualisasi kantor virtual 3D interaktif (Three.js Low-Poly) yang merefleksikan 7 agent AI agensi (Coco, Satria, Dimas, Salsa, Layla, Budi, Raka), menampilkan status kerja riil (*Live State*), serta menjadi pusat inspeksi memori, skills, dan kepribadian tiap agent.

---

## 2. Latar Belakang & Masalah (Problem Statement)
* **Ketergantungan Nanya Manual di Chat:** Owner harus selalu bertanya status unggahan harian di grup/DM Telegram secara berulang (*"Channel A sudah upload belum? Link mana? Bounty sudah disubmit?"*).
* **Pemborosan Biaya Token LLM:** Menjawab pertanyaan status operasional berulang menggunakan LLM membuang jutaan token AI untuk hal yang seharusnya data mentah (CRUD).
* **Fragmentasi Data:** Link video, link bukti submission bounty (Whop/ClipHaus/Reach), dan status klip tercecer di riwayat obrolan tanpa rekapitulasi harian terpusat.
* **Ketiadaan Visibilitas Agent:** Aktivitas, memori jangka panjang, dan skill agent AI di VPS berjalan di latar belakang tanpa representasi visual yang mudah dipantau dan dikelola.

### Metrik Keberhasilan (Success Metrics)
* **Zero-Question Ops:** Owner dapat melihat status seluruh channel dalam waktu <2 detik saat membuka dashboard.
* **Zero-Token Pings:** 100% notifikasi unggahan dan submission bounty dikirim langsung via HTTP Webhook Telegram tanpa campur tangan LLM.
* **Zero GPU Burden on Mobile:** 0% beban WebGL pada perangkat seluler tim (load time HP <0.3 detik).

---

## 3. Strategi Perangkat & Pengguna (Adaptive Architecture)

Sistem menerapkan pemisahan rendering tegas berdasarkan resolusi layar (*Device-Aware Adaptive Rendering*):

| Parameter | Mode Mobile (< 768px) | Mode Desktop (≥ 768px) |
|---|---|---|
| **Target User** | Tim Lapangan (Editor/Clipper) & Owner di HP | Owner / Tech Lead di PC/Laptop |
| **Engine Visual** | **Pure Tailwind + shadcn/bits-ui** (Three.js *Unmounted*) | **Three.js Low-Poly 3D Canvas** + Floating HUD |
| **Beban Resource** | RAM < 15MB, 0% GPU load, instant scroll | WebGL 60 FPS, OrbitControls, Raycaster |
| **Tujuan Utama** | Kecepatan input link video & ubah status | Visual kantor interaktif & inspeksi memori agent |

---

## 4. Arsitektur Teknis & Tech Stack
* **Framework:** SvelteKit 5 (Runes State Management) — Monolitik (Frontend + Server Actions API dalam 1 servis).
* **Runtime:** Bun (Super fast startup, lightweight memory footprint).
* **UI Component System:** **shadcn-svelte (bits-ui primitives) + Tailwind CSS**
  * Memanfaatkan pustaka komponen terstandar yang sudah teruji aksesibilitasnya (Dialog, Sheet/Drawer, Tabs, Badge, Button, Input, Dropdown, Tooltip).
  * **Prinsip Engineering:** Utamakan paket/library resmi yang ringan dan terbukti stabil daripada membuat komponen interaktif dinamis manual dari nol (Don't Reinvent the Wheel).
* **Database & Realtime:** Supabase PostgreSQL (`xzspptnoaazsrffpxwvn.supabase.co`) dengan fitur Supabase Realtime WebSockets.
* **3D Graphics (Desktop Only):** Three.js / Threlte (Declarative Three.js for Svelte) + OrbitControls + Ambient Raycasting.
* **Icons:** `lucide-svelte`.
* **Styling & Theme:** Tailwind CSS — ColorHunt Midnight Navy (Latar `#010736`, Card `#0D1C42`, Border `#22396F`, Teks/Aksen `#FCF1D0`).
* **External Integration:** Telegram Bot API Webhook (Direct alert to Chat ID: `1575704919`).

---

## 5. Spesifikasi Fitur Utama

### Fitur 1: Mobile-First Operations CMS
* **Executive KPI Header:**
  * Date Picker: Navigasi cepat `[Kemarin]`, `[Hari Ini]`, `[Besok]`.
  * Quota Meter: Progress bar besar persentase video live harian (misal: `10/13 Videos Uploaded`).
  * Bounty Tracker: Jumlah submission bounty yang berhasil diverifikasi.
  * Warning Alarm: Indikator merah otomatis jika jam sudah melewati 21:00 WIB namun masih ada channel dengan status `DRAFT`.
* **Kategori Tab Filter:**
  * `Semua (13)`
  * `🔴 US Bounty Shorts (10)`
  * `📱 Indo Clipper (2)`
  * `🛒 Affiliate Amazon (1)`
* **Form Input Terpadu Tim (shadcn Dialog / Sheet):**
  * Input Judul Video, Link Video Publik (Shorts/TikTok/Pin), Link Drive Mentah.
  * Input Link Bukti Submission Bounty (Whop, ClipHaus, Reach, Content Rewards).
  * Status Selector (Badge Button):
    * ⚪ `DRAFT` — Belum siap / belum dikerjakan
    * 🟡 `READY` — Video siap di storage, menunggu jam upload
    * 🟢 `UPLOADED` — Video sudah tayang di media sosial
    * 🚀 `SUBMITTED` — Bukti bounty resmi di-submit ke dashboard brand
    * ⏸️ `ON HOLD` — Cooldown algoritma / evaluasi performa
    * ⛔ `OFF` — Jadwal libur / istirahat resmi
  * Field Nama PIC (Operator lapangan).
* **Zero-Token Telegram Webhook:**
  * Mengirim notifikasi otomatis saat status berubah menjadi `UPLOADED` atau `SUBMITTED` memuat data Channel, Slot, Judul, Link Video, dan Link Bounty.

---

### Fitur 2: 3D Virtual Headquarters (Desktop)
* **Ruangan Kantor 3D Low-Poly:**
  * Nuansa gelap elegan dengan lantai marmer navy, rak server mini, dan lampu meja hangat.
  * Kamera orbit terkontrol (*Pan, Zoom, Tilt*) dengan pembatas sudut agar tidak terbalik.
* **Meja 7 Agent Agensi:**
  1. 👑 **Meja Coco:** Central Orchestrator & PA Dude (Meja eksekutif depan, jadwal harian).
  2. 💻 **Meja Satria:** Tech Lead & Software Engineer (Multi-monitor, server rack, terminal).
  3. 🎬 **Meja Dimas:** Head of Clipper (Layar ultra-wide, timeline video, reel film).
  4. 📢 **Meja Salsa:** Lead Copywriter & Hooks (Meja estetik, papan sticky notes ide viral).
  5. 🎯 **Meja Layla:** Bounty Hunter & Quality Gate (Pinboard tracker submission bounty).
  6. 🔍 **Meja Budi:** Content Researcher (Papan grafik tren dan analitik kompetitor).
  7. 🤖 **Meja Raka:** Automation & Scraper (Workstation matrix, terminal pipeline bot).
* **Live Status Ambient Light:**
  * 🟢 **WORKING:** Monitor menyala, lampu aksen hijau, status bubble teks tugas aktif.
  * ⚪ **IDLE:** Lampu meja hangat, status bubble siaga.
  * ☕ **RESTING / NGOPI:** Efek cangkir kopi mengepul saat jadwal upload selesai.
* **War Room Screen:**
  * Layar raksasa interaktif di dinding tengah kantor yang menampilkan matriks performa 13 channel secara live.

---

### Fitur 3: Agent Brain Inspector (shadcn Drawer / Modal)
Terbuka ketika meja atau avatar salah satu agent di-klik di lingkungan 3D:
* **Identitas & Sifat:** Nama, role, avatar, sistem prompt, dan gaya komunikasi.
* **Live Task:** Apa yang sedang dieksekusi detik ini (misal: *"Rendering Clip #2 @optioncomedy"*).
* **Active Skills:** Daftar skill aktif yang terpasang pada agent tersebut.
* **Memory Editor:** Membaca dan memperbarui fakta memori jangka panjang agent langsung dari UI web tanpa perlu CLI.

---

### Fitur 4: Central Activity Feed & Audit Log
* Ticker log aktivitas berjalan di bagian bawah layar mencatat riwayat kronologis:
  * Waktu kejadian, aktor (nama tim atau nama agent), aksi, dan detail tautan.

---

## 6. Desain Skema Database (Supabase PostgreSQL)

```sql
-- 1. TABEL CHANNELS
CREATE TABLE public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    handle TEXT,
    platform TEXT NOT NULL, -- 'youtube_shorts' | 'tiktok' | 'pinterest'
    category TEXT NOT NULL, -- 'clipper_us' | 'clipper_indo' | 'affiliate'
    niche TEXT NOT NULL,
    target_daily_quota INT NOT NULL DEFAULT 1,
    bounty_platform TEXT DEFAULT 'Whop',
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL CONTENT_LOGS (Harian & Realtime)
CREATE TABLE public.content_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    slot TEXT NOT NULL, -- 'pagi' | 'siang' | 'sore' | 'malam'
    video_title TEXT,
    video_url TEXT,
    drive_url TEXT,
    bounty_submission_url TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    views_count INT DEFAULT 0,
    pic_name TEXT DEFAULT 'Tim',
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(channel_id, date, slot)
);

-- 3. TABEL AGENTS (Profil & Live State)
CREATE TABLE public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- 'coco', 'satria', 'dimas', dll.
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'IDLE', -- 'IDLE' | 'WORKING' | 'THINKING' | 'RESTING'
    current_task TEXT,
    personality TEXT,
    desk_color TEXT DEFAULT '#22396F',
    desk_position JSONB, -- { "x": 0, "y": 0, "z": 0 }
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABEL AGENT_MEMORIES (Memori Jangka Panjang)
CREATE TABLE public.agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'convention' | 'preference' | 'platform_rule'
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABEL AGENT_SKILLS (Kemampuan & SOP)
CREATE TABLE public.agent_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true
);

-- 6. TABEL ACTIVITY_LOGS (Audit Trail)
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    channel_slug TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. Roadmap & Milestone Eksekusi

### 🏁 Fase 1: Core Operations & Mobile CMS (Prioritas Teratas)
* Eksekusi SQL schema di Supabase.
* Setup library komponen UI (`bits-ui` / `shadcn-svelte` primitives + Tailwind CSS).
* Pembuatan UI Mobile CMS responsif (KPI summary, list 13 channel, form modal/drawer, status toggle).
* Integrasi Webhook notifikasi Telegram ke dude.
* *Deliverable:* Tim sudah bisa langsung menggunakan CMS ini untuk operasional harian.

### 🏢 Fase 2: 3D Virtual Headquarters Canvas (Desktop)
* Integrasi Three.js engine dengan proteksi `if (screenWidth >= 768)`.
* Pembangunan ruangan kantor 3D, meja 7 agent, dan monitor War Room.
* Implementasi Raycasting klik meja & efek hover interaktif.

### 🧠 Fase 3: Agent Brain & Live Synchronization
* Pembuatan Drawer/Sheet "Agent Brain" menggunakan komponen headless yang sudah ada (inspeksi memori, skills, prompt).
* Koneksi Realtime WebSocket Supabase agar status 3D dan mobile berubah live tanpa refresh.
* Fitur edit memori langsung dari dashboard.
