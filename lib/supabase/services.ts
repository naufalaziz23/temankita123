import { createClient } from './client';

export interface PasienData {
  id: number;
  nama: string;
  usia: number;
  alamat: string;
  telepon: string;
  linkKitaBisa: string;
  tanggalInput: string;
}

export interface DataNonMedisItem {
  id: number;
  tanggal: string;
  kategori: string;
  keterangan: string;
  masuk: number | null;
  keluar: number | null;
  buktiType: 'image' | 'link' | null;
  buktiUrl: string;
  link?: string;
}

export interface TransaksiYayasanItem {
  id: number;
  tanggalPencairan: string;
  linkDonasi: string;
  jumlahDonasi: number;
  kategori: string;
  alokasi: number;
  sisaDonasi: number;
  statusImplementasi: 'Sudah Implementasi' | 'Belum Implementasi';
  linkImplementasi: string;
}

export interface DashboardStats {
  totalPasien: number;
  totalDataNonMedis: number;
  totalPerputaranUang: number;
  duitMasuk: number;
  duitKeluar: number;
  banyakPengeluaranKategori: string;
  chartData: { month: string; masuk: number; keluar: number }[];
  loading: boolean;
}

/* ── Fallback Cache Keys for Local Storage ── */
const STORAGE_KEYS = {
  PASIEN: 'ut_pasien_data',
  NON_MEDIS: 'ut_nonmedis_data',
  TRANSAKSI: 'ut_transaksi_data',
};

// ============================================================
// 1. DATA PASIEN SERVICE
// ============================================================
export async function getPasienList(): Promise<PasienData[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pasien')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      const formatted: PasienData[] = (data as Record<string, unknown>[]).map((row) => ({
        id: Number(row.id),
        nama: String(row.nama || ''),
        usia: Number(row.usia) || 0,
        alamat: String(row.alamat || ''),
        telepon: String(row.telepon || ''),
        linkKitaBisa: String(row.link_kitabisa || row.linkKitaBisa || ''),
        tanggalInput: String(row.tanggal_input || row.tanggalInput || ''),
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PASIEN, JSON.stringify(formatted));
      }
      return formatted;
    }
  } catch (err) {
    console.warn('Supabase getPasienList error:', err);
  }

  // Fallback to local storage if available
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEYS.PASIEN);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }
  return [];
}

export async function addPasien(item: Omit<PasienData, 'id'>): Promise<PasienData> {
  const supabase = createClient();
  const dbPayload = {
    nama: item.nama,
    usia: Number(item.usia) || 0,
    alamat: item.alamat || '',
    telepon: item.telepon || '',
    link_kitabisa: item.linkKitaBisa || '',
    tanggal_input: item.tanggalInput || '',
  };

  try {
    const { data, error } = await supabase
      .from('pasien')
      .insert([dbPayload])
      .select('*')
      .single();

    if (!error && data) {
      const created: PasienData = {
        id: Number(data.id),
        nama: data.nama,
        usia: Number(data.usia) || 0,
        alamat: data.alamat,
        telepon: data.telepon,
        linkKitaBisa: data.link_kitabisa || data.linkKitaBisa,
        tanggalInput: data.tanggal_input || data.tanggalInput,
      };
      return created;
    }
  } catch (err) {
    console.warn('Supabase addPasien error:', err);
  }

  // Local fallback
  const fallbackItem: PasienData = {
    ...item,
    id: Date.now(),
  };
  if (typeof window !== 'undefined') {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASIEN) || '[]');
    const updated = [fallbackItem, ...cached];
    localStorage.setItem(STORAGE_KEYS.PASIEN, JSON.stringify(updated));
  }
  return fallbackItem;
}

export async function updatePasien(item: PasienData): Promise<boolean> {
  const supabase = createClient();
  const dbPayload = {
    nama: item.nama,
    usia: Number(item.usia) || 0,
    alamat: item.alamat || '',
    telepon: item.telepon || '',
    link_kitabisa: item.linkKitaBisa || '',
    tanggal_input: item.tanggalInput || '',
  };

  try {
    const { error } = await supabase
      .from('pasien')
      .update(dbPayload)
      .eq('id', item.id);

    if (!error) return true;
  } catch (err) {
    console.warn('Supabase updatePasien error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached: PasienData[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASIEN) || '[]');
    const updated = cached.map((p) => (p.id === item.id ? item : p));
    localStorage.setItem(STORAGE_KEYS.PASIEN, JSON.stringify(updated));
  }
  return true;
}

export async function deletePasien(id: number): Promise<boolean> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('pasien').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('Supabase deletePasien error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached: PasienData[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASIEN) || '[]');
    const updated = cached.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PASIEN, JSON.stringify(updated));
  }
  return true;
}

// ============================================================
// 2. DATA NON MEDIS SERVICE
// ============================================================
export async function getDataNonMedisList(): Promise<DataNonMedisItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('data_nonmedis')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      const formatted: DataNonMedisItem[] = (data as Record<string, unknown>[]).map((row) => ({
        id: Number(row.id),
        tanggal: String(row.tanggal || ''),
        kategori: String(row.kategori || ''),
        keterangan: String(row.keterangan || ''),
        masuk: row.masuk !== null && row.masuk !== undefined ? Number(row.masuk) : null,
        keluar: row.keluar !== null && row.keluar !== undefined ? Number(row.keluar) : null,
        buktiType: (row.bukti_type || row.buktiType || null) as 'image' | 'link' | null,
        buktiUrl: String(row.bukti_url || row.buktiUrl || ''),
        link: String(row.link || row.link_kitabisa || row.linkKitaBisa || ''),
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.NON_MEDIS, JSON.stringify(formatted));
      }
      return formatted;
    }
  } catch (err) {
    console.warn('Supabase getDataNonMedisList error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEYS.NON_MEDIS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }
  return [];
}

export async function addDataNonMedis(item: Omit<DataNonMedisItem, 'id'>): Promise<DataNonMedisItem> {
  const supabase = createClient();
  const dbPayload = {
    tanggal: item.tanggal,
    kategori: item.kategori,
    keterangan: item.keterangan,
    masuk: item.masuk,
    keluar: item.keluar,
    bukti_type: item.buktiType,
    bukti_url: item.buktiUrl,
    link: item.link || '',
  };

  try {
    const { data, error } = await supabase
      .from('data_nonmedis')
      .insert([dbPayload])
      .select('*')
      .single();

    if (!error && data) {
      const row = data as Record<string, unknown>;
      return {
        id: Number(row.id),
        tanggal: String(row.tanggal || ''),
        kategori: String(row.kategori || ''),
        keterangan: String(row.keterangan || ''),
        masuk: row.masuk !== null && row.masuk !== undefined ? Number(row.masuk) : null,
        keluar: row.keluar !== null && row.keluar !== undefined ? Number(row.keluar) : null,
        buktiType: (row.bukti_type || row.buktiType || null) as 'image' | 'link' | null,
        buktiUrl: String(row.bukti_url || row.buktiUrl || ''),
        link: String(row.link || row.link_kitabisa || row.linkKitaBisa || ''),
      };
    }
  } catch (err) {
    console.warn('Supabase addDataNonMedis error:', err);
  }

  const fallbackItem: DataNonMedisItem = { ...item, id: Date.now() };
  if (typeof window !== 'undefined') {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.NON_MEDIS) || '[]');
    localStorage.setItem(STORAGE_KEYS.NON_MEDIS, JSON.stringify([fallbackItem, ...cached]));
  }
  return fallbackItem;
}

export async function updateDataNonMedis(item: DataNonMedisItem): Promise<boolean> {
  const supabase = createClient();
  const dbPayload = {
    tanggal: item.tanggal,
    kategori: item.kategori,
    keterangan: item.keterangan,
    masuk: item.masuk,
    keluar: item.keluar,
    bukti_type: item.buktiType,
    bukti_url: item.buktiUrl,
    link: item.link || '',
  };

  try {
    const { error } = await supabase
      .from('data_nonmedis')
      .update(dbPayload)
      .eq('id', item.id);

    if (!error) return true;
  } catch (err) {
    console.warn('Supabase updateDataNonMedis error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached: DataNonMedisItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NON_MEDIS) || '[]');
    const updated = cached.map((n) => (n.id === item.id ? item : n));
    localStorage.setItem(STORAGE_KEYS.NON_MEDIS, JSON.stringify(updated));
  }
  return true;
}

export async function deleteDataNonMedis(id: number): Promise<boolean> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('data_nonmedis').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('Supabase deleteDataNonMedis error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached: DataNonMedisItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NON_MEDIS) || '[]');
    const updated = cached.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NON_MEDIS, JSON.stringify(updated));
  }
  return true;
}

// ============================================================
// 3. TRANSAKSI YAYASAN SERVICE
// ============================================================
export async function getTransaksiYayasanList(): Promise<TransaksiYayasanItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transaksi_yayasan')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      const formatted: TransaksiYayasanItem[] = (data as Record<string, unknown>[]).map((row) => ({
        id: Number(row.id),
        tanggalPencairan: String(row.tanggal_pencairan || row.tanggalPencairan || ''),
        linkDonasi: String(row.link_donasi || row.linkDonasi || ''),
        jumlahDonasi: Number(row.jumlah_donasi || row.jumlahDonasi) || 0,
        kategori: String(row.kategori || ''),
        alokasi: Number(row.alokasi) || 0,
        sisaDonasi: Number(row.sisa_donasi || row.sisaDonasi) || 0,
        statusImplementasi: (row.status_implementasi || row.statusImplementasi || 'Belum Implementasi') as 'Sudah Implementasi' | 'Belum Implementasi',
        linkImplementasi: String(row.link_implementasi || row.linkImplementasi || ''),
      }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(formatted));
      }
      return formatted;
    }
  } catch (err) {
    console.warn('Supabase getTransaksiYayasanList error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEYS.TRANSAKSI);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }
  return [];
}

export async function addTransaksiYayasan(item: Omit<TransaksiYayasanItem, 'id'>): Promise<TransaksiYayasanItem> {
  const supabase = createClient();
  const dbPayload = {
    tanggal_pencairan: item.tanggalPencairan,
    link_donasi: item.linkDonasi,
    jumlah_donasi: item.jumlahDonasi,
    kategori: item.kategori,
    alokasi: item.alokasi,
    sisa_donasi: item.sisaDonasi,
    status_implementasi: item.statusImplementasi,
    link_implementasi: item.linkImplementasi,
  };

  try {
    const { data, error } = await supabase
      .from('transaksi_yayasan')
      .insert([dbPayload])
      .select('*')
      .single();

    if (!error && data) {
      return {
        id: Number(data.id),
        tanggalPencairan: data.tanggal_pencairan || data.tanggalPencairan,
        linkDonasi: data.link_donasi || data.linkDonasi,
        jumlahDonasi: Number(data.jumlah_donasi || data.jumlahDonasi) || 0,
        kategori: data.kategori,
        alokasi: Number(data.alokasi) || 0,
        sisaDonasi: Number(data.sisa_donasi || data.sisaDonasi) || 0,
        statusImplementasi: data.status_implementasi || data.statusImplementasi,
        linkImplementasi: data.link_implementasi || data.linkImplementasi,
      };
    }
  } catch (err) {
    console.warn('Supabase addTransaksiYayasan error:', err);
  }

  const fallbackItem: TransaksiYayasanItem = { ...item, id: Date.now() };
  if (typeof window !== 'undefined') {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSAKSI) || '[]');
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify([fallbackItem, ...cached]));
  }
  return fallbackItem;
}

export async function updateTransaksiYayasan(item: TransaksiYayasanItem): Promise<boolean> {
  const supabase = createClient();
  const dbPayload = {
    tanggal_pencairan: item.tanggalPencairan,
    link_donasi: item.linkDonasi,
    jumlah_donasi: item.jumlahDonasi,
    kategori: item.kategori,
    alokasi: item.alokasi,
    sisa_donasi: item.sisaDonasi,
    status_implementasi: item.statusImplementasi,
    link_implementasi: item.linkImplementasi,
  };

  try {
    const { error } = await supabase
      .from('transaksi_yayasan')
      .update(dbPayload)
      .eq('id', item.id);

    if (!error) return true;
  } catch (err) {
    console.warn('Supabase updateTransaksiYayasan error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached: TransaksiYayasanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSAKSI) || '[]');
    const updated = cached.map((t) => (t.id === item.id ? item : t));
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(updated));
  }
  return true;
}

export async function deleteTransaksiYayasan(id: number): Promise<boolean> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('transaksi_yayasan').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('Supabase deleteTransaksiYayasan error:', err);
  }

  if (typeof window !== 'undefined') {
    const cached: TransaksiYayasanItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSAKSI) || '[]');
    const updated = cached.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(updated));
  }
  return true;
}

// ============================================================
// 4. DASHBOARD STATS AGGREGATOR
// ============================================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const [pasienList, nonmedisList, transaksiList] = await Promise.all([
    getPasienList(),
    getDataNonMedisList(),
    getTransaksiYayasanList(),
  ]);

  const totalPasien = pasienList.length;
  const totalDataNonMedis = nonmedisList.length;

  // Total perputaran uang: sum of jumlahDonasi from transaksi_yayasan
  const totalPerputaranUang = transaksiList.reduce((acc, t) => acc + (t.jumlahDonasi || 0), 0);

  // Total pemasukan: sum of masuk from nonmedis or transaksi
  const totalMasukNonMedis = nonmedisList.reduce((acc, n) => acc + (n.masuk || 0), 0);
  const totalKeluarNonMedis = nonmedisList.reduce((acc, n) => acc + (n.keluar || 0), 0);

  const totalMasukTransaksi = transaksiList.reduce((acc, t) => acc + (t.jumlahDonasi || 0), 0);
  const totalKeluarTransaksi = transaksiList.reduce((acc, t) => acc + (t.alokasi || 0), 0);

  const duitMasuk = (totalMasukTransaksi || 0) + (totalMasukNonMedis || 0);
  const duitKeluar = totalKeluarNonMedis || totalKeluarTransaksi || 0;

  // Find category with highest expenditure
  const categoryExpenses: Record<string, number> = {};
  for (const t of transaksiList) {
    if (t.kategori) {
      categoryExpenses[t.kategori] = (categoryExpenses[t.kategori] || 0) + (t.alokasi || 0);
    }
  }
  for (const n of nonmedisList) {
    if (n.kategori && n.keluar) {
      categoryExpenses[n.kategori] = (categoryExpenses[n.kategori] || 0) + n.keluar;
    }
  }

  let highestCategory = 'Data Non Medis';
  let maxExpense = -1;
  for (const [cat, exp] of Object.entries(categoryExpenses)) {
    if (exp > maxExpense) {
      maxExpense = exp;
      highestCategory = cat;
    }
  }

  // Monthly grouping for chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMapIndex: Record<string, number> = {
    '01': 0, '02': 1, '03': 2, '04': 3, '05': 4, '06': 5,
    '07': 6, '08': 7, '09': 8, '10': 9, '11': 10, '12': 11,
    '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5,
    '7': 6, '8': 7, '9': 8
  };

  const chartData = months.map((m) => ({ month: m, masuk: 0, keluar: 0 }));

  // Aggregate transaksi yayasan into months
  for (const t of transaksiList) {
    if (t.tanggalPencairan) {
      const parts = t.tanggalPencairan.split(/[\/\-]/);
      if (parts.length >= 2) {
        const mIdx = monthMapIndex[parts[1]];
        if (mIdx !== undefined && chartData[mIdx]) {
          chartData[mIdx].masuk += (t.jumlahDonasi || 0) / 1000;
          chartData[mIdx].keluar += (t.alokasi || 0) / 1000;
        }
      }
    }
  }

  // Aggregate nonmedis into months if needed
  for (const n of nonmedisList) {
    if (n.tanggal) {
      const parts = n.tanggal.split(/[\/\-]/);
      if (parts.length >= 2) {
        const mIdx = monthMapIndex[parts[1]];
        if (mIdx !== undefined && chartData[mIdx]) {
          if (n.masuk) chartData[mIdx].masuk += n.masuk / 1000;
          if (n.keluar) chartData[mIdx].keluar += n.keluar / 1000;
        }
      }
    }
  }

  return {
    totalPasien,
    totalDataNonMedis,
    totalPerputaranUang,
    duitMasuk,
    duitKeluar,
    banyakPengeluaranKategori: highestCategory,
    chartData,
    loading: false,
  };
}

// ============================================================
// 5. SUPABASE REALTIME SUBSCRIPTION HELPER
// ============================================================
export function subscribeToDatabaseChanges(onDataChange: () => void) {
  try {
    const supabase = createClient();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pasien' }, () => {
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'data_nonmedis' }, () => {
        onDataChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi_yayasan' }, () => {
        onDataChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

// ============================================================
// 6. USER PROFILE & AUTHENTICATION SERVICES
// ============================================================
export interface UserProfileData {
  id: string;
  email: string;
  nama: string;
  role: string;
  avatarUrl: string;
}

export async function getUserProfile(): Promise<UserProfileData> {
  const defaultProfile: UserProfileData = {
    id: '',
    email: '',
    nama: '',
    role: '',
    avatarUrl: '',
  };

  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      const meta = user.user_metadata || {};
      const avatar = meta.avatar_url || (typeof window !== 'undefined' ? localStorage.getItem('ut_user_avatar') || '' : '');
      let rawName = meta.full_name || meta.name || '';
      if (!rawName && user.email) {
        const prefix = user.email.split('@')[0];
        rawName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
      const nama = rawName || user.email || 'User';
      return {
        id: user.id,
        email: user.email || '',
        nama,
        role: '',
        avatarUrl: avatar,
      };
    }
  } catch (err) {
    console.warn('Error fetching user profile:', err);
  }

  if (typeof window !== 'undefined') {
    const cachedAvatar = localStorage.getItem('ut_user_avatar') || '';
    if (cachedAvatar) {
      return { ...defaultProfile, avatarUrl: cachedAvatar };
    }
  }

  return defaultProfile;
}

export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '#';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function uploadProfileAvatar(file: File): Promise<string> {
  // Security check: File type and size validation
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar (JPG, PNG, WEBP, GIF).');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ukuran file tidak boleh melebihi 5 MB.');
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const fileName = `${user?.id || 'admin'}-${Date.now()}.${fileExt || 'jpg'}`;
  const filePath = `avatars/${fileName}`;

  let avatarUrl = '';

  // Try uploading to Supabase Storage bucket
  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      avatarUrl = publicUrl;
    }
  } catch (err) {
    console.warn('Supabase storage upload failed, using fallback:', err);
  }

  // Fallback to base64 data URL if bucket is not created or accessible
  if (!avatarUrl) {
    avatarUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Update Supabase Auth user_metadata
  if (user) {
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
    } catch (err) {
      console.warn('Supabase auth updateUser metadata error:', err);
    }
  }

  // Cache and broadcast
  if (typeof window !== 'undefined') {
    localStorage.setItem('ut_user_avatar', avatarUrl);
    window.dispatchEvent(new Event('user-profile-updated'));
  }

  return avatarUrl;
}

export async function removeProfileAvatar(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: '' },
      });
    } catch (err) {
      console.warn('Supabase auth remove avatar error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('ut_user_avatar');
    window.dispatchEvent(new Event('user-profile-updated'));
  }
}

export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    throw new Error('Sesi akun tidak ditemukan. Silakan login kembali.');
  }

  // Verify current password by signing in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Kata sandi saat ini tidak sesuai. Silakan periksa kembali.');
  }

  // Update password via Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message || 'Gagal memperbarui kata sandi di Supabase Auth.');
  }
}
