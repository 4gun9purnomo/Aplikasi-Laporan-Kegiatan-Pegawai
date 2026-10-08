import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generatePDFReport } from '../../services/pdfExport';
import { exportReportsToExcel } from '../../services/excelExport';
import { addStoredLog } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { X, FileDown, FileSpreadsheet, Loader2, Calendar } from 'lucide-react';

interface AdminExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminExportModal: React.FC<AdminExportModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { reports, users, settings, showToast } = useApp();

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [selectedUser, setSelectedUser] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (r.status === 'Deleted') return false;
    const matchesUser = selectedUser === 'all' || r.user_id === selectedUser;
    const matchesDate = r.tanggal_kegiatan >= startDate && r.tanggal_kegiatan <= endDate;
    return matchesUser && matchesDate;
  });

  const handleExport = async () => {
    if (filteredReports.length === 0) {
      showToast('Tidak ada data laporan pada filter periode yang dipilih.', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const selectedUserObj = users.find((u) => u.id === selectedUser);
      const filterLabel = selectedUserObj ? selectedUserObj.nama : 'Semua Pegawai';

      if (exportType === 'excel') {
        exportReportsToExcel({
          reports: filteredReports,
          startDate,
          endDate,
          settings,
          filterLabel,
        });

        if (currentUser) {
          addStoredLog({
            user_id: currentUser.id,
            username: currentUser.username,
            nama: currentUser.nama,
            aktivitas: `Ekspor Excel Rekapitulasi Laporan (${filteredReports.length} baris)`,
          });
        }
        showToast('Rekapitulasi Excel (.xlsx) berhasil diunduh.', 'success');
      } else {
        await generatePDFReport({
          reports: filteredReports,
          startDate,
          endDate,
          settings,
          user: selectedUserObj,
          titleSuffix: selectedUser === 'all' ? '(Semua Pegawai)' : `(${selectedUserObj?.nama})`,
        });

        if (currentUser) {
          addStoredLog({
            user_id: currentUser.id,
            username: currentUser.username,
            nama: currentUser.nama,
            aktivitas: `Ekspor PDF Rekapitulasi Laporan (${filteredReports.length} baris)`,
          });
        }
        showToast('Dokumen PDF berhasil dibuat dan diunduh.', 'success');
      }

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekspor data';
      showToast(msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ekspor Rekap Laporan Pengelola
              </h3>
              <p className="text-[11px] text-slate-500">
                Unduh rekap data kegiatan seluruh ASN STABN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Format Selection (PRD Section 27: PDF vs Excel) */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilihan Format Berkas (PRD Bagian 27)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportType('excel')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${
                  exportType === 'excel'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="font-bold text-xs">Ekspor Excel (.xlsx)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Disarankan untuk rekap & olah data
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('pdf')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition ${
                  exportType === 'pdf'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileDown className="w-6 h-6 text-amber-600 mb-1" />
                <span className="font-bold text-xs">Ekspor PDF (.pdf)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Format resmi ber-KOP surat
                </span>
              </button>
            </div>
          </div>

          {/* Pegawai Filter */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Filter Pegawai
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
            >
              <option value="all">Semua Pegawai ({users.length} ASN)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.nip})
                </option>
              ))}
            </select>
          </div>

          {/* Periode Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Awal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Info bar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Total Data Sesuai Kriteria:</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              {filteredReports.length} kegiatan
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredReports.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition disabled:opacity-50 active:scale-95 ${
              exportType === 'excel'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Unduhan...</span>
              </>
            ) : (
              <>
                {exportType === 'excel' ? (
                  <FileSpreadsheet className="w-4 h-4" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>Unduh {exportType.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
