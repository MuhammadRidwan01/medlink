# 🚀 Quick Test Guide - MedLink AI

## ⚡ Langkah Cepat untuk Testing

### 1. Setup Environment (WAJIB)

```bash
# File: .env.local
GROQ_API_KEY=your_actual_groq_api_key_here
```

**PENTING**: Tanpa `GROQ_API_KEY`, semua fitur AI tidak akan berfungsi!

### 2. Restart Dev Server

```bash
# Matikan server yang sedang running (Ctrl+C)
# Lalu jalankan ulang:
npm run dev
```

Server akan running di `http://localhost:3001` (atau port lain jika 3000 sudah terpakai)

---

## 🧪 Test 1: AI Triage + OTC Auto-Draft

### URL
```
http://localhost:3001/patient/triage
```

### Langkah
1. **Buka halaman triage**
2. **Chat dengan AI** (copy-paste ini):
   ```
   Saya demam 37.8 dari kemarin
   ```
3. **Tunggu AI response**, lalu kirim:
   ```
   pilek kuning
   ```
4. **Tunggu AI response**, lalu kirim:
   ```
   tidak ada alergi
   ```
5. **Tunggu AI response**, lalu kirim:
   ```
   tidak ada sakit wajah
   ```

### Expected Result ✅
- AI akan mendeteksi: `riskLevel: "low"`, `recommendation.type: "otc"`
- **OTOMATIS** muncul loading: "AI sedang membuat draf resep OTC…"
- **OTOMATIS** muncul draf obat (tanpa klik tombol):
  - Paracetamol 500mg
  - Dekongestan
  - Dengan dosis, frekuensi, durasi
- Tombol **"Tambah ke Keranjang"** dan **"Ajukan ke Dokter"** muncul

### Troubleshooting ❌
**Jika muncul error "Gagal membuat draf OTC AI":**

1. **Cek console browser** (F12 → Console tab)
2. **Cek terminal server** untuk error detail
3. **Kemungkinan penyebab**:
   - `GROQ_API_KEY` tidak di-set atau salah
   - Groq API quota habis
   - Validation error (lihat server logs)

**Jika loading terus tanpa hasil:**
- Cek Network tab (F12 → Network)
- Lihat request `POST /api/ai/prescription`
- Klik request → Preview/Response untuk lihat error

---

## 🧪 Test 2: Marketplace Integration

### Lanjutan dari Test 1

1. **Setelah draf OTC muncul**, klik **"Tambah ke Keranjang"**
2. **Expected**: Redirect ke `/marketplace/cart`
3. **Verifikasi**: Obat-obatan masuk cart

### Troubleshooting ❌
**Jika redirect gagal:**
- Cek apakah endpoint `/api/marketplace/cart` ada
- Cek console untuk error

---

## 🧪 Test 3: Doctor Activation

### URL
```
http://localhost:3001/admin/doctors
```

### Langkah
1. **Buka halaman admin**
2. **Isi form**:
   - Spesialisasi: `Dokter Umum`
   - No. Lisensi: `12345678`
3. **Klik "Aktifkan"**

### Expected Result ✅
- Toast notification: "Berhasil diaktifkan sebagai dokter"
- Nama Anda muncul di list dokter
- Cookie `role=doctor` di-set

### Troubleshooting ❌
**Jika error 500:**
- Cek apakah migrasi Supabase sudah diterapkan
- Cek RPC function `upsert_doctor` ada di Supabase

---

## 🧪 Test 4: Doctor Prescription Draft

### URL
```
http://localhost:3001/doctor/consultation
```

### Langkah
1. **Buka workspace konsultasi**
2. **Klik "Draf Resep"** (di sidebar atau floating button)
3. **Pilih pasien** via Patient Picker (search by name/email)
4. **Klik "Gunakan Saran AI"**
5. **Tunggu** → obat muncul otomatis
6. **Lihat warnings** (jika ada interaksi obat)
7. **Klik "Kirim untuk Persetujuan"**

### Expected Result ✅
- Patient Picker menampilkan list pasien
- AI suggestions muncul (nama obat, dosis, dll)
- Auto-check interaksi (loading "Mengecek interaksi dengan AI…")
- Warnings muncul jika ada
- Toast: "Resep berhasil dikirim"
- Data tersimpan di Supabase `clinical.prescriptions`

### Troubleshooting ❌
**Jika Patient Picker kosong:**
- Pastikan ada user di tabel `profiles` (buat via signup)

**Jika AI suggestions tidak muncul:**
- Cek `GROQ_API_KEY`
- Cek console/server logs

**Jika error 403 saat simpan:**
- Pastikan sudah aktivasi dokter di `/admin/doctors`

---

## 🧪 Test 5: Patient Prescription View

### URL
```
http://localhost:3001/patient/prescriptions
```

### Langkah
1. **Buka halaman prescriptions**
2. **Verifikasi** list resep muncul

### Expected Result ✅
- List resep dengan status badge (draft/awaiting_approval/approved/rejected)
- Tanggal pembuatan
- List obat per resep
- Tombol "Lihat Detail"

### Troubleshooting ❌
**Jika error 500:**
- Cek apakah tabel `clinical.prescriptions` ada
- Cek RLS policies

**Jika kosong:**
- Normal jika belum ada resep yang dibuat

---

## 🧪 Test 6: Appointment Scheduling

### URL
```
http://localhost:3001/doctor/consultation
```

### Langkah
1. **Buka workspace konsultasi**
2. **Trigger mini-scheduler** (via event bus atau button)
3. **Pilih pasien** via Patient Picker
4. **Pilih tanggal & waktu**
5. **Klik "Konfirmasi"**

### Expected Result ✅
- Patient Picker berfungsi
- Date/time picker berfungsi
- Toast: "Follow-up dijadwalkan"
- Data tersimpan di `clinical.appointments`

---

## 📊 Verifikasi Database (Supabase)

### Via SQL Editor

```sql
-- Cek doctors
SELECT * FROM clinical.doctors;

-- Cek prescriptions
SELECT * FROM clinical.prescriptions;

-- Cek prescription items
SELECT * FROM clinical.prescription_items;

-- Cek appointments
SELECT * FROM clinical.appointments;

-- Cek triage sessions
SELECT * FROM public.triage_sessions;
```

---

## 🔍 Debug Checklist

### Jika Ada Error

1. **Cek Environment Variables**
   ```bash
   # Di terminal server, pastikan ada output:
   # GROQ_API_KEY: gsk_...
   ```

2. **Cek Server Logs**
   - Lihat terminal tempat `npm run dev` running
   - Cari error merah atau warning kuning

3. **Cek Browser Console**
   - F12 → Console tab
   - Lihat error JavaScript

4. **Cek Network Tab**
   - F12 → Network tab
   - Filter: XHR/Fetch
   - Klik request yang error → Preview/Response

5. **Cek Supabase**
   - Dashboard → Table Editor
   - Verifikasi tabel ada
   - Verifikasi RLS policies aktif

---

## ✅ Success Indicators

### Semua Berfungsi Jika:
- ✅ Triage chat streaming lancar (no SSE errors)
- ✅ OTC draft muncul otomatis (tanpa klik)
- ✅ "Tambah ke Keranjang" redirect ke cart
- ✅ Doctor activation berhasil
- ✅ AI prescription suggestions muncul
- ✅ Drug interaction warnings muncul (jika ada)
- ✅ Prescription tersimpan di Supabase
- ✅ Patient prescription list tampil
- ✅ Appointment tersimpan

---

## 🆘 Common Errors & Solutions

### Error: "GROQ_API_KEY is not configured"
**Solution**: Set `GROQ_API_KEY` di `.env.local` dan restart server

### Error: "permission denied for view triage_sessions"
**Solution**: Apply migration `fix_triage_view_permissions`

### Error: "Only active doctors can create prescriptions"
**Solution**: Aktivasi dokter di `/admin/doctors`

### Error: "Invalid payload" (400)
**Solution**: 
- Cek server logs untuk detail validation error
- Pastikan `zod` terinstall: `npm install zod`

### Error: "Failed to parse Groq SSE chunk"
**Solution**: Sudah diperbaiki dengan buffer parsing (restart server)

---

## 📞 Quick Support

Jika masih ada masalah:
1. Screenshot error (browser console + server logs)
2. Copy request payload dari Network tab
3. Cek `IMPLEMENTATION_SUMMARY.md` untuk detail lengkap
