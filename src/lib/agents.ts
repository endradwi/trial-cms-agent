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
  skills: Array<{ name: string; description: string; category: string }>;
  memories: Array<{ category: string; content: string }>;
}

export const AGENCY_AGENTS: AgentProfile[] = [
  {
    id: 'agent_coco',
    slug: 'coco',
    name: 'Coco',
    title: 'PA & Central Orchestrator',
    role: 'Executive Personal Assistant & Task Dispatcher (@coco_vendor_bot)',
    avatarIcon: '👑',
    accentColor: '#FFE600', // Gold
    status: 'IDLE',
    currentTask: 'Standby koordinasi task & jadwal 13 channel',
    personality: 'Responsif, terorganisir tinggi, mengawal seluruh koordinasi agensi dan briefing pagi.',
    deskPos: { x: 0, y: 0, z: 2 },
    skills: [
      { name: 'morning-briefing', description: 'Ekstraksi metrik & rekap performa 13 channel setiap jam 08:30 WIB', category: 'ops' },
      { name: 'bounty-dispatch', description: 'Delegasi task bounty ke Dimas & tim clipper', category: 'workflow' },
      { name: 'channel-scheduler', description: 'Mengawal slot upload harian agar zero miss', category: 'scheduling' }
    ],
    memories: [
      { category: 'convention', content: 'Owner wajib disapa "dude" di semua bot/agent.' },
      { category: 'target', content: 'Target finansial: $1.500 sebelum 31 Desember 2026.' },
      { category: 'ops', content: 'Morning Executive Briefing dikirim maksimal jam 09:00 WIB.' }
    ]
  },
  {
    id: 'agent_satria',
    slug: 'satria',
    name: 'Satria',
    title: 'Tech Lead & Lead Software Engineer',
    role: 'Divisi Software House, Architecture, Code Review, Fullstack & DevOps',
    avatarIcon: '💻',
    accentColor: '#00E5FF', // Cyan
    status: 'WORKING',
    currentTask: 'Mengembangkan Agency Ops Monolith & Zero-Token Telegram Spy',
    personality: 'Senior Pragmatic Developer: Tegas, rasional, YAGNI, anti-slop, mengutamakan working software over comprehensive documentation.',
    deskPos: { x: 4.5, y: 0, z: -1 },
    skills: [
      { name: 'software-house-lead', description: 'Pedoman standar arsitektur, TDD, code review, dan sprint delivery', category: 'architecture' },
      { name: 'lean-cicd-devops', description: 'Setup Docker, Coolify reverse proxy, dan deployment VPS Ubuntu', category: 'devops' },
      { name: 'antislop-code', description: 'Code review hygiene: membersihkan boilerplate comments & generic AI slop', category: 'quality' },
      { name: 'requesting-code-review', description: 'Security scan, input validation sanitization, dan error boundary', category: 'security' }
    ],
    memories: [
      { category: 'rule', content: 'The Best Code is the Code Never Written (YAGNI).' },
      { category: 'infra', content: 'VPS Coolify di 43.134.28.4 (cheat-clip & agency-ops).' },
      { category: 'db', content: 'Gunakan Supabase PostgreSQL cloud untuk zero VPS disk/RAM overhead.' }
    ]
  },
  {
    id: 'agent_dimas',
    slug: 'dimas',
    name: 'Dimas',
    title: 'Head of Video Clipper',
    role: 'Video Editing Engine, Kinetic Subtitles, Hook Banner & FFmpeg Stream-Slicing',
    avatarIcon: '🎬',
    accentColor: '#FF6B00', // Orange
    status: 'IDLE',
    currentTask: 'Standby antrean klip YouTube Shorts & TikTok',
    personality: 'Spesialis video retensi tinggi: paham ritme visual, punchy subtitles, dan aturan anti-banned medsos.',
    deskPos: { x: -4.5, y: 0, z: -1 },
    skills: [
      { name: 'short-form-clipping', description: 'Potong video 9:16 vertikal dengan kinetic word-by-word subtitles', category: 'video' },
      { name: 'video-stream-pipeline', description: 'Stream slicing native via yt-dlp dan FFmpeg (zero temp file bloat)', category: 'media' },
      { name: 'kinetic-caption-engineering', description: 'Styling subtitle dinamis (Hormozi box & glow animation)', category: 'design' }
    ],
    memories: [
      { category: 'clipper_rule', content: 'Hook banner atas wajib fade-out setelah 5-10 detik (maksimal 30s), dilarang statis full video.' },
      { category: 'workflow', content: 'Batch standard: 3 video per batch (durasi 20-30 detik).' },
      { category: 'storage', content: 'Gunakan Cloudflare R2 direct stream untuk zero disk burden.' }
    ]
  },
  {
    id: 'agent_salsa',
    slug: 'salsa',
    name: 'Salsa',
    title: 'Lead Copywriter & Hooks Specialist',
    role: 'Viral Hook Titles, Platform-Specific Metadata & SEO Keywords',
    avatarIcon: '📢',
    accentColor: '#FF2A85', // Pink
    status: 'IDLE',
    currentTask: 'Menyusun hook bank untuk kampanye Whop & SEGA',
    personality: 'Kreatif, tajam dalam psikologi audiens, anti-clickbait murahan tapi sangat clicky.',
    deskPos: { x: -4.5, y: 0, z: 2.5 },
    skills: [
      { name: 'antislop-copywriting', description: 'Menulis judul & caption punchy tanpa klise AI generik', category: 'copy' },
      { name: 'metadata-optimization', description: 'Format judul YouTube Shorts <50 char & TikTok SEO curiosity gap', category: 'seo' }
    ],
    memories: [
      { category: 'seo', content: 'Judul Shorts wajib <50 karakter agar tidak terpotong di feed mobile.' },
      { category: 'tiktok', content: 'TikTok butuh caption curiosity gap pendek + 4-6 hashtag relevan.' }
    ]
  },
  {
    id: 'agent_layla',
    slug: 'layla',
    name: 'Layla',
    title: 'Bounty Hunter & QA Manager',
    role: 'Quality Gate & Compliance Submissions (Whop, ClipHaus, Reach, Content Rewards)',
    avatarIcon: '🎯',
    accentColor: '#10B981', // Emerald Green
    status: 'IDLE',
    currentTask: 'Monitoring verifikasi submission bounty hari ini',
    personality: 'Teliti, disiplin tenggat waktu, sangat protektif terhadap aturan brand agar klip tidak didiskualifikasi.',
    deskPos: { x: 4.5, y: 0, z: 2.5 },
    skills: [
      { name: 'bounty-compliance-check', description: 'Validasi Do\'s & Don\'ts campaign sebelum video diunggah', category: 'qa' },
      { name: 'submission-automation', description: 'Eksekusi setor link bukti upload ke portal bounty secepatnya', category: 'workflow' }
    ],
    memories: [
      { category: 'bounty_rule', content: 'Semua bounty clip wajib disubmit SEGERA setelah posting untuk mencegah link expired.' },
      { category: 'affiliate', content: 'Amazon Associates (optionmarket-20) wajib TANPA VPN untuk cegah anti-fraud ban.' }
    ]
  },
  {
    id: 'agent_budi',
    slug: 'budi',
    name: 'Budi',
    title: 'Content Researcher',
    role: 'Viral Topic Discovery, Sound Trend Watcher, & Competitor Analytics',
    avatarIcon: '🔍',
    accentColor: '#3B82F6', // Blue
    status: 'IDLE',
    currentTask: 'Analisis retensi topik gaming & comedy podcast',
    personality: 'Berbasis data analitik, fokus pada heatmap lonjakan retensi penonton.',
    deskPos: { x: -2.5, y: 0, z: -3.5 },
    skills: [
      { name: 'competitor-news-monitor', description: 'Pantau channel kompetitor dan tren algoritma Shorts/TikTok', category: 'research' },
      { name: 'heatmap-analysis', description: 'Identifikasi segmen paling banyak ditonton ulang (most replayed)', category: 'analytics' }
    ],
    memories: [
      { category: 'retention', content: 'Prioritaskan klip dengan lonjakan retensi >80% pada 5 detik pertama.' }
    ]
  },
  {
    id: 'agent_raka',
    slug: 'raka',
    name: 'Raka',
    title: 'Automation & Scraper Engineer',
    role: 'Scraper Pipeline, Telegram Bot Gateway, & API Integrations',
    avatarIcon: '🤖',
    accentColor: '#A855F7', // Purple
    status: 'IDLE',
    currentTask: 'Standby Telegram Gateway port 9119 & alerting',
    personality: 'Tenang, metodis, ahli dalam automasi headless browser dan event queue.',
    deskPos: { x: 2.5, y: 0, z: -3.5 },
    skills: [
      { name: 'terminal-automation', description: 'Automasi cronjob dan background queue processing', category: 'automation' },
      { name: 'telegram-gateway', description: 'Routing pesan multi-agent via Telegram bot gateway', category: 'bot' }
    ],
    memories: [
      { category: 'telegram', content: 'Telegram bot di group tidak bisa melihat sesama bot; inter-agent dispatch wajib server-side.' }
    ]
  }
];
