import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Target,
  TrendingUp,
  FileText,
  FileDown,
  BarChart3,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { formatDateIndonesian } from '../../services/pdfExport';

interface AdminDashboardProps {
  onNavigate: (tab: 'monitoring' | 'users' | 'indicators' | 'settings' | 'logs') => void;
  onOpenExportModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenExportModal,
}) => {
  const { users, indicators, reports } = useApp();

  const activeReports = useMemo(() => {
    return reports.filter((r) => r.status !== 'Deleted');
  }, [reports]);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);

  // Statistics (PRD Section 8)
  const totalUsers = users.length;
  const reportsToday = activeReports.filter((r) => r.tanggal_kegiatan === todayStr).length;
  const reportsMonth = activeReports.filter((r) => r.tanggal_kegiatan.startsWith(currentMonth)).length;
  const totalIndicators = indicators.length;

  // Top reporting employees
  const employeeReportCounts = useMemo(() => {
    const counts: Record<string, { user: string; nip: string; count: number; unit: string }> = {};
    activeReports.forEach((r) => {
      if (!counts[r.user_id]) {
        counts[r.user_id] = {
          user: r.nama,
          nip: r.nip,
          count: 0,
          unit: r.unit_kerja,
        };
      }
      counts[r.user_id].count += 1;
    });

    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [activeReports]);

  // Indicator breakdown
  const indicatorCounts = useMemo(() => {
    const counts: Record<string, { kode: string; nama: string; count: number }> = {};
    activeReports.forEach((r) => {
      const key = r.indikator_kode || 'Lainnya';
      if (!counts[key]) {
        counts[key] = { kode: key, nama: r.indikator_nama, count: 0 };
      }
      counts[key].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [activeReports]);

  // Daily report counts for recent 7 days
  const recentDays = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const dayCount = activeReports.filter((r) => r.tanggal_kegiatan === str).length;
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      days.push({ date: str, label: dayName, count: dayCount });
    }
    return days;
  }, [activeReports]);

  const maxDailyCount = Math.max(...recentDays.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Portal Pengelola & Monitoring
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Ringkasan Kinerja Harian Pegawai STABN Raden Wijaya
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dokumentasi tugas dan verifikasi ketercapaian indikator kinerja ASN.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('monitoring')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
          >
            <FileText className="w-4 h-4" />
            <span>Monitoring Laporan</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
          >
            <FileDown className="w-4 h-4 text-amber-800" />
            <span>Ekspor Data</span>
          </button>
        </div>
      </div>

      {/* Statistik Utama (PRD Section 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pengguna */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pengguna
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalUsers}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Pegawai terdaftar</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          </p>
        </div>

        {/* Laporan Hari Ini */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Laporan Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {reportsToday}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Kegiatan hari ini</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          </p>
        </div>

        {/* Laporan Bulan Ini */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Laporan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {reportsMonth}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Bulan berjalan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          </p>
        </div>

        {/* Indikator Kinerja */}
        <div
          onClick={() => onNavigate('indicators')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Indikator Kinerja
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-110 transition">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalIndicators}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Tolak ukur aktif</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid (PRD Section 8: Grafik laporan per hari, per pegawai, per indikator) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tren Laporan 7 Hari Terakhir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Tren Laporan 7 Hari Terakhir
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Total Harian</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {recentDays.map((d) => {
              const heightPercent = Math.max(Math.round((d.count / maxDailyCount) * 100), 8);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-700">
                    {d.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-amber-500 hover:bg-amber-600 transition rounded-t-lg"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 text-center truncate w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pegawai Paling Aktif Melaporkan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Pegawai Dengan Laporan Terbanyak
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Peringkat Aktivitas</span>
          </div>

          <div className="space-y-3">
            {employeeReportCounts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada data laporan.</p>
            ) : (
              employeeReportCounts.map((emp, idx) => (
                <div
                  key={emp.nip}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                          ? 'bg-slate-400 text-white'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{emp.user}</p>
                      <p className="text-[11px] text-slate-500 truncate">{emp.unit}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="font-bold text-amber-800 text-sm">{emp.count}</span>
                    <span className="text-[10px] text-slate-400 ml-1">kegiatan</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Laporan Berdasarkan Indikator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Distribusi Laporan Berdasarkan Indikator Kinerja
              </h3>
            </div>
            <button
              onClick={() => onNavigate('indicators')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline"
            >
              Kelola Indikator
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {indicatorCounts.map((ind) => (
              <div
                key={ind.kode}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-amber-800 text-xs bg-amber-100/70 px-1.5 py-0.5 rounded">
                    {ind.kode}
                  </span>
                  <p className="font-semibold text-xs text-slate-800 mt-1.5 line-clamp-2">
                    {ind.nama}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tercatat:</span>
                  <span className="font-bold font-mono text-slate-900">{ind.count} laporan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
