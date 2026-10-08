import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LaporanKegiatan } from '../../types';
import { formatDateIndonesian } from '../../services/pdfExport';
import {
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  FileDown,
  PlusCircle,
  Image,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface UserReportListProps {
  onOpenCreateReport: () => void;
  onOpenExportModal: () => void;
  onViewDetail: (report: LaporanKegiatan) => void;
  onEditReport: (report: LaporanKegiatan) => void;
}

export const UserReportList: React.FC<UserReportListProps> = ({
  onOpenCreateReport,
  onOpenExportModal,
  onViewDetail,
  onEditReport,
}) => {
  const { currentUser } = useAuth();
  const { reports, indicators, deleteReport } = useApp();

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter for current user and active reports (PRD soft delete status)
  const myReports = useMemo(() => {
    if (!currentUser) return [];
    return reports.filter((r) => r.user_id === currentUser.id && r.status !== 'Deleted');
  }, [reports, currentUser]);

  const filteredReports = useMemo(() => {
    return myReports.filter((r) => {
      // Keyword search in uraian or indicator name
      const matchesSearch =
        searchTerm === '' ||
        r.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.indikator_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nomor_laporan.toLowerCase().includes(searchTerm.toLowerCase());

      // Indicator filter
      const matchesIndicator =
        selectedIndicator === 'all' || r.indikator_id === selectedIndicator;

      // Date range filter
      const matchesStartDate = !startDate || r.tanggal_kegiatan >= startDate;
      const matchesEndDate = !endDate || r.tanggal_kegiatan <= endDate;

      return matchesSearch && matchesIndicator && matchesStartDate && matchesEndDate;
    });
  }, [myReports, searchTerm, selectedIndicator, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedIndicator('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleDelete = (id: string, nomor: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus laporan ${nomor}?`)) {
      deleteReport(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Riwayat Laporan Kegiatan
          </h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh aktivitas pekerjaan yang telah Anda laporkan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Ekspor PDF</span>
          </button>

          <button
            onClick={onOpenCreateReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Lapor Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari uraian / no. laporan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Indicator dropdown */}
          <div>
            <select
              value={selectedIndicator}
              onChange={(e) => {
                setSelectedIndicator(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
            >
              <option value="all">Semua Indikator Kinerja</option>
              {indicators.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.kode} - {ind.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <input
              type="date"
              placeholder="Tanggal Awal"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              placeholder="Tanggal Akhir"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
            />
            {(searchTerm || selectedIndicator !== 'all' || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                title="Reset Filter"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports List Cards / Table */}
      {paginatedReports.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Tidak ada laporan ditemukan</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tidak ada laporan kegiatan yang sesuai dengan filter atau Anda belum mengirimkan laporan.
          </p>
          <button
            onClick={onOpenCreateReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow hover:bg-amber-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Laporan Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedReports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {report.nomor_laporan}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {formatDateIndonesian(report.tanggal_kegiatan)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {report.status}
                  </span>
                </div>

                <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                  <span className="text-amber-800 font-bold">{report.indikator_kode}</span>
                  <span className="text-slate-400">·</span>
                  <span className="truncate">{report.indikator_nama}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {report.uraian}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.foto.length} Foto Lampiran</span>
                  </span>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onViewDetail(report)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  title="Lihat Detail"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </button>

                <button
                  onClick={() => onEditReport(report)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition"
                  title="Edit Laporan"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(report.id, report.nomor_laporan)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                  title="Hapus Laporan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 text-xs">
              <span className="text-slate-500">
                Halaman {currentPage} dari {totalPages} ({filteredReports.length} total laporan)
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
