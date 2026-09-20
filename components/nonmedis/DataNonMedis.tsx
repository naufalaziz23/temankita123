'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  getDataNonMedisList,
  getTransaksiYayasanList,
  addDataNonMedis,
  updateDataNonMedis,
  deleteDataNonMedis,
  subscribeToDatabaseChanges,
  getUserProfile,
  sanitizeUrl,
  DataNonMedisItem,
  TransaksiYayasanItem,
  UserProfileData,
} from '@/lib/supabase/services';
import AdminProfileDropdown from '@/components/common/AdminProfileDropdown';
import styles from './DataNonMedis.module.css';

/* ── Interfaces ── */
export type TransaksiKategori = DataNonMedisItem;

/* ── Category badge color mapping ── */
function getBadgeClass(kategori: string): string {
  const lower = (kategori || '').toLowerCase();
  if (lower.includes('mobil siaga')) return styles.badgeMobil;
  if (lower.includes('rumah singgah')) return styles.badgeRumah;
  if (lower.includes('cek kesehatan')) return styles.badgeCek;
  if (lower.includes('sembako')) return styles.badgeMobilisasi;
  if (lower.includes('tanam') || lower.includes('bersih alam')) return styles.badgeTanam;
  if (lower.includes('santunan') || lower.includes('anak yatim')) return styles.badgeRumah;
  if (lower.includes('panti') || lower.includes('pondok')) return styles.badgeCek;
  if (lower.includes('modal usaha') || lower.includes('foodbox')) return styles.badgeMobil;
  if (lower.includes('perlengkapan') || lower.includes('pendidikan')) return styles.badgeMobilisasi;
  return styles.badgeDefault;
}

/* ── SVG Icons ── */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
      <polyline points="6 15 12 9 18 15" />
    </svg>
  );
}

function UpArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function DownArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ── Helpers ── */
function formatRp(val: number): string {
  return 'Rp ' + (val || 0).toLocaleString('id-ID');
}

const DEFAULT_CATEGORIES = [
  'Mobil Siaga',
  'Pendidikan',
  'Rumah Singgah',
  'Cek Kesehatan Lansia',
  'Sembako Lansia/Dhuafa/Disabilitas',
  'Tanam Pohon',
  'Santunan Sosok',
  'Panti/Pondok Pesantren',
  'Bersih Alam',
  'Modal Usaha',
  'Anak Yatim',
  'Foodbox',
  'Perlengkapan Sholat',
];

/* Kategori lama yang sudah dihapus — disembunyikan dari dropdown */
const EXCLUDED_CATEGORIES = new Set([
  'Mbah Sumilah',
  'Mbah sumilah',
  'mbah sumilah',
  'Mobilisasi Lansia',
  'Cek Kesehatan Gratis',
]);

/* ── Compute running saldo chronologically ── */
function withSaldo(data: TransaksiKategori[], initialSaldo: number = 0): (TransaksiKategori & { saldo: number })[] {
  const sortedAsc = [...data].sort((a, b) => {
    if (a.id && b.id) return a.id - b.id;
    return 0;
  });

  let running = initialSaldo;
  const saldoMap = new Map<number, number>();

  sortedAsc.forEach((t) => {
    running += (t.masuk ?? 0) - (t.keluar ?? 0);
    // Jika sudah implementasi, saldo baris ini = 0 (saldo habis diimplementasi)
    saldoMap.set(t.id, t.statusImplementasi === 'Sudah Implementasi' ? 0 : running);
  });

  return data.map((t) => ({
    ...t,
    saldo: saldoMap.get(t.id) ?? (t.statusImplementasi === 'Sudah Implementasi' ? 0 : running),
  }));
}

/* ── Main Component ── */
export default function DataNonMedis() {
  const [dataList, setDataList] = useState<TransaksiKategori[]>([]);
  const [transaksiYayasanList, setTransaksiYayasanList] = useState<TransaksiYayasanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /* Filters */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua Kategori');
  const [filterTanggal, setFilterTanggal] = useState('Semua Tanggal');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');

  /* Dropdown Open States */
  const [isKatOpen, setIsKatOpen] = useState(false);
  const [isTanggalOpen, setIsTanggalOpen] = useState(false);
  const [isJenisOpen, setIsJenisOpen] = useState(false);

  const katRef = useRef<HTMLDivElement>(null);
  const tglRef = useRef<HTMLDivElement>(null);
  const jnsRef = useRef<HTMLDivElement>(null);

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  /* User Profile for Header */
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    id: '',
    email: '',
    nama: '',
    role: 'Admin',
    avatarUrl: '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const p = await getUserProfile();
        if (isMounted) setUserProfile(p);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();

    const handleProfileUpdate = () => loadProfile();
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  /* Helper: find link to KitaBisa for a category */
  const getKitabisaLink = useCallback(
    (kategoriName: string) => {
      const match = transaksiYayasanList.find(
        (t) => t.kategori && t.kategori.toLowerCase().trim() === (kategoriName || '').toLowerCase().trim()
      );
      return match?.linkDonasi || 'https://kitabisa.com';
    },
    [transaksiYayasanList]
  );

  /* Fetch Data */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [list, transaksiList] = await Promise.all([
        getDataNonMedisList(),
        getTransaksiYayasanList(),
      ]);
      setDataList(list);
      setTransaksiYayasanList(transaksiList);
      setErrorMessage('');
    } catch (e) {
      console.error('Error fetching data non medis:', e);
      setErrorMessage('Gagal memuat data dari Supabase.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsub = subscribeToDatabaseChanges(() => {
      fetchData();
    });
    return () => {
      unsub();
    };
  }, [fetchData]);

  /* Close dropdowns when clicking outside */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (katRef.current && !katRef.current.contains(event.target as Node)) {
        setIsKatOpen(false);
      }
      if (tglRef.current && !tglRef.current.contains(event.target as Node)) {
        setIsTanggalOpen(false);
      }
      if (jnsRef.current && !jnsRef.current.contains(event.target as Node)) {
        setIsJenisOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* Distinct Categories from Supabase data + defaults */
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_CATEGORIES.forEach((k) => set.add(k));
    dataList.forEach((item) => {
      const kat = item.kategori?.trim();
      if (kat && !EXCLUDED_CATEGORIES.has(kat)) {
        set.add(kat);
      }
    });
    return Array.from(set);
  }, [dataList]);

  /* Distinct Date / Month periods from Supabase data */
  const dateOptions = useMemo(() => {
    const set = new Set<string>();
    dataList.forEach((item) => {
      if (item.tanggal && item.tanggal.trim()) {
        set.add(item.tanggal.trim());
      }
    });
    return Array.from(set);
  }, [dataList]);

  /* Modal states */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransaksiKategori | null>(null);
  const [deletingItem, setDeletingItem] = useState<TransaksiKategori | null>(null);

  /* Sub-row type for multi-row form */
  type SubRow = {
    id: string;
    tanggal: string;
    kategori: string;
    link: string;
    masuk: string;
    keluar: string;
    buktiUrl: string;
    previewUrl: string;
    statusImplementasi: 'Sudah Implementasi' | 'Belum Implementasi';
  };

  function newSubRow(defaultTanggal?: string): SubRow {
    const today = defaultTanggal || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return {
      id: Math.random().toString(36).slice(2),
      tanggal: today,
      kategori: categoryOptions[0] || 'Mobil Siaga',
      link: '',
      masuk: '',
      keluar: '',
      buktiUrl: '',
      previewUrl: '',
      statusImplementasi: 'Belum Implementasi',
    };
  }

  /* Multi sub-rows state for Add modal */
  const [addNamaPasien, setAddNamaPasien] = useState('');
  const [addSubRows, setAddSubRows] = useState<SubRow[]>([]);
  const addFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Multi sub-rows state for Edit modal */
  type EditSubRow = {
    dbId?: number;
    id: string;
    tanggal: string;
    kategori: string;
    link: string;
    masuk: string;
    keluar: string;
    buktiUrl: string;
    previewUrl: string;
    statusImplementasi: 'Sudah Implementasi' | 'Belum Implementasi';
  };

  const [editNamaPasien, setEditNamaPasien] = useState('');
  const [editGroupId, setEditGroupId] = useState<number | null>(null);
  const [editSubRows, setEditSubRows] = useState<EditSubRow[]>([]);
  const [editDeletedDbIds, setEditDeletedDbIds] = useState<number[]>([]);
  const editFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Total Donasi Masuk dari Transaksi Yayasan (realtime) */
  const totalDonasiYayasan = useMemo(() => {
    let filtered = transaksiYayasanList;
    if (filterKategori !== 'Semua Kategori') {
      filtered = filtered.filter(
        (t) => (t.kategori || '').toLowerCase().trim() === filterKategori.toLowerCase().trim()
      );
    }
    return filtered.reduce((s, t) => s + (t.jumlahDonasi || 0), 0);
  }, [transaksiYayasanList, filterKategori]);

  /* ── Filtered data combining Kategori, Tanggal, Jenis, Search ── */
  const filteredData = useMemo(() => {
    let d = dataList;

    // Filter Kategori
    if (filterKategori !== 'Semua Kategori') {
      d = d.filter((t) => t.kategori === filterKategori);
    }

    // Filter Tanggal
    if (filterTanggal !== 'Semua Tanggal') {
      d = d.filter((t) => t.tanggal.includes(filterTanggal));
    }

    // Filter Jenis
    if (filterJenis === 'Pemasukan') {
      d = d.filter((t) => t.masuk !== null && t.masuk !== 0);
    } else if (filterJenis === 'Pengeluaran') {
      d = d.filter((t) => t.keluar !== null && t.keluar !== 0);
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      d = d.filter(
        (t) =>
          (t.namaPasien || '').toLowerCase().includes(term) ||
          (t.keterangan || '').toLowerCase().includes(term) ||
          t.kategori.toLowerCase().includes(term) ||
          t.tanggal.toLowerCase().includes(term)
      );
    }

    return withSaldo(d, 0);
  }, [dataList, filterKategori, filterTanggal, filterJenis, searchTerm]);

  const totalMasuk = useMemo(() => {
    return filteredData.reduce((s, t) => s + (t.masuk ?? 0), 0);
  }, [filteredData]);

  const totalKeluar = useMemo(() => {
    return filteredData.reduce((s, t) => s + (t.keluar ?? 0), 0);
  }, [filteredData]);

  // Sisa Saldo: hanya dari baris yang belum implementasi
  // Jika semua baris sudah implementasi, saldo = 0
  const saldo = useMemo(() => {
    const belumImpl = filteredData.filter((t) => t.statusImplementasi !== 'Sudah Implementasi');
    const masukBelum = belumImpl.reduce((s, t) => s + (t.masuk ?? 0), 0);
    const keluarBelum = belumImpl.reduce((s, t) => s + (t.keluar ?? 0), 0);
    return masukBelum - keluarBelum;
  }, [filteredData]);

  /* Pagination calculations */
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));

  /* Reset to page 1 on filter or search change */
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKategori, filterTanggal, filterJenis, searchTerm]);

  /* Clamp currentPage if out of bounds after deletion or filtering */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const startRecord = totalRecords === 0 ? 1 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = totalRecords === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalRecords);

  function handleOpenAdd() {
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const autoKat = filterKategori !== 'Semua Kategori' ? filterKategori : (categoryOptions[0] || 'Mobil Siaga');
    setAddNamaPasien('');
    setAddSubRows([{ ...newSubRow(today), kategori: autoKat }]);
    setIsAddModalOpen(true);
  }

  async function handleSaveAdd(e: React.FormEvent) {
    e.preventDefault();
    if (addSubRows.length === 0) return;

    /* Calculate next noGroup value */
    const maxGroup = dataList.reduce((m, t) => Math.max(m, t.noGroup ?? 0), 0);
    const groupId = maxGroup + 1;

    const saved: TransaksiKategori[] = [];
    for (const sub of addSubRows) {
      const newItem = await addDataNonMedis({
        tanggal: sub.tanggal || new Date().toLocaleDateString('id-ID'),
        kategori: sub.kategori,
        keterangan: '',
        masuk: sub.masuk ? Number(sub.masuk) : null,
        keluar: sub.keluar ? Number(sub.keluar) : null,
        buktiType: sub.buktiUrl ? 'image' : null,
        buktiUrl: sub.buktiUrl,
        link: sub.link,
        namaPasien: addNamaPasien,
        noGroup: groupId,
        statusImplementasi: sub.statusImplementasi || 'Belum Implementasi',
      });
      saved.push(newItem);
    }
    setDataList((prev) => [...saved, ...prev]);
    setIsAddModalOpen(false);
    setCurrentPage(1);
  }

  function handleOpenEdit(item: TransaksiKategori) {
    let groupMembers: TransaksiKategori[] = [];
    if (item.namaPasien?.trim()) {
      groupMembers = dataList.filter(
        (t) => (t.namaPasien || '').trim().toLowerCase() === item.namaPasien!.trim().toLowerCase()
      );
    } else if (item.noGroup != null) {
      groupMembers = dataList.filter((t) => t.noGroup === item.noGroup);
    }
    if (groupMembers.length === 0) {
      groupMembers = [item];
    }

    const first = groupMembers[0];
    setEditGroupId(first.noGroup ?? null);
    setEditNamaPasien(first.namaPasien || '');
    setEditDeletedDbIds([]);
    setEditSubRows(
      groupMembers.map((m) => ({
        dbId: m.id,
        id: String(m.id || Math.random().toString(36).slice(2)),
        tanggal: m.tanggal || '',
        kategori: m.kategori || categoryOptions[0] || 'Mobil Siaga',
        link: m.link || '',
        masuk: m.masuk !== null && m.masuk !== undefined ? String(m.masuk) : '',
        keluar: m.keluar !== null && m.keluar !== undefined ? String(m.keluar) : '',
        buktiUrl: m.buktiUrl || '',
        previewUrl: m.buktiUrl || '',
        statusImplementasi: m.statusImplementasi || 'Belum Implementasi',
      }))
    );
    setEditingItem(first);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem || editSubRows.length === 0) return;

    // 1. Delete removed DB rows
    for (const dbId of editDeletedDbIds) {
      await deleteDataNonMedis(dbId);
    }

    // 2. Maintain / assign group ID if multiple rows
    let groupId = editGroupId;
    if (groupId == null && editSubRows.length > 1) {
      const maxGroup = dataList.reduce((m, t) => Math.max(m, t.noGroup ?? 0), 0);
      groupId = maxGroup + 1;
    }

    const updatedOrNewList: TransaksiKategori[] = [];
    for (const sub of editSubRows) {
      if (sub.dbId) {
        const updated: TransaksiKategori = {
          id: sub.dbId,
          tanggal: sub.tanggal || new Date().toLocaleDateString('id-ID'),
          namaPasien: editNamaPasien,
          kategori: sub.kategori,
          keterangan: '',
          masuk: sub.masuk ? Number(sub.masuk) : null,
          keluar: sub.keluar ? Number(sub.keluar) : null,
          buktiType: sub.buktiUrl ? 'image' : null,
          buktiUrl: sub.buktiUrl,
          link: sub.link,
          noGroup: groupId ?? undefined,
          statusImplementasi: sub.statusImplementasi || 'Belum Implementasi',
        };
        await updateDataNonMedis(updated);
        updatedOrNewList.push(updated);
      } else {
        const created = await addDataNonMedis({
          tanggal: sub.tanggal || new Date().toLocaleDateString('id-ID'),
          namaPasien: editNamaPasien,
          kategori: sub.kategori,
          keterangan: '',
          masuk: sub.masuk ? Number(sub.masuk) : null,
          keluar: sub.keluar ? Number(sub.keluar) : null,
          buktiType: sub.buktiUrl ? 'image' : null,
          buktiUrl: sub.buktiUrl,
          link: sub.link,
          noGroup: groupId ?? undefined,
          statusImplementasi: sub.statusImplementasi || 'Belum Implementasi',
        });
        updatedOrNewList.push(created);
      }
    }

    const deletedSet = new Set(editDeletedDbIds);
    const updatedMap = new Map<number, TransaksiKategori>();
    updatedOrNewList.forEach((it) => {
      if (it.id && !deletedSet.has(it.id)) {
        updatedMap.set(it.id, it);
      }
    });

    setDataList((prev) => {
      const remainingOld = prev
        .filter((t) => !deletedSet.has(t.id))
        .map((t) => updatedMap.get(t.id) || t);
      const existingIds = new Set(remainingOld.map((t) => t.id));
      const newlyCreated = updatedOrNewList.filter((t) => !existingIds.has(t.id));
      return [...newlyCreated, ...remainingOld];
    });

    setEditingItem(null);
    setEditSubRows([]);
    setEditDeletedDbIds([]);
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return;
    await deleteDataNonMedis(deletingItem.id);
    setDataList((prev) => prev.filter((t) => t.id !== deletingItem.id));
    setDeletingItem(null);
  }

  /* Dynamic Page Button Generator */
  function PageButtons() {
    if (totalRecords === 0) {
      return (
        <>
          <button className={styles.pageBtn} disabled aria-label="Halaman Sebelumnya">
            ‹
          </button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
            1
          </button>
          <button className={styles.pageBtn} disabled aria-label="Halaman Berikutnya">
            ›
          </button>
        </>
      );
    }

    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return (
      <>
        <button
          className={styles.pageBtn}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          aria-label="Halaman Sebelumnya"
        >
          ‹
        </button>
        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={p}
              className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ''}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ) : (
            <span key={`dots-${idx}`} style={{ color: '#94a3b8', padding: '0 4px', fontSize: '13px' }}>
              ...
            </span>
          )
        )}
        <button
          className={styles.pageBtn}
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          aria-label="Halaman Berikutnya"
        >
          ›
        </button>
      </>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Top Header Bar ── */}
      <div className={styles.topHeader}>
        <div className={styles.topSearchWrap}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Cari transaksi, kategori, atau keterangan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.topSearchInput}
          />
        </div>

        <div className={styles.topRightActions}>
          <AdminProfileDropdown profile={userProfile} />
        </div>
      </div>

      {/* ── Section Title ── */}
      <div className={styles.titleSection}>
        <div className={styles.breadcrumb}>
          <span>DATA NON MEDIS</span>
          <span className={styles.breadcrumbSep}>›</span>
        </div>
        <h1 className={styles.mainTitle}>Data Non Medis</h1>
        <p className={styles.mainSubtitle}>
          Kelola seluruh transaksi pemasukan dan pengeluaran berdasarkan kategori data non medis.
        </p>
      </div>

      {/* ── Error Banner if any ── */}
      {errorMessage && (
        <div className={styles.errorBanner}>
          <span>{errorMessage}</span>
          <button onClick={fetchData} className={styles.cancelBtn} style={{ padding: '4px 8px', fontSize: '12px' }}>
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className={styles.summaryGrid}>
        {/* Card 1: Total Pemasukan */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconWrap} ${styles.iconBlue}`}>
            <UpArrowIcon />
          </div>
          <div className={styles.summaryInfo}>
            <div className={styles.summaryLabel}>Total Pemasukan</div>
            <div className={styles.summaryValue}>{formatRp(totalMasuk)}</div>

          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconWrap} ${styles.iconOrange}`}>
            <DownArrowIcon />
          </div>
          <div className={styles.summaryInfo}>
            <div className={styles.summaryLabel}>Total Pengeluaran</div>
            <div className={styles.summaryValue}>{formatRp(totalKeluar)}</div>

          </div>
        </div>

        {/* Card 3: Sisa Saldo */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconWrap} ${styles.iconGreen}`}>
            <WalletIcon />
          </div>
          <div className={styles.summaryInfo}>
            <div className={styles.summaryLabel}>Sisa Saldo</div>
            <div className={styles.summaryValue}>{formatRp(saldo)}</div>
          </div>
        </div>
      </div>

      {/* ── Filter & Action Row ── */}
      <div className={styles.tableActionRow}>
        {/* Filter Kategori Dropdown */}
        <div className={styles.filterDropdownWrap} ref={katRef}>
          <button
            className={`${styles.filterBtn} ${filterKategori !== 'Semua Kategori' ? styles.filterBtnActiveState : ''}`}
            onClick={() => {
              setIsKatOpen(!isKatOpen);
              setIsTanggalOpen(false);
              setIsJenisOpen(false);
            }}
          >
            <span className={styles.filterBtnIcon}><FolderIcon /></span>
            <span>{filterKategori}</span>
            <ChevronDownIcon />
          </button>
          {isKatOpen && (
            <div className={styles.filterMenu}>
              <button
                className={`${styles.filterMenuItem} ${filterKategori === 'Semua Kategori' ? styles.filterMenuItemActive : ''}`}
                onClick={() => {
                  setFilterKategori('Semua Kategori');
                  setCurrentPage(1);
                  setIsKatOpen(false);
                }}
              >
                <span>Semua Kategori</span>
              </button>
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterMenuItem} ${filterKategori === cat ? styles.filterMenuItemActive : ''}`}
                  onClick={() => {
                    setFilterKategori(cat);
                    setCurrentPage(1);
                    setIsKatOpen(false);
                  }}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Tanggal Dropdown */}
        <div className={styles.filterDropdownWrap} ref={tglRef}>
          <button
            className={`${styles.filterBtn} ${filterTanggal !== 'Semua Tanggal' ? styles.filterBtnActiveState : ''}`}
            onClick={() => {
              setIsTanggalOpen(!isTanggalOpen);
              setIsKatOpen(false);
              setIsJenisOpen(false);
            }}
          >
            <CalendarIcon />
            <span>{filterTanggal}</span>
            <ChevronDownIcon />
          </button>
          {isTanggalOpen && (
            <div className={styles.filterMenu}>
              <button
                className={`${styles.filterMenuItem} ${filterTanggal === 'Semua Tanggal' ? styles.filterMenuItemActive : ''}`}
                onClick={() => {
                  setFilterTanggal('Semua Tanggal');
                  setCurrentPage(1);
                  setIsTanggalOpen(false);
                }}
              >
                <span>Semua Tanggal</span>
              </button>
              {dateOptions.map((d) => (
                <button
                  key={d}
                  className={`${styles.filterMenuItem} ${filterTanggal === d ? styles.filterMenuItemActive : ''}`}
                  onClick={() => {
                    setFilterTanggal(d);
                    setCurrentPage(1);
                    setIsTanggalOpen(false);
                  }}
                >
                  <span>{d}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Jenis Dropdown */}
        <div className={styles.filterDropdownWrap} ref={jnsRef}>
          <button
            className={`${styles.filterBtn} ${filterJenis !== 'Semua Jenis' ? styles.filterBtnActiveState : ''}`}
            onClick={() => {
              setIsJenisOpen(!isJenisOpen);
              setIsKatOpen(false);
              setIsTanggalOpen(false);
            }}
          >
            <FilterIcon />
            <span>{filterJenis}</span>
            <ChevronDownIcon />
          </button>
          {isJenisOpen && (
            <div className={styles.filterMenu}>
              {['Semua Jenis', 'Pemasukan', 'Pengeluaran'].map((j) => (
                <button
                  key={j}
                  className={`${styles.filterMenuItem} ${filterJenis === j ? styles.filterMenuItemActive : ''}`}
                  onClick={() => {
                    setFilterJenis(j);
                    setCurrentPage(1);
                    setIsJenisOpen(false);
                  }}
                >
                  <span>{j}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input in Action Row */}
        <div className={styles.tableSearchBox}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.tableSearchInput}
          />
        </div>

        <div className={styles.spacer} />

        {/* Add Button */}
        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <PlusIcon />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colNo}>No.</th>
              <th className={styles.colNamaPasien}>Nama Pasien</th>
              <th>
                <span className={styles.sortHeader}>
                  Tanggal <ChevronUpDownIcon />
                </span>
              </th>
              <th>Kategori</th>
              <th>Link KitaBisa</th>
              <th>
                <span className={styles.sortHeader}>
                  Masuk <ChevronUpDownIcon />
                </span>
              </th>
              <th>
                <span className={styles.sortHeader}>
                  Keluar <ChevronUpDownIcon />
                </span>
              </th>
              <th>
                <span className={styles.sortHeader}>
                  Saldo <ChevronUpDownIcon />
                </span>
              </th>
              <th>Status Implementasi</th>
              <th>Bukti</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#0284c7' }}>
                  Memuat data transaksi...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Tidak ada transaksi yang ditemukan.
                </td>
              </tr>
            ) : (() => {
              /* ── Build grouped rows ── */
              type GroupedRow = {
                groupKey: string;
                items: (TransaksiKategori & { saldo: number; _displayIndex: number })[];
              };

              /* Assign display index first */
              const indexedData = paginatedData.map((item, i) => ({
                ...item,
                _displayIndex: (currentPage - 1) * ITEMS_PER_PAGE + i + 1,
              }));

              /* Group by namaPasien (if set) else noGroup else each item is its own group */
              const groups: GroupedRow[] = [];
              const seen = new Map<string, GroupedRow>();
              indexedData.forEach((item) => {
                const key = item.namaPasien?.trim()
                  ? `pasien-${item.namaPasien.trim().toLowerCase()}`
                  : item.noGroup != null
                  ? `grp-${item.noGroup}`
                  : `solo-${item.id}`;
                if (!seen.has(key)) {
                  const g: GroupedRow = { groupKey: key, items: [] };
                  groups.push(g);
                  seen.set(key, g);
                }
                seen.get(key)!.items.push(item);
              });

              /* Running display number per group */
              let displayNo = (currentPage - 1) * ITEMS_PER_PAGE + 1;

              return groups.map((group) => {
                const rowSpan = group.items.length;
                const firstItem = group.items[0];
                const groupNo = displayNo;
                displayNo++;

                return group.items.map((item, subIdx) => {
                  const activeLink = item.link || getKitabisaLink(item.kategori);
                  const isFirst = subIdx === 0;
                  return (
                    <tr
                      key={item.id}
                      className={rowSpan > 1 ? styles.groupedRow : ''}
                    >
                      {/* No. + Nama Pasien — only render on first sub-row with rowspan */}
                      {isFirst && (
                        <>
                          <td
                            className={styles.colNo}
                            rowSpan={rowSpan}
                            style={rowSpan > 1 ? { verticalAlign: 'middle', borderRight: '2px solid #e2e8f0' } : undefined}
                          >
                            {groupNo}
                          </td>
                          <td
                            className={styles.colNamaPasien}
                            rowSpan={rowSpan}
                            style={rowSpan > 1 ? { verticalAlign: 'middle', borderRight: '2px solid #e2e8f0', fontWeight: 600 } : undefined}
                          >
                            {firstItem.namaPasien || <span className={styles.amountDash}>-</span>}
                          </td>
                        </>
                      )}
                      <td className={styles.colTanggal}>{item.tanggal}</td>
                      <td>
                        <span className={`${styles.categoryBadge} ${getBadgeClass(item.kategori)}`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const linksList = (activeLink || '')
                            .split(/[\s,\n]+/)
                            .map((l) => l.trim())
                            .filter((l) => l.length > 0);

                          if (linksList.length === 0) {
                            return <span className={styles.amountDash}>-</span>;
                          }

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {linksList.map((lnk, lIdx) => (
                                <a
                                  key={lIdx}
                                  href={sanitizeUrl(lnk)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.kitabisaLinkBtn}
                                  title={`Lihat Link KitaBisa ${lIdx + 1}`}
                                >
                                  <ExternalLinkIcon />
                                  <span>KitaBisa{linksList.length > 1 ? ` #${lIdx + 1}` : ''}</span>
                                </a>
                              ))}
                            </div>
                          );
                        })()}
                      </td>
                      <td className={item.masuk !== null ? styles.amountPos : styles.amountDash}>
                        {item.masuk !== null ? formatRp(item.masuk) : '-'}
                      </td>
                      <td className={item.keluar !== null ? styles.amountPos : styles.amountDash}>
                        {item.keluar !== null ? formatRp(item.keluar) : '-'}
                      </td>
                      <td className={item.saldo >= 0 ? styles.amountPos : styles.amountNeg}>
                        {item.saldo < 0 ? '-' + formatRp(Math.abs(item.saldo)) : formatRp(item.saldo)}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${item.statusImplementasi === 'Sudah Implementasi' ? styles.statusSudah : styles.statusBelum}`}>
                          <span className={styles.statusDot} />
                          {item.statusImplementasi || 'Belum Implementasi'}
                        </span>
                      </td>
                      <td>
                        {item.buktiType === 'image' && item.buktiUrl ? (
                          <a href={sanitizeUrl(item.buktiUrl)} target="_blank" rel="noopener noreferrer" className={styles.thumbLink}>
                            <img src={item.buktiUrl} alt="bukti" className={styles.thumbImg} />
                          </a>
                        ) : (
                          <span className={styles.amountDash}>-</span>
                        )}
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          className={`${styles.actionIconBtn} ${styles.btnEdit}`}
                          title="Edit Sub-baris"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className={`${styles.actionIconBtn} ${styles.btnDelete}`}
                          title="Hapus Sub-baris"
                          onClick={() => setDeletingItem(item)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  );
                });
              });
            })()}
          </tbody>
        </table>

        {/* ── Pagination Footer ── */}
        <div className={styles.tableFooter}>
          <div className={styles.footerInfo}>
            Menampilkan {startRecord} - {endRecord} dari {totalRecords} transaksi
          </div>
          <div className={styles.pagination}>
            <PageButtons />
          </div>
        </div>
      </div>

      {/* ── Page Footer Quote ── */}
      <div className={styles.pageBottomNote}>
        <span className={styles.quoteText}>&ldquo;Data hari ini, untuk masa depan yang lebih baik.&rdquo;</span>
        <span className={styles.brandNote}>UNTUK TEMAN &bull; Membantu lebih banyak, bersama.</span>
      </div>

      {/* ── Modal Tambah Transaksi (Multi Sub-baris) ── */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={`${styles.modalCard} ${styles.modalCardWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tambah Transaksi</h3>
              <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className={styles.modalBody}>
                {/* ── Header grup: Nama Pasien ── */}
                <div className={styles.groupHeaderBox}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Pasien</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={addNamaPasien}
                      onChange={(e) => setAddNamaPasien(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* ── Sub-baris list ── */}
                <div className={styles.subRowsLabel}>
                  <span>Detail Transaksi ({addSubRows.length} baris)</span>
                  <button
                    type="button"
                    className={styles.addSubRowBtn}
                    onClick={() => {
                      const lastDate = addSubRows[addSubRows.length - 1]?.tanggal;
                      setAddSubRows((prev) => [...prev, newSubRow(lastDate)]);
                    }}
                  >
                    <PlusIcon /> Tambah Baris
                  </button>
                </div>

                {addSubRows.map((sub, si) => (
                  <div key={sub.id} className={styles.subRowCard}>
                    <div className={styles.subRowCardHeader}>
                      <span className={styles.subRowNum}>Baris {si + 1}</span>
                      {addSubRows.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeSubRowBtn}
                          onClick={() => setAddSubRows((prev) => prev.filter((_, i) => i !== si))}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tanggal</label>
                        <input
                          type="text"
                          required
                          placeholder="DD/MM/YYYY"
                          value={sub.tanggal}
                          onChange={(e) =>
                            setAddSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, tanggal: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Kategori</label>
                        <input
                          type="text"
                          required
                          list={`kat-list-${sub.id}`}
                          placeholder="Contoh: Mobil Siaga"
                          value={sub.kategori}
                          onChange={(e) =>
                            setAddSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, kategori: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                        <datalist id={`kat-list-${sub.id}`}>
                          {categoryOptions.map((k) => (
                            <option key={k} value={k} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Link KitaBisa (Opsional)</label>
                      <input
                        type="text"
                        placeholder="https://kitabisa.com/..."
                        value={sub.link}
                        onChange={(e) =>
                          setAddSubRows((prev) =>
                            prev.map((r, i) => (i === si ? { ...r, link: e.target.value } : r))
                          )
                        }
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Masuk (Rp)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={sub.masuk}
                          onChange={(e) =>
                            setAddSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, masuk: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Keluar (Rp)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={sub.keluar}
                          onChange={(e) =>
                            setAddSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, keluar: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Status Implementasi</label>
                      <select
                        value={sub.statusImplementasi || 'Belum Implementasi'}
                        onChange={(e) =>
                          setAddSubRows((prev) =>
                            prev.map((r, i) =>
                              i === si
                                ? { ...r, statusImplementasi: e.target.value as 'Sudah Implementasi' | 'Belum Implementasi' }
                                : r
                            )
                          )
                        }
                        className={styles.selectInput}
                      >
                        <option value="Sudah Implementasi">Sudah Implementasi</option>
                        <option value="Belum Implementasi">Belum Implementasi</option>
                      </select>
                    </div>

                    {/* Bukti Upload */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Bukti Gambar (Opsional)</label>
                      <div
                        className={styles.uploadZone}
                        onClick={() => addFileRefs.current[si]?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            setAddSubRows((prev) => prev.map((r, i) => i === si ? { ...r, buktiUrl: result, previewUrl: result } : r));
                          };
                          reader.readAsDataURL(file);
                        }}
                      >
                        {sub.previewUrl ? (
                          <div className={styles.previewWrap}>
                            <img src={sub.previewUrl} alt="preview" className={styles.previewImg} />
                            <button
                              type="button"
                              className={styles.removeImgBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddSubRows((prev) => prev.map((r, i) => i === si ? { ...r, buktiUrl: '', previewUrl: '' } : r));
                                if (addFileRefs.current[si]) addFileRefs.current[si]!.value = '';
                              }}
                            >
                              &times; Hapus gambar
                            </button>
                          </div>
                        ) : (
                          <div className={styles.uploadPlaceholder}>
                            <UploadIcon />
                            <span className={styles.uploadText}>Klik atau seret gambar ke sini</span>
                            <span className={styles.uploadHint}>JPG, PNG, WEBP — maks 5 MB</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={(el) => { addFileRefs.current[si] = el; }}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            setAddSubRows((prev) => prev.map((r, i) => i === si ? { ...r, buktiUrl: result, previewUrl: result } : r));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Simpan {addSubRows.length > 1 ? `${addSubRows.length} Baris` : 'Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Edit Transaksi (Multi Sub-baris Group Edit) ── */}
      {editingItem && (
        <div className={styles.modalOverlay} onClick={() => setEditingItem(null)}>
          <div className={`${styles.modalCard} ${styles.modalCardWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Transaksi</h3>
              <button className={styles.closeBtn} onClick={() => setEditingItem(null)}>&times;</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className={styles.modalBody}>
                {/* ── Header grup: Nama Pasien ── */}
                <div className={styles.groupHeaderBox}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Pasien</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={editNamaPasien}
                      onChange={(e) => setEditNamaPasien(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* ── Sub-baris list ── */}
                <div className={styles.subRowsLabel}>
                  <span>Detail Transaksi ({editSubRows.length} baris)</span>
                  <button
                    type="button"
                    className={styles.addSubRowBtn}
                    onClick={() => {
                      const lastDate = editSubRows[editSubRows.length - 1]?.tanggal;
                      setEditSubRows((prev) => [
                        ...prev,
                        {
                          id: Math.random().toString(36).slice(2),
                          tanggal: lastDate || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                          kategori: categoryOptions[0] || 'Mobil Siaga',
                          link: '',
                          masuk: '',
                          keluar: '',
                          buktiUrl: '',
                          previewUrl: '',
                          statusImplementasi: 'Belum Implementasi',
                        },
                      ]);
                    }}
                  >
                    <PlusIcon /> Tambah Baris
                  </button>
                </div>

                {editSubRows.map((sub, si) => (
                  <div key={sub.id} className={styles.subRowCard}>
                    <div className={styles.subRowCardHeader}>
                      <span className={styles.subRowNum}>Baris {si + 1}</span>
                      {editSubRows.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeSubRowBtn}
                          onClick={() => {
                            const toDel = editSubRows[si];
                            if (toDel.dbId) {
                              setEditDeletedDbIds((prev) => [...prev, toDel.dbId!]);
                            }
                            setEditSubRows((prev) => prev.filter((_, i) => i !== si));
                          }}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tanggal</label>
                        <input
                          type="text"
                          required
                          placeholder="DD/MM/YYYY"
                          value={sub.tanggal}
                          onChange={(e) =>
                            setEditSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, tanggal: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Kategori</label>
                        <input
                          type="text"
                          required
                          list={`edit-kat-list-${sub.id}`}
                          placeholder="Contoh: Mobil Siaga"
                          value={sub.kategori}
                          onChange={(e) =>
                            setEditSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, kategori: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                        <datalist id={`edit-kat-list-${sub.id}`}>
                          {categoryOptions.map((k) => (
                            <option key={k} value={k} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Link KitaBisa (Opsional)</label>
                      <input
                        type="text"
                        placeholder="https://kitabisa.com/..."
                        value={sub.link}
                        onChange={(e) =>
                          setEditSubRows((prev) =>
                            prev.map((r, i) => (i === si ? { ...r, link: e.target.value } : r))
                          )
                        }
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Masuk (Rp)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={sub.masuk}
                          onChange={(e) =>
                            setEditSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, masuk: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Keluar (Rp)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={sub.keluar}
                          onChange={(e) =>
                            setEditSubRows((prev) =>
                              prev.map((r, i) => (i === si ? { ...r, keluar: e.target.value } : r))
                            )
                          }
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Status Implementasi</label>
                      <select
                        value={sub.statusImplementasi || 'Belum Implementasi'}
                        onChange={(e) =>
                          setEditSubRows((prev) =>
                            prev.map((r, i) =>
                              i === si
                                ? { ...r, statusImplementasi: e.target.value as 'Sudah Implementasi' | 'Belum Implementasi' }
                                : r
                            )
                          )
                        }
                        className={styles.selectInput}
                      >
                        <option value="Sudah Implementasi">Sudah Implementasi</option>
                        <option value="Belum Implementasi">Belum Implementasi</option>
                      </select>
                    </div>

                    {/* Bukti Upload */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Bukti Gambar (Opsional)</label>
                      <div
                        className={styles.uploadZone}
                        onClick={() => editFileRefs.current[si]?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            setEditSubRows((prev) =>
                              prev.map((r, i) =>
                                i === si ? { ...r, buktiUrl: result, previewUrl: result } : r
                              )
                            );
                          };
                          reader.readAsDataURL(file);
                        }}
                      >
                        {sub.previewUrl ? (
                          <div className={styles.previewWrap}>
                            <img src={sub.previewUrl} alt="preview" className={styles.previewImg} />
                            <button
                              type="button"
                              className={styles.removeImgBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditSubRows((prev) =>
                                  prev.map((r, i) => (i === si ? { ...r, buktiUrl: '', previewUrl: '' } : r))
                                );
                                if (editFileRefs.current[si]) editFileRefs.current[si]!.value = '';
                              }}
                            >
                              &times; Hapus gambar
                            </button>
                          </div>
                        ) : (
                          <div className={styles.uploadPlaceholder}>
                            <UploadIcon />
                            <span className={styles.uploadText}>Klik atau seret gambar ke sini</span>
                            <span className={styles.uploadHint}>JPG, PNG, WEBP — maks 5 MB</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={(el) => {
                          editFileRefs.current[si] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string;
                            setEditSubRows((prev) =>
                              prev.map((r, i) =>
                                i === si ? { ...r, buktiUrl: result, previewUrl: result } : r
                              )
                            );
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingItem(null)}>
                  Batal
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Hapus ── */}
      {deletingItem && (
        <div className={styles.modalOverlay} onClick={() => setDeletingItem(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Hapus Transaksi</h3>
              <button className={styles.closeBtn} onClick={() => setDeletingItem(null)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteConfirmText}>
                Apakah Anda yakin ingin menghapus transaksi <strong>{deletingItem.keterangan}</strong> dari kategori{' '}
                <strong>{deletingItem.kategori}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeletingItem(null)}>
                Batal
              </button>
              <button className={styles.dangerBtn} onClick={handleConfirmDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
