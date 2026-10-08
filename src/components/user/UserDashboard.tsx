import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LaporanKegiatan } from '../../types';
import { formatDateIndonesian } from '../../services/pdfExport';
import {
  PlusCircle,
  FileText,
  CalendarCheck,
  CalendarDays,
  FileCheck2,
  Eye,
  FileDown,
  Building2,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';

interface UserDashboardProps {
  onOpenCreateReport: () => void;
  onOpenExportModal: () => void;
  onViewAllReports: () => void;
  onViewDetail: (report: LaporanKegiatan) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenCreateReport,
  onOpenExportModal,
  onViewAllReports,
  onViewDetail,
}) => {
  const { currentUser } = useAuth();
  const { reports } = useApp();

  if (!currentUser) return null;

  // Filter reports of current user
  const myReports = useMemo(() => {
    return reports.filter((r) => r.user_id === currentUser.id && r.status !== 'Deleted');
  }, [reports, currentUser]);

  // Calculate statistics (PRD Section 13)
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  const reportsToday = useMemo(() => {
    return myReports.filter((r) => r.tanggal_kegiatan === todayStr).length;
  }, [myReports, todayStr]);

  const reportsMonth = useMemo(() => {
    return myReports.filter((r) => r.tanggal_kegiatan.startsWith(currentMonthPrefix)).length;
  }, [myReports, currentMonthPrefix]);

  const totalReports = myReports.length;

  // Latest 5 reports
  const latestReports = useMemo(() => {
    return [...myReports]
      .sort((a, b) => b.tanggal_kegiatan.localeCompare(a.tanggal_kegiatan) || b.created_at.localeCompare(a.created_at))
      .slice(0, 5);
  }, [myReports]);

  return (
    <div className="space-y-5">
      {/* Profil Card (PRD Section 13 & 36) */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative motif */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <img src="/logo.svg" alt="" className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl text-amber-200 shrink-0 shadow-inner">
              {currentUser.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-amber-200 font-bold">
                  Pegawai STABN Raden Wijaya
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-amber-200" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {currentUser.nama}
              </h1>
              <p className="text-xs text-amber-100 font-medium mt-0.5">
                NIP: {currentUser.nip}
              </p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {currentUser.jabatan} • {currentUser.unit_kerja}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl text-xs font-semibold text-white transition backdrop-blur-sm"
              title="Ekspor PDF Pribadi"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistik Utama (PRD Section 13: Laporan Hari Ini, Bulan Ini, Total) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Hari ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hari Ini
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums leading-none">
              {reportsToday}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">kegiatan tercatat</p>
          </div>
        </div>

        {/* Bulan ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Bulan Ini
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums leading-none">
              {reportsMonth}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">bulan berjalan</p>
          </div>
        </div>

        {/* Total Laporan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums leading-none">
              {totalReports}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">akumulasi total</p>
          </div>
        </div>
      </div>

      {/* Tombol Utama: + BUAT LAPORAN (PRD Section 13, 14, 35: dibuat paling menonjol) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Laporkan Pekerjaan Harian Anda
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dapat mengisi berkali-kali dalam sehari dengan bukti foto kegiatan terlampir.
            </p>
          </div>

          <button
            onClick={onOpenCreateReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-amber-600/25 transition text-sm tracking-wide"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            <span>+ BUAT LAPORAN</span>
          </button>
        </div>
      </div>

      {/* Riwayat Laporan Terbaru (PRD Section 13 & 36) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Riwayat Laporan Terbaru
            </h3>
          </div>
          {myReports.length > 5 && (
            <button
              onClick={onViewAllReports}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline"
            >
              Lihat Semua ({myReports.length})
            </button>
          )}
        </div>

        {latestReports.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-400">Belum ada laporan kegiatan yang dikirim.</p>
            <button
              onClick={onOpenCreateReport}
              className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Mulai Buat Laporan Pertama</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {latestReports.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewDetail(item)}
                className="p-3.5 sm:px-5 hover:bg-amber-50/40 cursor-pointer transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      {formatDateIndonesian(item.tanggal_kegiatan)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {item.indikator_kode}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                      Terkirim
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.indikator_nama}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.uraian}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {item.foto.length} foto
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(item);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
