import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { generatePDFReport } from '../../services/pdfExport';
import { addStoredLog } from '../../services/storage';
import { X, FileDown, Calendar, CheckSquare, Square, Loader2 } from 'lucide-react';

interface UserExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserExportModal: React.FC<UserExportModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { reports, settings, showToast } = useApp();

  // Initial date range: current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [includeThumbnails, setIncludeThumbnails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !currentUser) return null;

  // Filter reports of current user within selected date range
  const userReports = reports.filter((r) => {
    if (r.user_id !== currentUser.id) return false;
    if (r.status === 'Deleted') return false;
    return r.tanggal_kegiatan >= startDate && r.tanggal_kegiatan <= endDate;
  });

  const handleExport = async () => {
    if (userReports.length === 0) {
      showToast('Tidak ada laporan kegiatan pada rentang tanggal yang dipilih.', 'error');
      return;
    }

    try {
      setIsExporting(true);
      await generatePDFReport({
        reports: userReports,
        user: currentUser,
        startDate,
        endDate,
        settings,
        includeThumbnails,
      });

      addStoredLog({
        user_id: currentUser.id,
        username: currentUser.username,
        nama: currentUser.nama,
        aktivitas: `Ekspor PDF Laporan Kegiatan (${userReports.length} kegiatan)`,
      });

      showToast('Laporan PDF berhasil dibuat dan diunduh.', 'success', 'Unduhan Berhasil');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekspor PDF';
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ekspor Laporan ke PDF
              </h3>
              <p className="text-[11px] text-slate-500">
                Cetak berkas resmi format STABN Raden Wijaya
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
        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
            <span className="font-bold text-amber-900 block mb-0.5">Pegawai:</span>
            <span className="text-slate-800">{currentUser.nama} (NIP. {currentUser.nip})</span>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Summary found */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600">Laporan Ditemukan:</span>
            <span className="font-bold text-amber-800 text-sm">{userReports.length} Kegiatan</span>
          </div>

          {/* Thumbnail checkbox (PRD Section 30) */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs select-none">
            <input
              type="checkbox"
              checked={includeThumbnails}
              onChange={(e) => setIncludeThumbnails(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="font-semibold text-slate-800">Sertakan hyperlink foto</span>
              <p className="text-[11px] text-slate-500">
                Hyperlink dapat diklik langsung dari dokumen PDF hasil ekspor
              </p>
            </div>
          </label>
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
            disabled={isExporting || userReports.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-md shadow-amber-600/20 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghasilkan PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>EXPORT PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
