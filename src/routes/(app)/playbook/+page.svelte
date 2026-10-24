<script lang="ts">
  import {
    BookOpen,
    Calendar,
    Clock,
    Film,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Globe,
    Bot,
    ExternalLink,
    Sparkles,
    Copy,
    Check
  } from 'lucide-svelte';

  let copiedItem = $state<string | null>(null);

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedItem = id;
      setTimeout(() => {
        copiedItem = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }
</script>

<svelte:head>
  <title>Agency Playbook & SOP — Option Agency</title>
</svelte:head>

<div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
  <!-- Top Header (ColorHunt Warm Light Palette) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-mono text-[#8f7556] uppercase tracking-wider font-bold">Standard Operating Procedure</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-[#2d2b28] mt-1 flex items-center gap-2">
        <BookOpen size={22} class="text-[#8f7556]" />
        <span>Agency Playbook & Master Guidelines</span>
      </h1>
      <p class="text-xs text-[#7a756f] mt-1 font-mono">
        Buku pedoman resmi agensi: jadwal posting harian, aturan editing video, protokol VPN, dan alur bounty.
      </p>
    </div>

    <!-- Target Goal & Version Pill -->
    <div class="flex items-center gap-2.5 bg-[#efe9e3] px-3.5 py-2 rounded-xl border border-[#d9cfc7] text-xs font-mono">
      <Sparkles size={15} class="text-[#8f7556]" />
      <div class="flex flex-col">
        <span class="text-[10px] text-[#7a756f]">AGENCY TARGET</span>
        <span class="font-bold text-[#2d2b28]">$1,500 by Dec 31, 2026</span>
      </div>
    </div>
  </div>

  <!-- SECTION 1: JADWAL & KUOTA UPLOAD (MASTER SCHEDULE) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#efe9e3] border border-[#c9b59c] flex items-center justify-center text-[#8f7556]">
          <Calendar size={18} />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#2d2b28]">1. Jadwal & Kuota Upload per Channel</h2>
          <p class="text-xs font-mono text-[#7a756f]">Jadwal waktu rilis konten harian agensi dalam zona WIB (UTC+7)</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#efe9e3] text-[#8f7556] font-bold border border-[#d9cfc7]">
        SOP OPERASIONAL
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
      <!-- Schedule Card 1: Clipper US -->
      <div class="p-4 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-[#2d2b28]">Clipper US (10 Channel)</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffffff] border border-[#d9cfc7] text-[#8f7556] font-semibold">
              Shorts Bounty
            </span>
          </div>
          <div class="space-y-2 text-xs font-mono">
            <div class="p-2.5 rounded-lg bg-[#ffffff] border border-[#d9cfc7]">
              <div class="font-bold text-[#8f7556] text-[11px] mb-1">📅 Senin – Kamis (Hari Kerja)</div>
              <div class="text-[#2d2b28] font-bold flex items-center gap-1.5">
                <Clock size={12} class="text-[#7a756f]" />
                <span>1 Video / Hari (Slot Malam: 20:00 WIB)</span>
              </div>
            </div>
            <div class="p-2.5 rounded-lg bg-[#ffffff] border border-[#d9cfc7]">
              <div class="font-bold text-[#8f7556] text-[11px] mb-1">🔥 Jumat – Minggu (Weekend)</div>
              <div class="text-[#2d2b28] font-bold space-y-1">
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Pagi: 09:00 WIB</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Malam: 20:00 WIB</span>
                </div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-1">Total: 2 Video / Hari</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-[10px] font-mono text-[#7a756f] pt-2 border-t border-[#d9cfc7]/60">
          Standar Batch: 3 video per siklus editing
        </div>
      </div>

      <!-- Schedule Card 2: Clipper Indo -->
      <div class="p-4 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-[#2d2b28]">Clipper Indo (2 Channel)</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffffff] border border-[#d9cfc7] text-teal-700 font-semibold">
              TikTok Indo
            </span>
          </div>
          <div class="space-y-2 text-xs font-mono">
            <div class="p-2.5 rounded-lg bg-[#ffffff] border border-[#d9cfc7]">
              <div class="font-bold text-teal-800 text-[11px] mb-1">⚡ Setiap Hari (Senin – Minggu)</div>
              <div class="text-[#2d2b28] font-bold space-y-1">
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Siang: 12:00 WIB</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Sore: 16:00 WIB</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Malam: 20:00 WIB</span>
                </div>
                <div class="text-[10px] text-teal-700 font-semibold mt-1">Total: 3 Video / Hari</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-[10px] font-mono text-[#7a756f] pt-2 border-t border-[#d9cfc7]/60">
          Channel: @kisahcuan & @ruangcerita.id
        </div>
      </div>

      <!-- Schedule Card 3: Affiliate US -->
      <div class="p-4 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-[#2d2b28]">Affiliate (Option Market)</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffffff] border border-[#d9cfc7] text-amber-800 font-semibold">
              Amazon & Benable
            </span>
          </div>
          <div class="space-y-2 text-xs font-mono">
            <div class="p-2.5 rounded-lg bg-[#ffffff] border border-[#d9cfc7]">
              <div class="font-bold text-[#8f7556] text-[11px] mb-1">🛒 Setiap Hari (Multi-Platform)</div>
              <div class="text-[#2d2b28] font-bold space-y-1">
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Siang: 12:00 WIB</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Clock size={12} class="text-[#7a756f]" />
                  <span>Slot Malam: 20:00 WIB</span>
                </div>
                <div class="text-[10px] text-amber-700 font-semibold mt-1">Total: 2 Post / Hari</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-[10px] font-mono text-[#7a756f] pt-2 border-t border-[#d9cfc7]/60">
          Standar Batch: 10 post (7 foto carousel, 3 demo video)
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 2: ATURAN EDITING & HOOK BANNER -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#efe9e3] border border-[#c9b59c] flex items-center justify-center text-[#8f7556]">
          <Film size={18} />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#2d2b28]">2. Aturan Standar Editing Video (Production SOP)</h2>
          <p class="text-xs font-mono text-[#7a756f]">Spesifikasi format, hook banner, dan retensi algoritma Shorts</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-300">
        QUALITY GATE
      </span>
    </div>

    <!-- CRITICAL RULE BOX: HOOK BANNER FADE OUT -->
    <div class="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-2">
      <div class="flex items-center gap-2 font-bold text-xs text-amber-900 font-mono">
        <AlertTriangle size={16} class="text-amber-700 shrink-0" />
        <span>ATURAN KRUSIAL: Hook Banner Wajib Fade-Out</span>
      </div>
      <p class="text-xs text-amber-950 leading-relaxed font-sans">
        Banner hook teks di bagian paling atas video <strong>WAJIB FADE-OUT setelah 5–10 detik</strong> (maksimal 30 detik).
        <strong>DILARANG KERAS</strong> membiarkan hook banner statis nempel terus sepanjang video! Hook banner statis akan menurunkan retensi audiens dan watch-time algoritma YouTube Shorts.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
      <div class="p-3.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] space-y-1.5">
        <div class="font-bold text-xs text-[#2d2b28] flex items-center gap-1.5">
          <CheckCircle2 size={14} class="text-emerald-700" />
          <span>Format & Rasio Video</span>
        </div>
        <p class="text-[11px] text-[#7a756f] leading-relaxed">
          Wajib <strong>9:16 Vertical (1080 x 1920)</strong>. Frame 60fps atau 30fps smooth. Safe zone 15% atas dan bawah agar teks tidak terpotong tombol UI YouTube.
        </p>
      </div>

      <div class="p-3.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] space-y-1.5">
        <div class="font-bold text-xs text-[#2d2b28] flex items-center gap-1.5">
          <CheckCircle2 size={14} class="text-emerald-700" />
          <span>Subtitle Kinetic Dynamic</span>
        </div>
        <p class="text-[11px] text-[#7a756f] leading-relaxed">
          Gunakan teks karaoke / word-by-word highlight warna kuning / hijau terang. Font tebal, bold, kontras tinggi di tengah layar.
        </p>
      </div>

      <div class="p-3.5 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] space-y-1.5">
        <div class="font-bold text-xs text-[#2d2b28] flex items-center gap-1.5">
          <CheckCircle2 size={14} class="text-emerald-700" />
          <span>Audio Balance (-14 LUFS)</span>
        </div>
        <p class="text-[11px] text-[#7a756f] leading-relaxed">
          Volume suara vokal/dialogue harus dominan dan jernih. Volume Backsound Music (BGM) dibatasi maksimal 15–20% dari audio utama.
        </p>
      </div>
    </div>
  </div>

  <!-- SECTION 3: PROTOKOL VPN & KEAMANAN AKUN (ANTI-FRAUD) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#efe9e3] border border-[#c9b59c] flex items-center justify-center text-[#8f7556]">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#2d2b28]">3. Protokol VPN & Anti-Fraud Keamanan Akun</h2>
          <p class="text-xs font-mono text-[#7a756f]">Aturan akses IP untuk mencegah ban akun Amazon Associates & platform US</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-bold border border-rose-300">
        SECURITY STRICT
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Rule A: Amazon Associates NO VPN -->
      <div class="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
        <div class="flex items-center justify-between">
          <div class="font-bold text-xs text-rose-900 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Amazon Associates: DILARANG PAKAI VPN</span>
          </div>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-rose-800 border border-rose-300 font-bold">
            IP LOKAL SAJA
          </span>
        </div>
        <p class="text-xs text-rose-950 leading-relaxed font-sans">
          Saat login ke portal <strong>Amazon Associates</strong> dan membuat link produk via <strong>SiteStripe</strong>,
          <strong>WAJIB TANPA VPN</strong> (gunakan koneksi IP asli Indonesia). Sistem anti-fraud Amazon mendeteksi proxy/VPN dan akan memblokir akun afiliasi jika terdeteksi.
        </p>
        <div class="p-2 rounded-lg bg-white border border-rose-200 text-[11px] font-mono text-[#2d2b28] flex items-center justify-between">
          <span>Store ID: <strong>optionmarket-20</strong></span>
          <button
            onclick={() => copyText('optionmarket-20', 'store-id')}
            class="text-[10px] text-[#8f7556] hover:underline flex items-center gap-1 font-bold"
          >
            {#if copiedItem === 'store-id'}
              <Check size={12} class="text-emerald-700" />
              <span class="text-emerald-700">Tersalin!</span>
            {:else}
              <Copy size={12} />
              <span>Salin ID</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Rule B: TikTok US & Pinterest US MUST USE VPN -->
      <div class="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-2">
        <div class="flex items-center justify-between">
          <div class="font-bold text-xs text-cyan-900 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-600"></span>
            <span>TikTok US & Pinterest: WAJIB US VPN</span>
          </div>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-cyan-800 border border-cyan-300 font-bold">
            US IP ONLY
          </span>
        </div>
        <p class="text-xs text-cyan-950 leading-relaxed font-sans">
          Saat login dan mendistribusikan video ke akun <strong>TikTok US (@optionmarket5)</strong> dan <strong>Pinterest</strong>,
          <strong>WAJIB AKTIFKAN US VPN</strong> agar feed dan algoritma rekomendasi tepat sasaran masuk ke audiens Amerika Serikat.
        </p>
        <div class="p-2 rounded-lg bg-white border border-cyan-200 text-[11px] font-mono text-[#2d2b28] flex items-center justify-between">
          <span>TikTok: <strong>@optionmarket5</strong></span>
          <a
            href="https://www.tiktok.com/@optionmarket5"
            target="_blank"
            rel="noreferrer"
            class="text-[10px] text-cyan-800 hover:underline flex items-center gap-0.5 font-bold"
          >
            <span>Buka Profil</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: DISTRIBUSI LINK AFILIASI (BENABLE & PINTEREST) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#efe9e3] border border-[#c9b59c] flex items-center justify-center text-[#8f7556]">
          <Globe size={18} />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#2d2b28]">4. Kebijakan Link Distribusi Afiliasi</h2>
          <p class="text-xs font-mono text-[#7a756f]">Aturan penempatan link produk affiliate agar tidak dihapus platform</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#efe9e3] text-[#8f7556] font-bold border border-[#d9cfc7]">
        LINK STRATEGY
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Strategy 1: YouTube Shorts & TikTok -->
      <div class="p-4 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] space-y-2">
        <div class="font-bold text-xs text-[#2d2b28] flex items-center gap-1.5">
          <CheckCircle2 size={14} class="text-[#8f7556]" />
          <span>YouTube Shorts & TikTok: Benable in Bio</span>
        </div>
        <p class="text-xs text-[#7a756f] leading-relaxed">
          Platform Shorts & TikTok mematikan clickable link di deskripsi/komentar. Karena itu, seluruh traffic diarahkan ke satu link bio Benable:
        </p>
        <div class="p-2.5 rounded-lg bg-[#ffffff] border border-[#d9cfc7] flex items-center justify-between font-mono text-xs">
          <span class="text-[#8f7556] font-bold">benable.com/option_market</span>
          <button
            onclick={() => copyText('https://benable.com/option_market', 'benable-url')}
            class="text-[11px] text-[#2d2b28] hover:text-[#8f7556] flex items-center gap-1 font-bold"
          >
            {#if copiedItem === 'benable-url'}
              <Check size={12} class="text-emerald-700" />
              <span class="text-emerald-700">Tersalin!</span>
            {:else}
              <Copy size={12} />
              <span>Salin</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Strategy 2: Pinterest Hybrid -->
      <div class="p-4 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7] space-y-2">
        <div class="font-bold text-xs text-[#2d2b28] flex items-center gap-1.5">
          <CheckCircle2 size={14} class="text-[#8f7556]" />
          <span>Pinterest: Hybrid Distribution</span>
        </div>
        <p class="text-xs text-[#7a756f] leading-relaxed">
          Pinterest mendukung link langsung namun memerlukan variasi agar tidak terkena spam filter:
        </p>
        <div class="space-y-1.5 text-xs font-mono">
          <div class="p-2 rounded-lg bg-[#ffffff] border border-[#d9cfc7] flex items-center justify-between">
            <span>70% Pin</span>
            <span class="font-bold text-[#8f7556]">Link ke Koleksi Benable</span>
          </div>
          <div class="p-2 rounded-lg bg-[#ffffff] border border-[#d9cfc7] flex items-center justify-between">
            <span>30% Pin</span>
            <span class="font-bold text-amber-800">Direct Amazon + Tag #affiliate</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 5: SOP BOUNTY SUBMISSION (WHOP, CLIPHAUS, REACH, REWARDS) -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#efe9e3] border border-[#c9b59c] flex items-center justify-center text-[#8f7556]">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#2d2b28]">5. SOP Submission Bounty (Whop, ClipHaus, Reach)</h2>
          <p class="text-xs font-mono text-[#7a756f]">Prosedur klaim imbalan bounty agar tidak expired</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
        REWARD CLAIM
      </span>
    </div>

    <div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2 text-xs font-sans text-emerald-950">
      <div class="font-bold text-emerald-900 font-mono text-[11px] flex items-center gap-1.5">
        <Clock size={14} class="text-emerald-700" />
        <span>SUBMISSION SEKETIKA (ZERO DELAY)</span>
      </div>
      <p class="leading-relaxed">
        Seluruh video bounty yang telah selesai di-upload ke YouTube Shorts <strong>WAJIB LANGSUNG DISUBMIT</strong> pada saat yang sama ke platform penyedia bounty (Whop, Content Rewards, ClipHaus, Reach).
      </p>
      <ul class="list-disc pl-5 space-y-1 text-[11px] font-mono text-emerald-900">
        <li>Jangan ditunda keesokan hari agar URL video tidak expired dari window campaign reward.</li>
        <li>Pastikan link video yang disubmit berformat Shorts publik yang valid.</li>
        <li>Tandai status slot di menu <strong>Channel Tasks</strong> menjadi <span class="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">SUBMITTED</span>.</li>
      </ul>
    </div>
  </div>

  <!-- SECTION 6: TEAM ROLES & AI AGENT DISPATCHER -->
  <div class="bg-[#ffffff] border border-[#d9cfc7] p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
    <div class="flex items-center justify-between border-b border-[#d9cfc7]/60 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#efe9e3] border border-[#c9b59c] flex items-center justify-center text-[#8f7556]">
          <Bot size={18} />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#2d2b28]">6. Struktur & Pembagian Peran AI Agent</h2>
          <p class="text-xs font-mono text-[#7a756f]">Matriks tanggung jawab agen otonom di bawah koordinasi dude</p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#efe9e3] text-[#8f7556] font-bold border border-[#d9cfc7]">
        7 AGENTS ACTIVE
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
        <div class="font-bold text-xs text-[#2d2b28]">Coco (@coco_vendor_bot)</div>
        <div class="text-[10px] font-mono text-[#8f7556] mb-1">PA & Orchestrator</div>
        <p class="text-[11px] text-[#7a756f]">Menangani webhook Telegram, dispatch tugas harian, dan koordinasi antar agen.</p>
      </div>

      <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
        <div class="font-bold text-xs text-[#2d2b28]">Satria (Tech Lead)</div>
        <div class="text-[10px] font-mono text-[#8f7556] mb-1">Architecture & DevOps</div>
        <p class="text-[11px] text-[#7a756f]">Memimpin software engineering, VPS Coolify, API, dashboard CMS, & database.</p>
      </div>

      <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
        <div class="font-bold text-xs text-[#2d2b28]">Dimas</div>
        <div class="text-[10px] font-mono text-[#8f7556] mb-1">Clipper Lead</div>
        <p class="text-[11px] text-[#7a756f]">Automasi download video, cutting klip, ffmpeg processing, & auto-scheduler.</p>
      </div>

      <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
        <div class="font-bold text-xs text-[#2d2b28]">Salsa</div>
        <div class="text-[10px] font-mono text-[#8f7556] mb-1">QA & Scriptwriter</div>
        <p class="text-[11px] text-[#7a756f]">Audit kualitas hook banner (fade-out rule), retensi cerita, & typo checking.</p>
      </div>

      <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
        <div class="font-bold text-xs text-[#2d2b28]">Layla</div>
        <div class="text-[10px] font-mono text-[#8f7556] mb-1">Affiliate Specialist</div>
        <p class="text-[11px] text-[#7a756f]">Kurasi produk Amazon trending, manajemen katalog Benable, & Pinterest.</p>
      </div>

      <div class="p-3 rounded-xl bg-[#f9f8f6] border border-[#d9cfc7]">
        <div class="font-bold text-xs text-[#2d2b28]">Budi & Raka</div>
        <div class="text-[10px] font-mono text-[#8f7556] mb-1">Research & Analytics</div>
        <p class="text-[11px] text-[#7a756f]">Riset kompetitor, tracking bounty Whop/Reach, & analitik performa views.</p>
      </div>
    </div>
  </div>
</div>
