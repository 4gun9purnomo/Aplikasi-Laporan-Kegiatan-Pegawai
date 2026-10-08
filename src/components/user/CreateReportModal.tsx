import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { FotoLaporan, IndikatorKinerja, LaporanKegiatan } from '../../types';
import { compressImageFile, formatFileSize } from '../../services/imageCompressor';
import { CameraModal } from './CameraModal';
import {
  X,
  Camera,
  Image as ImageIcon,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  editReport?: LaporanKegiatan | null;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  editReport,
}) => {
  const { currentUser } = useAuth();
  const { indicators, settings, createReport, updateReport, showToast } = useApp();

  const isEditing = !!editReport;

  // Form states
  const [tanggal, setTanggal] = useState('');
  const [indikatorId, setIndikatorId] = useState('');
  const [uraian, setUraian] = useState('');
  const [photos, setPhotos] = useState<FotoLaporan[]>([]);
  const [searchIndikator, setSearchIndikator] = useState('');

  // UI flow states
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Available indicators for this user (PRD Section 12: Opsi B Indikator Spesifik + Umum)
  const availableIndicators = indicators.filter((ind) => {
    if (!ind.status) return false;
    if (ind.is_general) return true;
    if (currentUser && ind.assigned_user_ids.includes(currentUser.id)) return true;
    return false;
  });

  const filteredIndicators = availableIndicators.filter(
    (ind) =>
      ind.nama.toLowerCase().includes(searchIndikator.toLowerCase()) ||
      ind.kode.toLowerCase().includes(searchIndikator.toLowerCase()) ||
      ind.unit_kerja.toLowerCase().includes(searchIndikator.toLowerCase())
  );

  // Calculate allowable date range
  const todayStr = new Date().toISOString().split('T')[0];
  const maxBackdate = new Date();
  maxBackdate.setDate(maxBackdate.getDate() - (settings.max_backdate_days || 14));
  const minDateStr = maxBackdate.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      if (editReport) {
        setTanggal(editReport.tanggal_kegiatan);
        setIndikatorId(editReport.indikator_id);
        setUraian(editReport.uraian);
        setPhotos(editReport.foto || []);
      } else {
        setTanggal(todayStr);
        setIndikatorId(availableIndicators[0]?.id || '');
        setUraian('');
        setPhotos([]);
      }
      setStep('form');
      setValidationError(null);
    }
  }, [isOpen, editReport]);

  if (!isOpen) return null;

  // Handle image compression & upload
  const processUploadedImage = async (file: File) => {
    if (photos.length >= settings.max_photos) {
      showToast(`Maksimal ${settings.max_photos} foto untuk setiap laporan.`, 'error');
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressImageFile(file, 1440, settings.photo_quality);

      const newPhoto: FotoLaporan = {
        id: `foto_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        nama_file: compressed.fileName,
        file_url: compressed.dataUrl,
        urutan: photos.length + 1,
        ukuran_file: compressed.compressedSize,
        created_at: new Date().toISOString(),
      };

      setPhotos((prev) => [...prev, newPhoto]);
      showToast(
        `Foto berhasil dikompresi (${formatFileSize(compressed.originalSize)} ➔ ${formatFileSize(compressed.compressedSize)})`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses gambar';
      showToast(msg, 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = settings.max_photos - photos.length;
    if (files.length > remainingSlots) {
      showToast(
        `Anda hanya dapat menambah ${remainingSlots} foto lagi (Maksimal ${settings.max_photos} foto).`,
        'error'
      );
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach((file) => {
      processUploadedImage(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const selectedIndicatorObj = indicators.find((i) => i.id === indikatorId);

  // Validate form before preview
  const handleProceedToPreview = () => {
    setValidationError(null);

    if (!tanggal) {
      setValidationError('Silakan pilih tanggal kegiatan.');
      return;
    }

    if (!indikatorId) {
      setValidationError('Silakan pilih indikator kinerja.');
      return;
    }

    if (!uraian || uraian.trim().length < settings.min_uraian_length) {
      setValidationError(
        `Uraian kegiatan minimal ${settings.min_uraian_length} karakter (saat ini ${uraian.trim().length} karakter).`
      );
      return;
    }

    setStep('preview');
  };

  // Submit report
  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (isEditing && editReport) {
      const result = await updateReport(editReport.id, {
        tanggal_kegiatan: tanggal,
        indikator_id: indikatorId,
        uraian,
        foto: photos,
      });
      setIsSubmitting(false);
      if (result.success) {
        onClose();
      }
    } else {
      const result = await createReport({
        tanggal_kegiatan: tanggal,
        indikator_id: indikatorId,
        uraian,
        foto: photos,
      });
      setIsSubmitting(false);
      if (result.success) {
        onClose();
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Laporan Kegiatan' : 'Buat Laporan Kegiatan'}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 'form'
                  ? 'Isi formulir dokumentasi kegiatan harian pegawai'
                  : 'Pratinjau ringkasan sebelum pengiriman'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="px-6 py-2.5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 'form'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                1
              </span>
              <span className="font-semibold text-slate-800">Form Laporan</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 'preview'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className={`font-semibold ${step === 'preview' ? 'text-slate-900' : 'text-slate-400'}`}>
                Preview & Kirim
              </span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {step === 'form' ? (
              <>
                {/* 1. Tanggal Kegiatan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Tanggal Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={tanggal}
                      min={minDateStr}
                      max={todayStr}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dapat memilih tanggal mundur hingga maksimal {settings.max_backdate_days} hari yang lalu.
                  </p>
                </div>

                {/* 2. Indikator Kinerja */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Indikator Kinerja <span className="text-rose-500">*</span>
                  </label>

                  {/* Search box for indicator */}
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari indikator kinerja..."
                      value={searchIndikator}
                      onChange={(e) => setSearchIndikator(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {filteredIndicators.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        Tidak ada indikator kinerja yang cocok.
                      </p>
                    ) : (
                      filteredIndicators.map((ind) => {
                        const isSelected = indikatorId === ind.id;
                        return (
                          <div
                            key={ind.id}
                            onClick={() => setIndikatorId(ind.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-amber-800">{ind.kode}</span>
                              <span className="text-[10px] text-slate-400">{ind.unit_kerja}</span>
                            </div>
                            <p className="font-semibold text-slate-800">{ind.nama}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {ind.uraian}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Dokumentasi Foto */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Dokumentasi Foto Kegiatan
                    </label>
                    <span className="text-xs font-semibold text-amber-800">
                      {photos.length} / {settings.max_photos} Foto
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3">
                    Setiap satu laporan indikator maksimal memiliki {settings.max_photos} foto. Foto otomatis dikompresi agar ringan dan cepat dibuka.
                  </p>

                  {/* Buttons for photo capture / gallery */}
                  <div className="flex flex-wrap gap-2.5 mb-3">
                    <button
                      type="button"
                      disabled={photos.length >= settings.max_photos || isCompressing}
                      onClick={() => setIsCameraOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 disabled:opacity-40 transition"
                    >
                      <Camera className="w-4 h-4 text-amber-700" />
                      <span>Ambil Foto Realtime</span>
                    </button>

                    <label
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition cursor-pointer ${
                        photos.length >= settings.max_photos || isCompressing
                          ? 'opacity-40 pointer-events-none'
                          : ''
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-slate-700" />
                      <span>Pilih dari Galeri HP</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={photos.length >= settings.max_photos || isCompressing}
                      />
                    </label>

                    {isCompressing && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 animate-pulse py-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengompresi foto...</span>
                      </div>
                    )}
                  </div>

                  {/* Preview uploaded photos */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, idx) => (
                        <div
                          key={photo.id}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                        >
                          <img
                            src={photo.file_url}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                              title="Hapus Foto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                            Foto {idx + 1} ({formatFileSize(photo.ukuran_file)})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Uraian Kegiatan */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      4. Uraian Kegiatan <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-semibold ${
                        uraian.trim().length >= settings.min_uraian_length
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {uraian.trim().length} / Min. {settings.min_uraian_length} karakter
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={uraian}
                    onChange={(e) => setUraian(e.target.value)}
                    placeholder="Tuliskan rincian kegiatan pekerjaan yang dilaksanakan secara jelas, misal: 'Melaksanakan pengelolaan surat masuk dan melakukan pencatatan surat ke dalam administrasi persuratan sesuai dengan ketentuan yang berlaku.'"
                    className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gunakan deskripsi yang menggambarkan output pekerjaan yang telah diselesaikan.
                  </p>
                </div>
              </>
            ) : (
              /* Step 2: PRD Section 19 Preview Sebelum Mengirim */
              <div className="space-y-4">
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                    Ringkasan Laporan Kegiatan
                  </h3>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-slate-500">Tanggal Kegiatan:</dt>
                      <dd className="font-bold text-slate-900 text-sm mt-0.5">{tanggal}</dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Jumlah Foto:</dt>
                      <dd className="font-bold text-slate-900 text-sm mt-0.5">
                        {photos.length} Foto Terlampir
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Indikator Kinerja:</dt>
                      <dd className="font-bold text-amber-900 text-sm mt-0.5">
                        {selectedIndicatorObj?.kode} - {selectedIndicatorObj?.nama}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-slate-500 mb-1">Uraian Pekerjaan:</dt>
                      <dd className="p-3 bg-white rounded-xl border border-amber-200/80 text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                        {uraian.trim()}
                      </dd>
                    </div>
                  </dl>
                </div>

                {photos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-600 mb-2">
                      Pratinjau Foto Lampiran ({photos.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((p, i) => (
                        <div
                          key={p.id}
                          className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 relative"
                        >
                          <img src={p.file_url} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded">
                            Foto {i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            {step === 'preview' ? (
              <>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-md shadow-amber-600/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPreview}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-md transition"
                >
                  <span>Lanjut ke Pratinjau</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Realtime Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(blob, filename) => {
          const file = new File([blob], filename, { type: 'image/jpeg' });
          processUploadedImage(file);
        }}
      />
    </>
  );
};
