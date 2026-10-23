# 🏛️ Agency Ops CMS & 3D Virtual Headquarters

Command Center terintegrasi untuk agensi video clipping & affiliate marketing, menggabungkan:
1. **Mobile-First Operations CMS:** Sistem pemantauan distribusi konten 13+ channel harian (US Bounty Shorts, Indo Clipper, dan Affiliate) dengan alert instan Telegram tanpa boros token LLM.
2. **Desktop 3D Virtual Headquarters:** Kantor virtual 3D interaktif (Three.js Low-Poly) yang merefleksikan 7 agent AI agensi kita (Coco, Satria, Dimas, Salsa, Layla, Budi, Raka) dengan live state, audit memori, dan active skills.

Detail lengkap spesifikasi produk dan arsitektur sistem dapat dibaca di [PRD.md](./PRD.md).

---

## 🛠️ Tech Stack
* **Framework:** SvelteKit 5 (Runes) — Fullstack Monolith
* **Runtime:** Bun
* **Database & Realtime:** Supabase PostgreSQL & WebSockets
* **UI & Styling:** Tailwind CSS + `shadcn-svelte` (`bits-ui` primitives) + `lucide-svelte`
* **3D Visual (Desktop Only):** Three.js / Threlte Low-Poly Canvas
* **Alerts:** Telegram Bot HTTP Webhook (Zero-Token Notification)

---

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment Variables
Salin template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi kredensial Supabase dan Telegram Bot token Anda.

### 3. Database Migration
Jalankan skrip SQL di Supabase SQL Editor:
* File: [`supabase_schema.sql`](./supabase_schema.sql)

### 4. Jalankan Development Server
```bash
bun run dev
```
Akses di browser: `http://localhost:3001`

### 5. Build Production
```bash
bun run build
```
Production output menggunakan `@sveltejs/adapter-node` yang siap di-deploy via Docker/Coolify.
