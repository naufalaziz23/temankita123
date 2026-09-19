'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getTransaksiYayasanList,
  getDataNonMedisList,
  addTransaksiYayasan,
  updateTransaksiYayasan,
  deleteTransaksiYayasan,
  subscribeToDatabaseChanges,
  getUserProfile,
  sanitizeUrl,
  TransaksiYayasanItem,
  DataNonMedisItem,
  UserProfileData,
} from '@/lib/supabase/services';
import AdminProfileDropdown from '@/components/common/AdminProfileDropdown';
import styles from './TransaksiYayasan.module.css';

/* ── Interfaces ── */
export type TransaksiItem = TransaksiYayasanItem;

/* ── SVG Icons ── */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}


function ArrowDownIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 010-4h14v4" />
      <path d="M3 5v14a2 2 0 002 2h16v-5" />
      <path d="M18 12a2 2 0 000 4h4v-4z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

/* ── Helper ── */
function formatRupiah(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  const isNeg = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('id-ID');
  return isNeg ? `Rp -${absFormatted}` : `Rp ${absFormatted}`;
}

/* ── Kategori options ── */
const KATEGORI_OPTIONS = [
  'Santunan Sosok',
  'Rumah Singgah',
  'Mobil Siaga',
  'Pendidikan',
  'Cek Kesehatan Lansia',
  'Panti / Pondok Pesantren',
  'Bersih Alam',
  'Modal Usaha',
  'Sembako Lansia/Dhuafa/Disabilitas',
  'Anak yatim',
  'Foodbox',
  'Perlengkapan Sholat',
];

const ITEMS_PER_PAGE = 30;

const emptyForm = {
  tanggalPencairan: '',
  linkDonasi: '',
  jumlahDonasi: '',
  kategori: KATEGORI_OPTIONS[0],
  alokasi: '',
  sisaDonasi: '',
  statusImplementasi: 'Belum Implementasi' as TransaksiItem['statusImplementasi'],
  linkImplementasi: '',
};

export default function TransaksiYayasan() {
  const [dataList, setDataList] = useState<TransaksiItem[]>([]);
  const [nonMedisList, setNonMedisList] = useState<DataNonMedisItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransaksi = useCallback(async () => {
    try {
      const [list, nonmedis] = await Promise.all([
        getTransaksiYayasanList(),
        getDataNonMedisList(),
      ]);
      setDataList(list);
      setNonMedisList(nonmedis);
    } catch (e) {
      console.error('Error fetching transaksi yayasan:', e);
    }
  }, []);

  useEffect(() => {
    fetchTransaksi();
    const unsub = subscribeToDatabaseChanges(() => {
      fetchTransaksi();
    });

    const handleFocus = () => {
      fetchTransaksi();
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      unsub();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchTransaksi]);

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

  /* Modal States */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransaksiItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TransaksiItem | null>(null);
  const [viewingItem, setViewingItem] = useState<TransaksiItem | null>(null);

  /* Form state */
  const [formData, setFormData] = useState({ ...emptyForm });

  /* Helper to compute row alokasi for any item */
  const getItemAlokasi = useCallback(
    (item: TransaksiItem) => {
      const catKey = (item.kategori || '').toLowerCase().trim();
      const catKeluar = nonMedisList
        .filter((n) => (n.kategori || '').toLowerCase().trim() === catKey)
        .reduce((s, n) => s + (n.keluar || 0), 0);

      if (catKeluar > 0 && (!item.alokasi || item.alokasi === 0)) {
        return catKeluar;
      }
      return item.alokasi || 0;
    },
    [nonMedisList]
  );

  /* Computed summary */
  const totalDanaMasuk = useMemo(() => dataList.reduce((s, i) => s + (i.jumlahDonasi || 0), 0), [dataList]);
  const totalImplementasi = useMemo(() => dataList.reduce((s, i) => s + (getItemAlokasi(i) || 0), 0), [dataList, getItemAlokasi]);
  const sisaTotal = useMemo(() => totalDanaMasuk - totalImplementasi, [totalDanaMasuk, totalImplementasi]);

  /* Filtering */
  const filteredData = useMemo(() => {
    let d = dataList;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      d = d.filter(i =>
        i.tanggalPencairan.includes(t) ||
        i.kategori.toLowerCase().includes(t) ||
        i.statusImplementasi.toLowerCase().includes(t)
      );
    }
    if (filterStatus) {
      d = d.filter(i => i.statusImplementasi === filterStatus);
    }
    if (filterPeriode) {
      // filterPeriode format: "MM-YYYY" e.g. "09-2026"
      const [mm, yyyy] = filterPeriode.split('-');
      const targetMonth = parseInt(mm, 10);
      const targetYear = parseInt(yyyy, 10);
      d = d.filter(i => {
        const tgl = (i.tanggalPencairan || '').trim();
        let month = -1, year = -1;
        if (tgl.includes('/')) {
          // Format DD/MM/YYYY
          const parts = tgl.split('/');
          month = parseInt(parts[1], 10);
          year = parseInt(parts[2], 10);
        } else if (tgl.includes('-')) {
          // Format YYYY-MM-DD
          const parts = tgl.split('-');
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        }
        return month === targetMonth && year === targetYear;
      });
    }
    return d;
  }, [dataList, searchTerm, filterStatus, filterPeriode]);

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPeriode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* CRUD handlers */
  const openAdd = () => {
    setFormData({ ...emptyForm });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const jumlah = Number(formData.jumlahDonasi) || 0;
    const alokasi = Number(formData.alokasi) || 0;
    const sisaDonasi = jumlah - alokasi;
    const newItem = await addTransaksiYayasan({
      tanggalPencairan: formData.tanggalPencairan || new Date().toLocaleDateString('id-ID'),
      linkDonasi: formData.linkDonasi || 'https://kitabisa.com/',
      jumlahDonasi: jumlah,
      kategori: formData.kategori,
      alokasi: alokasi,
      sisaDonasi: sisaDonasi,
      statusImplementasi: formData.statusImplementasi,
      linkImplementasi: formData.linkImplementasi,
    });
    setDataList((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setCurrentPage(1);
  };

  const openEdit = (item: TransaksiItem) => {
    setEditingItem(item);
    setFormData({
      tanggalPencairan: item.tanggalPencairan,
      linkDonasi: item.linkDonasi,
      jumlahDonasi: String(item.jumlahDonasi),
      kategori: item.kategori,
      alokasi: String(item.alokasi),
      sisaDonasi: String(item.sisaDonasi),
      statusImplementasi: item.statusImplementasi,
      linkImplementasi: item.linkImplementasi,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const jumlah = Number(formData.jumlahDonasi) || 0;
    const alokasi = Number(formData.alokasi) || 0;
    const sisaDonasi = jumlah - alokasi;
    const updated: TransaksiItem = {
      ...editingItem,
      tanggalPencairan: formData.tanggalPencairan,
      linkDonasi: formData.linkDonasi,
      jumlahDonasi: jumlah,
      kategori: formData.kategori,
      alokasi: alokasi,
      sisaDonasi: sisaDonasi,
      statusImplementasi: formData.statusImplementasi,
      linkImplementasi: formData.linkImplementasi,
    };
    await updateTransaksiYayasan(updated);
    setDataList((prev) => prev.map(i => (i.id === editingItem.id ? updated : i)));
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    await deleteTransaksiYayasan(deletingItem.id);
    setDataList((prev) => prev.filter(i => i.id !== deletingItem.id));
    setDeletingItem(null);
    if (currentPage > 1 && pagedData.length === 1) setCurrentPage(p => p - 1);
  };

  const form = (onSubmit: (e: React.FormEvent) => void, title: string, submitLabel: string, onClose: () => void) => (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tanggal Pencairan</label>
                <input type="text" required placeholder="DD/MM/YYYY" value={formData.tanggalPencairan}
                  onChange={e => setFormData({ ...formData, tanggalPencairan: e.target.value })} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Kategori</label>
                <select value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })} className={styles.select}>
                  {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Link Donasi</label>
              <input type="text" placeholder="https://kitabisa.com/..." value={formData.linkDonasi}
                onChange={e => setFormData({ ...formData, linkDonasi: e.target.value })} className={styles.input} />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Jumlah Donasi (Rp)</label>
                <input type="number" required min="0" placeholder="0" value={formData.jumlahDonasi}
                  onChange={e => setFormData({ ...formData, jumlahDonasi: e.target.value })} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Alokasi (Rp)</label>
                <input type="number" min="0" placeholder="0" value={formData.alokasi}
                  onChange={e => setFormData({ ...formData, alokasi: e.target.value })} className={styles.input} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Status Implementasi</label>
              <select
                value={formData.statusImplementasi}
                onChange={e => {
                  const status = e.target.value as TransaksiItem['statusImplementasi'];
                  setFormData({ ...formData, statusImplementasi: status });
                }}
                className={styles.select}
              >
                <option value="Sudah Implementasi">Sudah Implementasi</option>
                <option value="Belum Implementasi">Belum Implementasi</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Batal</button>
            <button type="submit" className={styles.submitBtn}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* ── Top Header Bar ── */}
      <div className={styles.topHeader}>
        <div className={styles.topSearchWrap}>
          <SearchIcon />
          <input type="text" placeholder="Cari transaksi, tanggal, atau link donasi..."
            className={styles.topSearchInput} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className={styles.topRightActions}>
          <AdminProfileDropdown profile={userProfile} />
        </div>
      </div>

      {/* ── Section Title ── */}
      <div className={styles.titleSection}>
        <div className={styles.sectionTag}>TRANSAKSI YAYASAN</div>
        <h1 className={styles.mainTitle}>Transaksi Yayasan</h1>
        <p className={styles.mainSubtitle}>Kelola dan pantau seluruh transaksi dana yayasan secara transparan.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconCircle} ${styles.iconCircleBlue}`}>
            <ArrowDownIcon />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statTitle}>Total Jumlah Donasi</div>
            <div className={styles.statValue}>{formatRupiah(totalDanaMasuk)}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconCircle} ${styles.iconCircleRed}`}>
            <ArrowUpIcon />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statTitle}>Total Alokasi</div>
            <div className={styles.statValue}>{formatRupiah(totalImplementasi)}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconCircle} ${styles.iconCircleYellow}`}>
            <WalletIcon />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statTitle}>Sisa Implementasi</div>
            <div className={styles.statValue}>{formatRupiah(sisaTotal)}</div>
          </div>
        </div>
      </div>

      {/* ── Filter Row ── */}
      <div className={styles.filterRow}>
        <div className={styles.filterLeft}>
          <select className={styles.selectFilter} value={filterPeriode} onChange={e => { setFilterPeriode(e.target.value); setCurrentPage(1); }}>
            <option value="">Semua Periode</option>
            <option value="01-2026">Januari 2026</option>
            <option value="02-2026">Februari 2026</option>
            <option value="03-2026">Maret 2026</option>
            <option value="04-2026">April 2026</option>
            <option value="05-2026">Mei 2026</option>
            <option value="06-2026">Juni 2026</option>
            <option value="07-2026">Juli 2026</option>
            <option value="08-2026">Agustus 2026</option>
            <option value="09-2026">September 2026</option>
            <option value="10-2026">Oktober 2026</option>
            <option value="11-2026">November 2026</option>
            <option value="12-2026">Desember 2026</option>
          </select>
          <select className={styles.selectFilter} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">Semua Status</option>
            <option value="Sudah Implementasi">Sudah Implementasi</option>
            <option value="Belum Implementasi">Belum Implementasi</option>
          </select>
        </div>
        <div className={styles.filterRight}>
          <button className={styles.addBtn} onClick={openAdd}>
            <PlusIcon />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colNo}>No.</th>
              <th>Tanggal Pencairan</th>
              <th>Link Donasi</th>
              <th>Jumlah Donasi</th>
              <th>Kategori</th>
              <th>Alokasi</th>
              <th>Sisa Implementasi</th>
              <th>Status Implementasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Tidak ada transaksi yang ditemukan.
                </td>
              </tr>
            ) : (
              pagedData.map((item, index) => {
                const alokasiVal = getItemAlokasi(item);
                const sisaVal = (item.jumlahDonasi || 0) - alokasiVal;
                const isSudah = item.statusImplementasi === 'Sudah Implementasi';
                const statusText = isSudah ? 'Sudah Implementasi' : 'Belum Implementasi';

                return (
                  <tr key={item.id}>
                    <td className={styles.colNo}>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className={styles.colDate}>{item.tanggalPencairan}</td>
                    <td>
                      <a href={sanitizeUrl(item.linkDonasi)} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                        <ExternalLinkIcon /> <span>Lihat</span>
                      </a>
                    </td>
                    <td className={styles.colAmount}>{formatRupiah(item.jumlahDonasi)}</td>
                    <td>
                      <span className={styles.categoryBadge}>{item.kategori}</span>
                    </td>
                    <td className={styles.colAlokasi}>{formatRupiah(alokasiVal)}</td>
                    <td className={styles.colSisa}>{formatRupiah(sisaVal)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${isSudah ? styles.statusSudah : styles.statusBelum}`}>
                        <span className={styles.statusDot} />
                        {statusText}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={`${styles.actionIconBtn} ${styles.btnEdit}`} title="Edit" onClick={() => openEdit(item)}>
                          <EditIcon />
                        </button>
                        <button className={`${styles.actionIconBtn} ${styles.btnDelete}`} title="Hapus" onClick={() => setDeletingItem(item)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        <div className={styles.tableFooter}>
          <div className={styles.footerInfo}>
            Menampilkan {totalCount === 0 ? 1 : (currentPage - 1) * ITEMS_PER_PAGE + 1} - {totalCount === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} dari {totalCount} transaksi
          </div>
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
            <button className={styles.pageBtn} disabled={currentPage >= totalPages || totalCount === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
          </div>
        </div>
      </div>

      {/* ── Modal Tambah ── */}
      {isAddModalOpen && form(handleSaveAdd, 'Tambah Transaksi', 'Simpan Transaksi', () => setIsAddModalOpen(false))}

      {/* ── Modal Edit ── */}
      {editingItem && form(handleSaveEdit, 'Edit Transaksi', 'Perbarui Transaksi', () => setEditingItem(null))}

      {/* ── Modal Hapus ── */}
      {deletingItem && (
        <div className={styles.modalOverlay} onClick={() => setDeletingItem(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Hapus Transaksi</h3>
              <button className={styles.closeBtn} onClick={() => setDeletingItem(null)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteConfirmText}>
                Apakah Anda yakin ingin menghapus transaksi tanggal <strong>{deletingItem.tanggalPencairan}</strong> dengan jumlah <strong>{formatRupiah(deletingItem.jumlahDonasi)}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeletingItem(null)}>Batal</button>
              <button className={styles.dangerBtn} onClick={handleConfirmDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail ── */}
      {viewingItem && (
        <div className={styles.modalOverlay} onClick={() => setViewingItem(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Detail Transaksi</h3>
              <button className={styles.closeBtn} onClick={() => setViewingItem(null)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {[
                ['Tanggal Pencairan', viewingItem.tanggalPencairan],
                ['Kategori', viewingItem.kategori],
                ['Jumlah Donasi', formatRupiah(viewingItem.jumlahDonasi)],
                ['Alokasi', formatRupiah(viewingItem.alokasi)],
                ['Sisa Implementasi', formatRupiah(viewingItem.sisaDonasi)],
                ['Status', viewingItem.statusImplementasi],
              ].map(([label, val]) => (
                <div key={label} className={styles.detailRow}>
                  <span className={styles.detailLabel}>{label}</span>
                  <span className={styles.detailVal}>{val}</span>
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setViewingItem(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

