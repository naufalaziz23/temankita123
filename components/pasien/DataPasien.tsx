'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  getPasienList,
  addPasien,
  updatePasien,
  deletePasien,
  subscribeToDatabaseChanges,
  getUserProfile,
  sanitizeUrl,
  PasienData,
  UserProfileData,
} from '@/lib/supabase/services';
import AdminProfileDropdown from '@/components/common/AdminProfileDropdown';
import styles from './DataPasien.module.css';

/* ── Interfaces ── */
export type PenerimaPasien = PasienData;

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

function UsersGroupIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

export default function DataPasien() {
  const [dataList, setDataList] = useState<PenerimaPasien[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPasien = useCallback(async () => {
    try {
      const list = await getPasienList();
      setDataList(list);
      setTotalCount(list.length);
    } catch (e) {
      console.error('Error fetching pasien:', e);
    }
  }, []);

  useEffect(() => {
    fetchPasien();
    const unsub = subscribeToDatabaseChanges(() => {
      fetchPasien();
    });
    return () => {
      unsub();
    };
  }, [fetchPasien]);

  const pasienBaruCount = useMemo(() => {
    if (dataList.length === 0) return 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return dataList.filter((item) => {
      if (!item.tanggalInput) return false;
      const d = new Date(item.tanggalInput);
      if (!isNaN(d.getTime())) {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      return false;
    }).length;
  }, [dataList]);

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
    const load = async () => {
      try {
        const p = await getUserProfile();
        if (isMounted) setUserProfile(p);
      } catch (err) {
        console.error(err);
      }
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener('user-profile-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('user-profile-updated', handleUpdate);
    };
  }, []);

  /* Modal States */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<PenerimaPasien | null>(null);
  const [editingItem, setEditingItem] = useState<PenerimaPasien | null>(null);
  const [deletingItem, setDeletingItem] = useState<PenerimaPasien | null>(null);

  /* Form state for Add/Edit */
  const [formData, setFormData] = useState({
    nama: '',
    usia: '',
    alamat: '',
    telepon: '',
    linkKitaBisa: '',
    tanggalInput: '7 Okt 2024',
  });

  /* Real-time filtering */
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataList;
    const term = searchTerm.toLowerCase();
    return dataList.filter(
      (item) =>
        item.nama.toLowerCase().includes(term) ||
        item.alamat.toLowerCase().includes(term) ||
        item.telepon.includes(term)
    );
  }, [dataList, searchTerm]);

  /* Pagination logic */
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const startRecord = filteredCount === 0 ? 1 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = filteredCount === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, filteredCount);

  /* CRUD Handlers */
  const handleOpenAddModal = () => {
    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    setFormData({
      nama: '',
      usia: '',
      alamat: '',
      telepon: '',
      linkKitaBisa: '',
      tanggalInput: todayStr,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    const newItem = await addPasien({
      nama: formData.nama,
      usia: Number(formData.usia) || 30,
      alamat: formData.alamat || 'Sleman, Yogyakarta',
      telepon: formData.telepon || '0812 0000 0000',
      linkKitaBisa: formData.linkKitaBisa || 'https://kitabisa.com/',
      tanggalInput: formData.tanggalInput || new Date().toLocaleDateString('id-ID'),
    });

    setDataList((prev) => [newItem, ...prev]);
    setTotalCount((prev) => prev + 1);
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (item: PenerimaPasien) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama,
      usia: String(item.usia),
      alamat: item.alamat,
      telepon: item.telepon,
      linkKitaBisa: item.linkKitaBisa,
      tanggalInput: item.tanggalInput,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedItem: PenerimaPasien = {
      ...editingItem,
      nama: formData.nama,
      usia: Number(formData.usia) || editingItem.usia,
      alamat: formData.alamat,
      telepon: formData.telepon,
      linkKitaBisa: formData.linkKitaBisa,
      tanggalInput: formData.tanggalInput,
    };

    await updatePasien(updatedItem);
    setDataList((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    await deletePasien(deletingItem.id);
    setDataList((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    setDeletingItem(null);
  };

  return (
    <div className={styles.container}>
      {/* ── Top Header Bar ── */}
      <div className={styles.topHeader}>
        <div className={styles.topSearchWrap}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Cari data, laporan, atau apapun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.topSearchInput}
          />
        </div>

        <div className={styles.topRightActions}>
          <AdminProfileDropdown profile={userProfile} />
        </div>
      </div>

      {/* ── Section Title Header ── */}
      <div className={styles.titleSection}>
        <div className={styles.sectionTag}>DATA PASIEN</div>
        <h1 className={styles.mainTitle}>Data Pasien</h1>
        <p className={styles.mainSubtitle}>
          Kelola dan pantau data penerima bantuan yayasan UNTUK TEMAN.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statGrid}>
        {/* Card 1: Total Pasien */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.iconCircle} ${styles.iconCircleBlue}`}>
              <UsersGroupIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statTitle}>Total Pasien</div>
              <div className={styles.statValueRow}>
                <div className={styles.statValue}>{totalCount}</div>
              </div>
            </div>
          </div>
          <button className={styles.moreBtn}>•••</button>
        </div>

        {/* Card 2: Pasien Baru */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.iconCircle} ${styles.iconCircleYellow}`}>
              <UserPlusIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statTitle}>Pasien Baru</div>
              <div className={styles.statValueRow}>
                <div className={styles.statValue}>{pasienBaruCount}</div>
              </div>
            </div>
          </div>
          <button className={styles.moreBtn}>•••</button>
        </div>

        {/* Card 3: Data Terupdate */}
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.iconCircle} ${styles.iconCircleDoc}`}>
              <FileTextIcon />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statTitle}>Data Terupdate</div>
              <div className={styles.statValueRow}>
                <div className={styles.statValueText}>Hari ini</div>
              </div>
              <div className={styles.statSubtext}>{totalCount} pasien</div>
            </div>
          </div>
          <button className={styles.moreBtn}>•••</button>
        </div>
      </div>

      {/* ── Filter & Search Action Bar ── */}
      <div className={styles.tableActionRow}>
        <div className={styles.searchFilterGroup}>
          <div className={styles.tableSearchBox}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Cari nama pasien, nomor telepon, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.tableSearchInput}
            />
          </div>


        </div>

        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          <PlusIcon />
          <span>Tambah Data Pasien</span>
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colNo}>No.</th>
              <th>Nama Pasien</th>
              <th>Usia</th>
              <th>Alamat</th>
              <th>Nomor Telepon</th>
              <th>Link Kita Bisa</th>
              <th>Tanggal Input</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Tidak ada data pasien yang ditemukan.
                </td>
              </tr>
            ) : (
              pagedData.map((item, index) => {
                const itemIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                return (
                  <tr key={item.id}>
                    <td className={styles.colNo}>{itemIndex}</td>
                    <td className={styles.colNama}>{item.nama}</td>
                    <td className={styles.colUsia}>{item.usia}</td>
                    <td className={styles.colAlamat}>{item.alamat}</td>
                    <td className={styles.colPhone}>{item.telepon}</td>
                    <td>
                      <a
                        href={sanitizeUrl(item.linkKitaBisa)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkBtn}
                      >
                        <ExternalLinkIcon />
                        <span>Lihat</span>
                      </a>
                    </td>
                    <td className={styles.colTanggal}>{item.tanggalInput}</td>
                    <td className={styles.actionsCell}>
                      <button
                        className={`${styles.actionIconBtn} ${styles.btnView}`}
                        title="Lihat Detail"
                        onClick={() => setViewingItem(item)}
                      >
                        <EyeIcon />
                      </button>
                      <button
                        className={`${styles.actionIconBtn} ${styles.btnEdit}`}
                        title="Edit Data"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className={`${styles.actionIconBtn} ${styles.btnDelete}`}
                        title="Hapus Data"
                        onClick={() => setDeletingItem(item)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Table Footer & Pagination ── */}
        <div className={styles.tableFooter}>
          <div className={styles.footerInfo}>
            Menampilkan {startRecord} - {endRecord} dari {filteredCount} data pasien
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage >= totalPages || filteredCount === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── Page Bottom Quote ── */}
      <div className={styles.pageBottomNote}>
        <span className={styles.quoteText}>
          &ldquo;Data hari ini, untuk masa depan yang lebih baik.&rdquo;
        </span>
        <span className={styles.brandNote}>
          UNTUK TEMAN &bull; Membantu lebih banyak, bersama.
        </span>
      </div>

      {/* ── Modal Tambah Data Pasien ── */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tambah Data Pasien</h3>
              <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Pasien / Penerima</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Usia</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 45"
                      value={formData.usia}
                      onChange={(e) => setFormData({ ...formData, usia: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tanggal Input</label>
                    <input
                      type="text"
                      placeholder="7 Okt 2024"
                      value={formData.tanggalInput}
                      onChange={(e) => setFormData({ ...formData, tanggalInput: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Alamat</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sleman, Yogyakarta"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812 3456 7890"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Link Kita Bisa</label>
                  <input
                    type="text"
                    placeholder="https://kitabisa.com/bantuan-..."
                    value={formData.linkKitaBisa}
                    onChange={(e) => setFormData({ ...formData, linkKitaBisa: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Edit Data ── */}
      {editingItem && (
        <div className={styles.modalOverlay} onClick={() => setEditingItem(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Data Pasien</h3>
              <button className={styles.closeBtn} onClick={() => setEditingItem(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Pasien / Penerima</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Usia</label>
                    <input
                      type="number"
                      required
                      value={formData.usia}
                      onChange={(e) => setFormData({ ...formData, usia: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tanggal Input</label>
                    <input
                      type="text"
                      value={formData.tanggalInput}
                      onChange={(e) => setFormData({ ...formData, tanggalInput: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Alamat</label>
                  <input
                    type="text"
                    required
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Link Kita Bisa</label>
                  <input
                    type="text"
                    value={formData.linkKitaBisa}
                    onChange={(e) => setFormData({ ...formData, linkKitaBisa: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setEditingItem(null)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal View Detail ── */}
      {viewingItem && (
        <div className={styles.modalOverlay} onClick={() => setViewingItem(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Detail Data Pasien</h3>
              <button className={styles.closeBtn} onClick={() => setViewingItem(null)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nama Pasien:</span>
                <span className={styles.detailVal}>{viewingItem.nama}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Usia:</span>
                <span className={styles.detailVal}>{viewingItem.usia} Tahun</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Alamat:</span>
                <span className={styles.detailVal}>{viewingItem.alamat}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nomor Telepon:</span>
                <span className={styles.detailVal}>{viewingItem.telepon}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Link Kita Bisa:</span>
                <a
                  href={sanitizeUrl(viewingItem.linkKitaBisa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                >
                  {viewingItem.linkKitaBisa}
                </a>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Tanggal Input:</span>
                <span className={styles.detailVal}>{viewingItem.tanggalInput}</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setViewingItem(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Delete Confirmation ── */}
      {deletingItem && (
        <div className={styles.modalOverlay} onClick={() => setDeletingItem(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Konfirmasi Hapus</h3>
              <button className={styles.closeBtn} onClick={() => setDeletingItem(null)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteConfirmText}>
                Apakah Anda yakin ingin menghapus data pasien atas nama{' '}
                <strong>{deletingItem.nama}</strong>? Data yang telah dihapus tidak dapat dikembalikan.
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
