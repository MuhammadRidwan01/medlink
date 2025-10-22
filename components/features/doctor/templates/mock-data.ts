export type NoteTemplate = {
  id: string;
  title: string;
  specialty: string;
  tags: string[];
  content: {
    cc: string;
    hpi: string;
    ros: string;
    pe: string;
    plan: string;
  };
};

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "tpl-1",
    title: "Hipertensi Kontrol Rutin",
    specialty: "Penyakit Dalam",
    tags: ["Hipertensi", "Lifestyle", "Follow-up"],
    content: {
      cc: "Keluhan tekanan darah tinggi setelah menjalani pola makan tinggi garam.",
      hpi: "P pasien laki-laki 45 tahun dengan riwayat HTN 5 tahun, rutin konsumsi amlodipin 5 mg. TD terakhir 150/90 mmHg, tidak ada gejala pusing/nyeri dada.",
      ros: "Tidak ada sesak, palpitasi, atau edema. Pola tidur baik.",
      pe: "TD 148/92 mmHg, HR 78 bpm, RR 18, SpO2 98%. Tidak ada edema tungkai, JVP normal.",
      plan: "Tingkatkan evaluasi diet, tambah kombinasi ACE inhibitor jika TD > 140/90 pada kunjungan berikutnya, jadwalkan kontrol 2 minggu, edukasi aktivitas fisik.",
    },
  },
  {
    id: "tpl-2",
    title: "Prenatal Trimester 2",
    specialty: "Obgyn",
    tags: ["Kehamilan", "Prenatal"],
    content: {
      cc: "Kontrol rutin kehamilan usia 24 minggu.",
      hpi: "G1P0, usia kehamilan 24 minggu, gerak janin aktif, mual minimal. TD 120/80, BB naik 0.7 kg dalam 2 minggu.",
      ros: "Tidak ada perdarahan, tidak ada kontraksi, tidak ada ketuban pecah dini.",
      pe: "Fundus uteri sejajar pusat, DJJ 150 bpm. Tidak ada edema.",
      plan: "Lanjut vitamin prenatal, edukasi tanda bahaya, jadwalkan USG 4 minggu lagi, anjurkan senam hamil ringan.",
    },
  },
  {
    id: "tpl-3",
    title: "Asma Kontrol",
    specialty: "Pulmonologi",
    tags: ["Asma", "Kontrol"],
    content: {
      cc: "Sesak saat aktivitas lari ringan.",
      hpi: "Pasien 32 thn, asma persisten ringan, menggunakan inhaler salbutamol sesuai kebutuhan. Memiliki riwayat alergi debu.",
      ros: "Tidak ada demam, batuk berdahak minimal, tidak ada wheezing saat istirahat.",
      pe: "RR 20, SpO2 97% RA. Wheezing halus basal bilateral.",
      plan: "Tambahkan inhaler ICS dosis rendah, edukasi teknik inhaler, rencanakan evaluasi 1 bulan.",
    },
  },
  {
    id: "tpl-4",
    title: "Migraine Kronis",
    specialty: "Neurologi",
    tags: ["Migrain", "Nyeri Kepala"],
    content: {
      cc: "Sakit kepala berdenyut berulang 2-3x/minggu.",
      hpi: "Pasien 24 thn, migrain sejak remaja, dipicu stres. Nyeri unilateral disertai fotofobia.",
      ros: "Tidak ada kelemahan, tidak ada gangguan bicara.",
      pe: "Neurologis dalam batas normal.",
      plan: "Mulai profilaksis propranolol, edukasi sleep hygiene, catat diary migrain, follow-up 6 minggu.",
    },
  },
  {
    id: "tpl-5",
    title: "Diabetes Kontrol Triwulan",
    specialty: "Penyakit Dalam",
    tags: ["Diabetes", "Follow-up"],
    content: {
      cc: "Kontrol gula darah berkala.",
      hpi: "Pasien 50 thn, DM tipe 2, terapi metformin 850 mg bid. Gula darah puasa 140 mg/dL, HbA1c 7.2%.",
      ros: "Tidak ada neuropati, tidak ada nyeri dada.",
      pe: "BMI 27, TD 130/85 mmHg, pemeriksaan kaki normal.",
      plan: "Pertahankan metformin, evaluasi diet, tambahkan empagliflozin bila HbA1c >7% 3 bulan lagi.",
    },
  },
];
