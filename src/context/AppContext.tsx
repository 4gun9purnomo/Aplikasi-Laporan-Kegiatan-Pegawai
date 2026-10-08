import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  IndikatorKinerja,
  LaporanKegiatan,
  ActivityLog,
  SystemSettings,
  FotoLaporan,
} from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredIndicators,
  saveStoredIndicators,
  getStoredReports,
  saveStoredReports,
  getStoredLogs,
  addStoredLog,
  getStoredSettings,
  saveStoredSettings,
  generateReportNumber,
} from '../services/storage';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface AppContextType {
  users: User[];
  indicators: IndikatorKinerja[];
  reports: LaporanKegiatan[];
  logs: ActivityLog[];
  settings: SystemSettings;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;

  // Report operations
  createReport: (data: {
    tanggal_kegiatan: string;
    indikator_id: string;
    uraian: string;
    foto: FotoLaporan[];
  }) => Promise<{ success: boolean; report?: LaporanKegiatan; message?: string }>;
  updateReport: (
    reportId: string,
    data: {
      tanggal_kegiatan: string;
      indikator_id: string;
      uraian: string;
      foto: FotoLaporan[];
    }
  ) => Promise<{ success: boolean; message?: string }>;
  deleteReport: (reportId: string) => Promise<{ success: boolean; message?: string }>;

  // Indicator operations
  createIndicator: (data: Omit<IndikatorKinerja, 'id' | 'created_at' | 'updated_at'>) => void;
  updateIndicator: (id: string, data: Partial<IndikatorKinerja>) => void;
  toggleIndicatorStatus: (id: string) => void;

  // User operations
  createUser: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  resetUserPassword: (id: string, newPassword: string) => void;
  toggleUserStatus: (id: string) => void;

  // Settings operations
  updateSettings: (newSettings: SystemSettings) => void;

  // Refresh
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const [indicators, setIndicators] = useState<IndikatorKinerja[]>(getStoredIndicators);
  const [reports, setReports] = useState<LaporanKegiatan[]>(getStoredReports);
  const [logs, setLogs] = useState<ActivityLog[]>(getStoredLogs);
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshData = () => {
    setUsers(getStoredUsers());
    setIndicators(getStoredIndicators());
    setReports(getStoredReports());
    setLogs(getStoredLogs());
    setSettings(getStoredSettings());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Report creation
  const createReport = async (data: {
    tanggal_kegiatan: string;
    indikator_id: string;
    uraian: string;
    foto: FotoLaporan[];
  }): Promise<{ success: boolean; report?: LaporanKegiatan; message?: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const selectedIndicator = indicators.find((i) => i.id === data.indikator_id);
    if (!selectedIndicator) {
      return { success: false, message: 'Silakan pilih indikator kinerja yang valid.' };
    }

    if (!selectedIndicator.status) {
      return { success: false, message: 'Indikator kinerja yang dipilih sudah tidak aktif.' };
    }

    if (!data.tanggal_kegiatan) {
      return { success: false, message: 'Tanggal kegiatan wajib diisi.' };
    }

    if (!data.uraian || data.uraian.trim().length < settings.min_uraian_length) {
      return {
        success: false,
        message: `Uraian kegiatan minimal ${settings.min_uraian_length} karakter dan tidak boleh hanya spasi.`,
      };
    }

    if (data.foto.length > settings.max_photos) {
      return {
        success: false,
        message: `Maksimal ${settings.max_photos} foto untuk setiap laporan.`,
      };
    }

    const nomorLaporan = generateReportNumber(data.tanggal_kegiatan);
    const newReport: LaporanKegiatan = {
      id: `lap_${Date.now()}`,
      nomor_laporan: nomorLaporan,
      user_id: currentUser.id,
      nip: currentUser.nip,
      nama: currentUser.nama,
      jabatan: currentUser.jabatan,
      unit_kerja: currentUser.unit_kerja,
      indikator_id: selectedIndicator.id,
      indikator_kode: selectedIndicator.kode,
      indikator_nama: selectedIndicator.nama,
      tanggal_kegiatan: data.tanggal_kegiatan,
      uraian: data.uraian.trim(),
      status: 'Terkirim',
      foto: data.foto.map((f, idx) => ({
        ...f,
        urutan: idx + 1,
        laporan_id: nomorLaporan,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    saveStoredReports(updatedReports);

    // Add log
    addStoredLog({
      user_id: currentUser.id,
      username: currentUser.username,
      nama: currentUser.nama,
      aktivitas: `Membuat laporan baru (${nomorLaporan})`,
      reference_id: newReport.id,
    });
    setLogs(getStoredLogs());

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#ca8a04', '#0284c7', '#16a34a', '#e11d48'],
      });
    } catch {
      // ignore
    }

    showToast(`Laporan ${nomorLaporan} berhasil dikirim!`, 'success', 'Berhasil Dikirim');
    return { success: true, report: newReport };
  };

  const updateReport = async (
    reportId: string,
    data: {
      tanggal_kegiatan: string;
      indikator_id: string;
      uraian: string;
      foto: FotoLaporan[];
    }
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const selectedIndicator = indicators.find((i) => i.id === data.indikator_id);
    if (!selectedIndicator) {
      return { success: false, message: 'Silakan pilih indikator kinerja yang valid.' };
    }

    if (!data.uraian || data.uraian.trim().length < settings.min_uraian_length) {
      return {
        success: false,
        message: `Uraian kegiatan minimal ${settings.min_uraian_length} karakter.`,
      };
    }

    if (data.foto.length > settings.max_photos) {
      return {
        success: false,
        message: `Maksimal ${settings.max_photos} foto untuk setiap laporan.`,
      };
    }

    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          tanggal_kegiatan: data.tanggal_kegiatan,
          indikator_id: selectedIndicator.id,
          indikator_kode: selectedIndicator.kode,
          indikator_nama: selectedIndicator.nama,
          uraian: data.uraian.trim(),
          foto: data.foto.map((f, idx) => ({ ...f, urutan: idx + 1 })),
          updated_at: new Date().toISOString(),
        };
      }
      return r;
    });

    setReports(updatedReports);
    saveStoredReports(updatedReports);

    addStoredLog({
      user_id: currentUser.id,
      username: currentUser.username,
      nama: currentUser.nama,
      aktivitas: `Memperbarui laporan kegiatan (${reportId})`,
      reference_id: reportId,
    });
    setLogs(getStoredLogs());

    showToast('Laporan berhasil diperbarui.', 'success', 'Perubahan Disimpan');
    return { success: true };
  };

  const deleteReport = async (reportId: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'Harap login terlebih dahulu.' };

    const target = reports.find((r) => r.id === reportId);
    if (!target) return { success: false, message: 'Laporan tidak ditemukan.' };

    // Soft delete according to PRD Section 24
    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'Deleted' as const,
          deleted_at: new Date().toISOString(),
        };
      }
      return r;
    });

    setReports(updatedReports);
    saveStoredReports(updatedReports);

    addStoredLog({
      user_id: currentUser.id,
      username: currentUser.username,
      nama: currentUser.nama,
      aktivitas: `Menghapus laporan ${target.nomor_laporan}`,
      reference_id: reportId,
    });
    setLogs(getStoredLogs());

    showToast('Laporan berhasil dihapus.', 'success', 'Laporan Dihapus');
    return { success: true };
  };

  // Indicators
  const createIndicator = (data: Omit<IndikatorKinerja, 'id' | 'created_at' | 'updated_at'>) => {
    const newInd: IndikatorKinerja = {
      ...data,
      id: `ind_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newInd, ...indicators];
    setIndicators(updated);
    saveStoredIndicators(updated);

    if (currentUser) {
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: `Menambah indikator kinerja: ${newInd.kode} - ${newInd.nama}`,
      });
      setLogs(getStoredLogs());
    }
    showToast('Indikator kinerja baru berhasil ditambahkan.', 'success');
  };

  const updateIndicator = (id: string, data: Partial<IndikatorKinerja>) => {
    const updated = indicators.map((ind) => {
      if (ind.id === id) {
        return {
          ...ind,
          ...data,
          updated_at: new Date().toISOString(),
        };
      }
      return ind;
    });
    setIndicators(updated);
    saveStoredIndicators(updated);

    if (currentUser) {
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: `Mengubah indikator kinerja ID ${id}`,
      });
      setLogs(getStoredLogs());
    }
    showToast('Indikator kinerja berhasil diperbarui.', 'success');
  };

  const toggleIndicatorStatus = (id: string) => {
    const updated = indicators.map((ind) => {
      if (ind.id === id) {
        const nextStatus = !ind.status;
        return {
          ...ind,
          status: nextStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return ind;
    });
    setIndicators(updated);
    saveStoredIndicators(updated);
    showToast('Status indikator kinerja berhasil diubah.', 'info');
  };

  // Users
  const createUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const newUser: User = {
      ...data,
      id: `usr_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    saveStoredUsers(updated);

    if (currentUser) {
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: `Membuat akun pegawai baru: ${newUser.nama} (${newUser.nip})`,
      });
      setLogs(getStoredLogs());
    }
    showToast(`Akun pegawai ${newUser.nama} berhasil dibuat.`, 'success');
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          ...data,
          updated_at: new Date().toISOString(),
        };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);

    if (currentUser) {
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: `Memperbarui data pengguna ID ${id}`,
      });
      setLogs(getStoredLogs());
    }
    showToast('Data pegawai berhasil diperbarui.', 'success');
  };

  const resetUserPassword = (id: string, newPassword: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          password_hash: newPassword,
          updated_at: new Date().toISOString(),
        };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);

    if (currentUser) {
      const target = users.find((u) => u.id === id);
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: `Mereset password pengguna: ${target?.nama || id}`,
      });
      setLogs(getStoredLogs());
    }
    showToast('Password pengguna berhasil direset.', 'success');
  };

  const toggleUserStatus = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextStatus = !u.status;
        return {
          ...u,
          status: nextStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);
    showToast('Status akun pengguna berhasil diubah.', 'info');
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    if (currentUser) {
      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: 'Memperbarui pengaturan sistem',
      });
      setLogs(getStoredLogs());
    }
    showToast('Pengaturan sistem berhasil disimpan.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        indicators,
        reports,
        logs,
        settings,
        toasts,
        showToast,
        removeToast,
        createReport,
        updateReport,
        deleteReport,
        createIndicator,
        updateIndicator,
        toggleIndicatorStatus,
        createUser,
        updateUser,
        resetUserPassword,
        toggleUserStatus,
        updateSettings,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
