-- ============================================================
-- SUPABASE DATABASE SCHEMA UNTUK YAYASAN "UNTUK TEMAN"
-- Jalankan script SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/epyfhgqavfrkbrycofay/sql
-- ============================================================

-- 1. TABEL PASIEN (DATA PASIEN)
CREATE TABLE IF NOT EXISTS public.pasien (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  usia INTEGER DEFAULT 0,
  alamat TEXT DEFAULT '',
  telepon TEXT DEFAULT '',
  link_kitabisa TEXT DEFAULT '',
  tanggal_input TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL DATA NON MEDIS (KATEGORI TRANSAKSI NON-MEDIS)
CREATE TABLE IF NOT EXISTS public.data_nonmedis (
  id BIGSERIAL PRIMARY KEY,
  tanggal TEXT DEFAULT '',
  kategori TEXT NOT NULL,
  keterangan TEXT DEFAULT '',
  masuk NUMERIC DEFAULT 0,
  keluar NUMERIC DEFAULT 0,
  bukti_type TEXT DEFAULT NULL,
  bukti_url TEXT DEFAULT '',
  link_kitabisa TEXT DEFAULT '',
  nama_pasien TEXT DEFAULT '',
  no_group BIGINT DEFAULT NULL,
  status_implementasi TEXT DEFAULT 'Belum Implementasi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. TABEL TRANSAKSI YAYASAN
CREATE TABLE IF NOT EXISTS public.transaksi_yayasan (
  id BIGSERIAL PRIMARY KEY,
  tanggal_pencairan TEXT DEFAULT '',
  link_donasi TEXT DEFAULT '',
  jumlah_donasi NUMERIC DEFAULT 0,
  kategori TEXT NOT NULL,
  alokasi NUMERIC DEFAULT 0,
  sisa_donasi NUMERIC DEFAULT 0,
  status_implementasi TEXT DEFAULT 'Belum Implementasi',
  link_implementasi TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & IZINKAN AKSES ANON / AUTH
-- ============================================================

ALTER TABLE public.pasien ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_nonmedis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_yayasan ENABLE ROW LEVEL SECURITY;

-- Policy untuk Pasien
DROP POLICY IF EXISTS "Allow all access to pasien" ON public.pasien;
CREATE POLICY "Allow all access to pasien" ON public.pasien
  FOR ALL USING (true) WITH CHECK (true);

-- Policy untuk Data Non Medis
DROP POLICY IF EXISTS "Allow all access to data_nonmedis" ON public.data_nonmedis;
CREATE POLICY "Allow all access to data_nonmedis" ON public.data_nonmedis
  FOR ALL USING (true) WITH CHECK (true);

-- Policy untuk Transaksi Yayasan
DROP POLICY IF EXISTS "Allow all access to transaksi_yayasan" ON public.transaksi_yayasan;
CREATE POLICY "Allow all access to transaksi_yayasan" ON public.transaksi_yayasan
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- AKTIFKAN REALTIME UNTUK KETIGA TABEL
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.pasien;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_nonmedis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaksi_yayasan;
