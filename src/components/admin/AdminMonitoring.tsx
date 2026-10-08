import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LaporanKegiatan } from '../../types';
import { formatDateIndonesian } from '../../services/pdfExport';
import {
  Search,
  Filter,
  Eye,
  FileDown,
  Calendar,
  Image,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Building,
  User,
  Trash2,
} from 'lucide-react';

interface AdminMonitoringProps {
  onViewDetail: (report: LaporanKegiatan) => void;
  onOpenExportModal: () => void;
}

export const AdminMonitoring: React.FC<AdminMonitoringProps> = ({
  onViewDetail,
  onOpenExportModal,
}) => {
  const { reports, users, indicators, deleteReport } = useApp();

  // Multi-Filter States (PRD Section 25)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedIndicator, setSelectedIndicator] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract distinct units
  const distinctUnits = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.unit_kerja) set.add(u.unit_kerja);
    });
    return Array.from(set);
  }, [users]);

  // Combined Multi-Filter Logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search keyword in uraian, nomor laporan, nama, NIP
      const matchesSearch =
        !searchTerm ||
        r.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nomor_laporan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nip.includes(searchTerm);

      // User filter
      const matchesUser = selectedUser === 'all' || r.user_id === selectedUser;

      // Unit filter
      const matchesUnit = selectedUnit === 'all' || r.unit_kerja === selectedUnit;

      // Indicator filter
      const matchesIndicator =
        selectedIndicator === 'all' || r.indikator_id === selectedIndicator;

      // Status filter
      const matchesStatus =
        selectedStatus === 'all'
          ? r.status !== 'Deleted'
          : r.status === selectedStatus;

      // Date range filter
      const matchesStartDate = !startDate || r.tanggal_kegiatan >= startDate;
      const matchesEndDate = !endDate || r.tanggal_kegiatan <= endDate;

      return (
        matchesSearch &&
        matchesUser &&
        matchesUnit &&
        matchesIndicator &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    reports,
    searchTerm,
    selectedUser,
    selectedUnit,
    selectedIndicator,
    selectedStatus,
    startDate,
    endDate,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedUser('all');
    setSelectedUnit('all');
    setSelectedIndicator('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Monitoring Seluruh Laporan Pegawai
          </h2>
          <p className="text-xs text-slate-500">
            Pantau dan verifikasi rincian kegiatan pegawai STABN Raden Wijaya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor PDF / Excel</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter Section (PRD Section 25) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-700" />
            Penyaringan Data (Multi-Filter)
          </span>
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-amber-700 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {/* Search Query */}
          <div className="relative xl:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nomor, nama, NIP, uraian..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Pegawai Dropdown */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
            >
              <option value="all">Semua Pegawai</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama.split(',')[0]} ({u.username})
                </option>
              ))}
            </select>
          </div>

          {/* Unit Kerja Dropdown */}
          <div>
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 truncate"
            >
              <option value="all">Semua Unit Kerja</option>
              {distinctUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal Awal */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
              title="Tanggal Awal"
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
              title="Tanggal Akhir"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span>Hasil Ditemukan:</span>
          <span className="font-bold text-amber-800 font-mono">
            {filteredReports.length} laporan
          </span>
        </div>
      </div>

      {/* Reports Table / Card View */}
      {paginatedReports.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Tidak ada laporan yang sesuai</p>
          <p className="text-xs text-slate-400">
            Cobalah ubah filter tanggal atau kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Laporan</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pegawai</th>
                  <th className="py-3 px-4">Indikator Kinerja</th>
                  <th className="py-3 px-4">Uraian Singkat</th>
                  <th className="py-3 px-4 text-center">Foto</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-amber-50/30 transition cursor-pointer"
                    onClick={() => onViewDetail(report)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900 whitespace-nowrap">
                      {report.nomor_laporan}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {formatDateIndonesian(report.tanggal_kegiatan)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{report.nama}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NIP: {report.nip}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="font-bold text-amber-800 text-[11px] block">
                        {report.indikator_kode}
                      </span>
                      <span className="text-slate-700 text-[11px] line-clamp-1">
                        {report.indikator_nama}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[280px]">
                      <p className="line-clamp-2 text-slate-600 leading-snug">
                        {report.uraian}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {report.foto.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                          <Image className="w-3 h-3" />
                          {report.foto.length} foto
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(report);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs">
              <span className="text-slate-500">
                Halaman {currentPage} dari {totalPages} ({filteredReports.length} laporan)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
