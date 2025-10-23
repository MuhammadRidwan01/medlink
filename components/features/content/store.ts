"use client";

export type ArticleStatus = "draft" | "scheduled" | "published";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  coverUrl: string;
  readMinutes: number;
  createdAt: string;
  scheduledAt?: string;
  publishedAt?: string;
};

type ContentState = {
  articles: Article[];
};

const STORAGE_KEY = "ml-content-store-v1";
const EVENT_KEY = "content:update";

let state: ContentState = { articles: [] };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw) as ContentState;
  } catch {}
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  const ev = new CustomEvent<ContentState>(EVENT_KEY, { detail: state });
  window.dispatchEvent(ev);
}

if (typeof window !== "undefined") {
  load();
  if (!state.articles.length) {
    const now = new Date().toISOString();
    state.articles = [
      {
        id: "a1",
        slug: "manajemen-hipertensi",
        title: "Manajemen Hipertensi Sehari-hari",
        excerpt: "Panduan praktis mengelola tekanan darah dengan pola hidup sehat.",
        content: "# Manajemen Hipertensi\n\n- Kurangi garam\n- Olahraga 150 menit/minggu\n\n> Konsultasikan dengan dokter jika ada gejala.",
        author: "Dr. Meida",
        authorRole: "Internist",
        category: "Kardiologi",
        tags: ["hipertensi", "diet"],
        status: "published",
        coverUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        readMinutes: 5,
        createdAt: now,
        publishedAt: now,
      },
      {
        id: "a2",
        slug: "asma-pada-dewasa",
        title: "Asma pada Dewasa: Tanda dan Penanganan",
        excerpt: "Kenali tanda eksaserbasi dan kapan perlu pertolongan.",
        content: "# Asma Dewasa\n\nGejala, pemicu, dan teknik inhaler.",
        author: "Dr. Rina",
        authorRole: "Pulmonolog",
        category: "Pulmonologi",
        tags: ["asma", "inhaler"],
        status: "scheduled",
        coverUrl: "https://images.unsplash.com/photo-1585436148261-8d9d0d9457c8?auto=format&fit=crop&w=1200&q=80",
        readMinutes: 4,
        createdAt: now,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: "a3",
        slug: "nutrisi-seimbang",
        title: "Nutrisi Seimbang untuk Imunitas",
        excerpt: "Makro dan mikro nutrien penting untuk daya tahan tubuh.",
        content: "# Nutrisi Seimbang\n\nSayur, buah, protein, lemak sehat.",
        author: "Dr. Andi",
        authorRole: "Klinis",
        category: "Gizi",
        tags: ["imunitas", "gizi"],
        status: "draft",
        coverUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
        readMinutes: 6,
        createdAt: now,
      },
    ];
    save();
  }
}

export function subscribeContent(cb: (s: ContentState) => void) {
  const h = (e: Event) => cb((e as CustomEvent<ContentState>).detail);
  window.addEventListener(EVENT_KEY, h);
  cb(state);
  return () => window.removeEventListener(EVENT_KEY, h);
}

export function listArticles(): Article[] { return state.articles.slice(); }

export function getArticleBySlug(slug: string): Article | null {
  return state.articles.find((a) => a.slug === slug) ?? null;
}

export function createArticle(input: Partial<Article>): string {
  const id = `art-${Date.now()}`;
  const slug = (input.slug || (input.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) + `-${Math.floor(Math.random()*1000)}`;
  const art: Article = {
    id,
    slug,
    title: input.title || "Untitled",
    excerpt: input.excerpt || "",
    content: input.content || "",
    author: input.author || "Admin",
    authorRole: input.authorRole || "",
    category: input.category || "Umum",
    tags: input.tags || [],
    status: input.status || "draft",
    coverUrl: input.coverUrl || "https://images.unsplash.com/photo-1580281657521-6f48c6f0d441?auto=format&fit=crop&w=1200&q=80",
    readMinutes: input.readMinutes || 4,
    createdAt: new Date().toISOString(),
    scheduledAt: input.scheduledAt,
    publishedAt: input.publishedAt,
  };
  state.articles.unshift(art);
  save();
  return id;
}

export function updateArticle(id: string, patch: Partial<Article>) {
  state.articles = state.articles.map((a) => (a.id === id ? { ...a, ...patch } : a));
  save();
}

