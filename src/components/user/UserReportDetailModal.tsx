import React, { useState } from 'react';
import { LaporanKegiatan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatDateIndonesian, generatePDFReport } from '../../services/pdfExport';
import { formatFileSize } from '../../services/imageCompressor';
import {
  X,
  Calendar,
  User,
  Building,
  Target,
  Clock,
  Edit,
  Trash2,
  FileDown,
  ExternalLink,
  ZoomIn,
} from 'lucide-react';

interface UserReportDetailModalProps {
  report: LaporanKegiatan | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (report: LaporanKegiatan) => void;
  onDelete?: (reportId: string) => void;
}

export const UserReportDetailModal: React.FC<UserReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { currentUser } = useAuth();
  const { settings } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen || !report) return null;

  const isOwner = currentUser?.id === report.user_id;
  const isPengelola = currentUser?.role === 'pengelola';
  const canModify = (isOwner || isPengelola) && report.status !== 'Deleted';

  const handleExportSinglePDF = () => {
    generatePDFReport({
      reports: [report],
      user: {
        id: report.user_id,
        nip: report.nip,
        nama: report.nama,
        username: '',
        password_hash: '',
        jabatan: report.jabatan,
        unit_kerja: report.unit_kerja,
        role: 'pengguna',
        status: true,
        created_at: '',
        updated_at: '',
      },
      startDate: report.tanggal_kegiatan,
      endDate: report.tanggal_kegiatan,
      settings,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                {report.nomor_laporan}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  report.status === 'Terkirim'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {report.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Pegawai Melaporkan:</span>
                <span className="font-bold text-slate-800 text-sm">{report.nama}</span>
                <span className="text-slate-500 block text-[11px]">NIP. {report.nip}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Unit Kerja / Jabatan:</span>
                <span className="font-semibold text-slate-800">{report.jabatan}</span>
                <span className="text-slate-500 block text-[11px]">{report.unit_kerja}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Tanggal Kegiatan:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatDateIndonesian(report.tanggal_kegiatan)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Waktu Pencatatan:</span>
                <span className="text-slate-700">
                  {new Date(report.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                {report.updated_at !== report.created_at && (
                  <span className="text-[10px] text-amber-700 block italic">
                    (Diedit: {new Date(report.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </div>
            </div>

            {/* Performance Indicator Block */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                Indikator Kinerja Pegawai
              </span>
              <p className="font-bold text-sm text-slate-900">
                {report.indikator_kode} - {report.indikator_nama}
              </p>
            </div>

            {/* Uraian Pekerjaan */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Uraian Kegiatan
              </span>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs">
                {report.uraian}
              </div>
            </div>

            {/* Dokumentasi Foto */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dokumentasi Foto ({report.foto.length})
                </span>
                {report.foto.length > 0 && (
                  <span className="text-[11px] text-slate-400">Klik gambar untuk memperbesar</span>
                )}
              </div>

              {report.foto.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  Tidak ada foto dokumentasi yang dilampirkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.foto.map((f, i) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedImage(f.file_url)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 cursor-pointer shadow-xs hover:shadow-md transition"
                    >
                      <img
                        src={f.file_url}
                        alt={f.nama_file}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                        <p className="text-[10px] font-semibold truncate">{f.nama_file}</p>
                        <p className="text-[9px] text-slate-300">{formatFileSize(f.ukuran_file)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExportSinglePDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
            >
              <FileDown className="w-4 h-4 text-amber-700" />
              <span>Cetak / Ekspor PDF</span>
            </button>

            <div className="flex items-center gap-2">
              {canModify && onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(report);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              {canModify && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
                      onDelete(report.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Image Zoom */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Bukti Dokumentasi Full"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
