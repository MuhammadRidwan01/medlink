export type MarketplaceCategory = "Obat" | "Vitamin" | "Perangkat" | "Layanan" | "Herbal";

export type ContraindicationType = "allergy" | "medication";
export type ContraindicationSeverity = "caution" | "warning" | "danger";

export type ProductContraindication = {
  id: string;
  type: ContraindicationType;
  value: string;
  severity: ContraindicationSeverity;
  note?: string;
};

export type MarketplaceProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  categories: MarketplaceCategory[];
  tags: string[];
  rating: number;
  ratingCount: number;
  inventoryStatus: "in-stock" | "low-stock" | "out-of-stock";
  badges?: string[];
  contraindications?: ProductContraindication[];
};

export const PATIENT_CONTEXT = {
  allergies: ["penisilin", "sulfa"],
  medications: ["metformin", "atorvastatin"],
};

export const MOCK_PRODUCTS: MarketplaceProduct[] = [
  {
    id: "prod-1",
    slug: "paracetamol-500mg-strip",
    name: "Paracetamol 500mg Strip",
    shortDescription: "Pereda demam dan nyeri dengan dosis efektif.",
    longDescription:
      "Paracetamol 500mg membantu meredakan demam serta nyeri ringan hingga sedang. Cocok dikonsumsi setelah makan dan dapat dikombinasikan dengan terapi lain sesuai arahan dokter.",
    price: 18000,
    imageUrl: "https://images.unsplash.com/photo-1580281658629-1796132cc0c3?auto=format&fit=crop&w=600&q=80",
    categories: ["Obat"],
    tags: ["analgesik", "demam", "OTC"],
    rating: 4.6,
    ratingCount: 182,
    inventoryStatus: "in-stock",
    badges: ["Best Seller"],
  },
  {
    id: "prod-2",
    slug: "ibuprofen-400mg-bottle",
    name: "Ibuprofen 400mg Botol",
    shortDescription: "Anti-inflamasi untuk nyeri sendi dan otot.",
    longDescription:
      "Ibuprofen 400mg memberikan efek anti-inflamasi dan analgesik. Gunakan sesuai dosis yang dianjurkan dan hindari jika memiliki riwayat maag berat.",
    price: 32000,
    imageUrl: "https://images.unsplash.com/photo-1580281658629-1796132cc0c3?auto=format&fit=crop&w=600&q=80",
    categories: ["Obat"],
    tags: ["NSAID", "nyeri", "inflamasi"],
    rating: 4.4,
    ratingCount: 96,
    inventoryStatus: "low-stock",
    contraindications: [
      {
        id: "allergy-sulfa",
        type: "allergy",
        value: "sulfa",
        severity: "danger",
        note: "Riwayat alergi sulfa dapat meningkatkan risiko reaksi dengan NSAID tertentu.",
      },
    ],
  },
  {
    id: "prod-3",
    slug: "vitamin-c-1000mg",
    name: "Vitamin C 1000mg Effervescent",
    shortDescription: "Menjaga daya tahan tubuh harian.",
    longDescription:
      "Suplemen Vitamin C 1000mg dengan format effervescent untuk penyerapan optimal. Membantu menjaga imunitas tubuh terutama saat aktivitas padat.",
    price: 45000,
    imageUrl: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=600&q=80",
    categories: ["Vitamin"],
    tags: ["imunitas", "suplementasi"],
    rating: 4.8,
    ratingCount: 245,
    inventoryStatus: "in-stock",
    badges: ["Diskon 10%"],
  },
  {
    id: "prod-4",
    slug: "glucometer-kit-smart",
    name: "Glucometer Kit Smart",
    shortDescription: "Monitor gula darah dengan koneksi aplikasi.",
    longDescription:
      "Glucometer kit dengan konektivitas Bluetooth yang menampilkan riwayat gula darah pada aplikasi smartphone. Termasuk 25 strip uji dan jarum lancet.",
    price: 285000,
    imageUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["diabetes", "monitoring", "digital"],
    rating: 4.7,
    ratingCount: 73,
    inventoryStatus: "in-stock",
    badges: ["Direkomendasikan"],
    contraindications: [
      {
        id: "med-metformin",
        type: "medication",
        value: "metformin",
        severity: "warning",
        note: "Periksa sinkronisasi data gula darah dengan terapi metformin aktif Anda.",
      },
    ],
  },
  {
    id: "prod-5",
    slug: "inhaler-asthma-smart",
    name: "Inhaler Asma Smart Dose",
    shortDescription: "Inhaler dengan pengukur dosis otomatis.",
    longDescription:
      "Inhaler asma dengan sensor dosis sehingga memudahkan pemantauan penggunaan harian. Nyaman dibawa dan dilengkapi penutup higienis.",
    price: 195000,
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["asma", "smart-device"],
    rating: 4.5,
    ratingCount: 65,
    inventoryStatus: "low-stock",
  },
  {
    id: "prod-6",
    slug: "masker-bedah-hypoallergenic",
    name: "Masker Bedah Hypoallergenic",
    shortDescription: "Masker tiga lapis dengan filter efektif.",
    longDescription:
      "Masker bedah hypoallergenic dengan desain nyaman, cocok untuk pemakaian sepanjang hari. Tersedia dalam kemasan 50 pcs.",
    price: 38000,
    imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["masker", "proteksi"],
    rating: 4.3,
    ratingCount: 58,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-7",
    slug: "salep-antiseptik-herbal",
    name: "Salep Antiseptik Herbal",
    shortDescription: "Mengandung tea tree untuk luka ringan.",
    longDescription:
      "Salep herbal antiseptik dengan kombinasi tea tree dan lavender yang membantu proses penyembuhan luka ringan dan gigitan serangga.",
    price: 28000,
    imageUrl: "https://images.unsplash.com/photo-1612810806695-30ba0fda035d?auto=format&fit=crop&w=600&q=80",
    categories: ["Herbal", "Obat"],
    tags: ["topikal", "alami"],
    rating: 4.2,
    ratingCount: 34,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-8",
    slug: "minyak-telom-wellness",
    name: "Minyak Telon Wellness",
    shortDescription: "Menjaga kehangatan bayi dan balita.",
    longDescription:
      "Minyak telon dengan aroma lembut yang menenangkan. Mengandung minyak adas, kayu putih, dan kelapa murni.",
    price: 27000,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    categories: ["Herbal"],
    tags: ["bayi", "aromaterapi"],
    rating: 4.9,
    ratingCount: 180,
    inventoryStatus: "in-stock",
    badges: ["Pilihan Ibu"],
  },
  {
    id: "prod-9",
    slug: "konsultasi-gizi-online",
    name: "Konsultasi Gizi Online",
    shortDescription: "Sesi 30 menit bersama ahli gizi tersertifikasi.",
    longDescription:
      "Layanan konsultasi gizi daring dengan ahli tersertifikasi. Bantu susun menu harian sesuai kondisi kesehatan dan tujuan pribadi.",
    price: 99000,
    imageUrl: "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=600&q=80",
    categories: ["Layanan"],
    tags: ["gizi", "telehealth"],
    rating: 4.9,
    ratingCount: 54,
    inventoryStatus: "in-stock",
    badges: ["Paling diminati"],
  },
  {
    id: "prod-10",
    slug: "pijat-terapi-home-visit",
    name: "Pijat Terapi Home Visit",
    shortDescription: "Terapi pijat profesional di rumah Anda.",
    longDescription:
      "Nikmati layanan pijat terapi dari fisioterapis profesional langsung di rumah. Menyasar nyeri punggung, leher, dan stres.",
    price: 175000,
    imageUrl: "https://images.unsplash.com/photo-1556228724-4a7ab4b6b2c8?auto=format&fit=crop&w=600&q=80",
    categories: ["Layanan"],
    tags: ["relaksasi", "fisioterapi"],
    rating: 4.6,
    ratingCount: 29,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-11",
    slug: "metformin-500mg-tablet",
    name: "Metformin 500mg Tablet",
    shortDescription: "Terapi standar untuk diabetes tipe 2.",
    longDescription:
      "Metformin 500mg membantu meningkatkan sensitivitas insulin dan mengontrol kadar gula darah. Konsumsi sesuai resep dokter.",
    price: 23000,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    categories: ["Obat"],
    tags: ["diabetes", "resep"],
    rating: 4.5,
    ratingCount: 88,
    inventoryStatus: "out-of-stock",
    contraindications: [
      {
        id: "med-metformin",
        type: "medication",
        value: "metformin",
        severity: "danger",
        note: "Anda telah memiliki metformin aktif di profil. Konsultasikan sebelum menambah stok.",
      },
    ],
  },
  {
    id: "prod-12",
    slug: "probio-digest-sachet",
    name: "ProBio Digest Sachet",
    shortDescription: "Probiotik untuk kesehatan pencernaan.",
    longDescription:
      "Probiotik dengan kombinasi lactobacillus dan bifidobacterium yang membantu menjaga flora usus seimbang.",
    price: 52000,
    imageUrl: "https://images.unsplash.com/photo-1610395219790-54aa72d4f89f?auto=format&fit=crop&w=600&q=80",
    categories: ["Vitamin"],
    tags: ["pencernaan", "probiotik"],
    rating: 4.4,
    ratingCount: 47,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-13",
    slug: "omega-3-fish-oil",
    name: "Omega-3 Fish Oil",
    shortDescription: "EPA DHA untuk kesehatan jantung dan otak.",
    longDescription:
      "Minyak ikan berkualitas tinggi yang mendukung kesehatan jantung, otak, dan sendi. Dilengkapi vitamin E sebagai antioksidan.",
    price: 79000,
    imageUrl: "https://images.unsplash.com/photo-1580281658629-1796132cc0c3?auto=format&fit=crop&w=600&q=80",
    categories: ["Vitamin"],
    tags: ["omega", "jantung"],
    rating: 4.7,
    ratingCount: 122,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-14",
    slug: "tensi-meter-digital-wrist",
    name: "Tensimeter Digital Wrist",
    shortDescription: "Pemantauan tekanan darah otomatis.",
    longDescription:
      "Perangkat tensimeter digital pergelangan tangan dengan memori 90 data dan indikator detak jantung tidak teratur.",
    price: 310000,
    imageUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["hipertensi", "monitoring"],
    rating: 4.3,
    ratingCount: 40,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-15",
    slug: "alat-uap-nebulizer-mini",
    name: "Alat Uap Nebulizer Mini",
    shortDescription: "Portable untuk terapi pernapasan anak.",
    longDescription:
      "Nebulizer mini dengan suara senyap, dilengkapi mode anak dan dewasa. Mudah dibersihkan dan dibawa.",
    price: 425000,
    imageUrl: "https://images.unsplash.com/photo-1550572017-edd951c38c95?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["pernapasan", "portable"],
    rating: 4.6,
    ratingCount: 51,
    inventoryStatus: "low-stock",
  },
  {
    id: "prod-16",
    slug: "teh-herbal-detox",
    name: "Teh Herbal Detox",
    shortDescription: "Campuran herbal untuk metabolisme.",
    longDescription:
      "Teh herbal dengan campuran daun sirsak, jahe, dan serai yang membantu metabolisme tubuh serta relaksasi.",
    price: 39000,
    imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80",
    categories: ["Herbal"],
    tags: ["detox", "relaksasi"],
    rating: 4.1,
    ratingCount: 24,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-17",
    slug: "vitamin-d3-2000iu",
    name: "Vitamin D3 2000 IU",
    shortDescription: "Mendukung kesehatan tulang dan imun.",
    longDescription:
      "Vitamin D3 dosis 2000 IU membantu penyerapan kalsium dan mendukung sistem kekebalan.",
    price: 67000,
    imageUrl: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=600&q=80",
    categories: ["Vitamin"],
    tags: ["tulang", "imun"],
    rating: 4.7,
    ratingCount: 90,
    inventoryStatus: "in-stock",
    badges: ["Promo bundling"],
  },
  {
    id: "prod-18",
    slug: "alat-cek-kolesterol",
    name: "Alat Cek Kolesterol",
    shortDescription: "Cek kolesterol total di rumah.",
    longDescription:
      "Perangkat praktis untuk memeriksa kadar kolesterol total di rumah. Hasil dalam 3 menit.",
    price: 530000,
    imageUrl: "https://images.unsplash.com/photo-1505575967455-40b1c00c0721?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["kolesterol", "monitoring"],
    rating: 4.2,
    ratingCount: 33,
    inventoryStatus: "in-stock",
    contraindications: [
      {
        id: "med-atorvastatin",
        type: "medication",
        value: "atorvastatin",
        severity: "warning",
        note: "Pantau kadar kolesterol dan konsultasikan penyesuaian terapi statin Anda.",
      },
    ],
  },
  {
    id: "prod-19",
    slug: "paket-konsultasi-psikologi",
    name: "Paket Konsultasi Psikologi",
    shortDescription: "3 sesi konseling online dengan psikolog.",
    longDescription:
      "Paket 3 sesi konsultasi psikologi daring untuk membantu manajemen stres dan kecemasan.",
    price: 350000,
    imageUrl: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=80",
    categories: ["Layanan"],
    tags: ["mental", "konseling"],
    rating: 4.9,
    ratingCount: 41,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-20",
    slug: "aplikator-insulin-smart",
    name: "Aplikator Insulin Smart",
    shortDescription: "Membantu penyuntikan insulin dengan nyaman.",
    longDescription:
      "Aplikator insulin dengan sensor tekanan untuk memastikan penyuntikan aman dan nyaman.",
    price: 210000,
    imageUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["diabetes", "smart-device"],
    rating: 4.4,
    ratingCount: 27,
    inventoryStatus: "low-stock",
    contraindications: [
      {
        id: "med-metformin",
        type: "medication",
        value: "metformin",
        severity: "warning",
        note: "Pastikan dosis insulin disesuaikan dengan terapi metformin saat ini.",
      },
    ],
  },
  {
    id: "prod-21",
    slug: "suplemen-kalsium-magnesium",
    name: "Suplemen Kalsium Magnesium",
    shortDescription: "Mineral penting untuk tulang.",
    longDescription:
      "Suplemen kombinasi kalsium, magnesium, dan vitamin D untuk kesehatan tulang dan saraf.",
    price: 64000,
    imageUrl: "https://images.unsplash.com/photo-1610395219790-54aa72d4f89f?auto=format&fit=crop&w=600&q=80",
    categories: ["Vitamin"],
    tags: ["tulang", "mineral"],
    rating: 4.5,
    ratingCount: 58,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-22",
    slug: "lansia-multivitamin-pro",
    name: "Lansia Multivitamin Pro",
    shortDescription: "Formulasi khusus lansia aktif.",
    longDescription:
      "Multivitamin dengan kandungan lutein, ginkgo biloba, dan vitamin B kompleks untuk mendukung lansia aktif.",
    price: 99000,
    imageUrl: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=600&q=80",
    categories: ["Vitamin"],
    tags: ["lansia", "multi"],
    rating: 4.6,
    ratingCount: 76,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-23",
    slug: "smart-water-bottle",
    name: "Smart Water Bottle",
    shortDescription: "Pengingat minum air terhubung aplikasi.",
    longDescription:
      "Botol minum pintar yang terhubung ke aplikasi untuk mengingatkan konsumsi air harian.",
    price: 220000,
    imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80",
    categories: ["Perangkat"],
    tags: ["hidrasi", "smart-device"],
    rating: 4.0,
    ratingCount: 21,
    inventoryStatus: "in-stock",
  },
  {
    id: "prod-24",
    slug: "minyak-angin-roll-on",
    name: "Minyak Angin Roll On",
    shortDescription: "Legakan pusing dan mual kapan saja.",
    longDescription:
      "Minyak angin roll on dengan aroma peppermint segar, praktis digunakan dan tidak lengket di kulit.",
    price: 18000,
    imageUrl: "https://images.unsplash.com/photo-1580566053300-1c1c8689c78b?auto=format&fit=crop&w=600&q=80",
    categories: ["Herbal"],
    tags: ["aromaterapi", "mobilitas"],
    rating: 4.3,
    ratingCount: 48,
    inventoryStatus: "in-stock",
  },
];
