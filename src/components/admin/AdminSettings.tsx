import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SystemSettings } from '../../types';
import {
  Settings,
  Save,
  Building2,
  FolderGit2,
  Sliders,
  CheckCircle2,
  HardDrive,
  FileCheck,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });

  const handleChange = (field: keyof SystemSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Pengaturan Sistem & Profil Instansi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas kop surat, parameter batas laporan, dan integrasi penyimpanan
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
        {/* Profil Instansi (PRD Section 6, 8, 29) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Profil Instansi & Kop Surat
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Kementerian / Lembaga
              </label>
              <input
                type="text"
                value={formData.nama_kementerian}
                onChange={(e) => handleChange('nama_kementerian', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nama Perguruan Tinggi
              </label>
              <input
                type="text"
                value={formData.nama_kampus}
                onChange={(e) => handleChange('nama_kampus', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Alamat Kampus
              </label>
              <input
                type="text"
                value={formData.alamat_kampus}
                onChange={(e) => handleChange('alamat_kampus', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => handleChange('telepon', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Email Resmi
                </label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Website Resmi
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Parameter Validasi & Penandatangan Dokumen */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Parameter Sistem Pelaporan
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Batas Maksimal Tanggal Mundur (Backdate)
                </label>
                <select
                  value={formData.max_backdate_days}
                  onChange={(e) => handleChange('max_backdate_days', Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                >
                  <option value={7}>7 Hari ke belakang</option>
                  <option value={14}>14 Hari ke belakang (Standar)</option>
                  <option value={30}>30 Hari ke belakang (1 Bulan)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Batas toleransi tanggal kegiatan yang diizinkan untuk diinput pegawai.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Batas Maksimal Foto
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.max_photos}
                    onChange={(e) => handleChange('max_photos', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Sesuai PRD: 3 foto/laporan</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Minimal Karakter Uraian
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={formData.min_uraian_length}
                    onChange={(e) => handleChange('min_uraian_length', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Minimal 20 karakter</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan Ekspor PDF */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Pejabat Pengesah / Penandatangan Dokumen
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Pejabat
                </label>
                <input
                  type="text"
                  value={formData.pejabat_penandatangan}
                  onChange={(e) => handleChange('pejabat_penandatangan', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    NIP Pejabat
                  </label>
                  <input
                    type="text"
                    value={formData.nip_penandatangan}
                    onChange={(e) => handleChange('nip_penandatangan', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Jabatan Pejabat
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan_penandatangan}
                    onChange={(e) => handleChange('jabatan_penandatangan', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arsitektur Cloud Drive & Database (PRD Section 42, 43, 44) */}
        <div className="lg:col-span-2 bg-gradient-to-r from-amber-50/60 to-slate-50 p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-800" />
            <h3 className="font-bold text-slate-900 text-sm">
              Struktur Penyimpanan Berkas & Database (PRD Bagian 43 & 44)
            </h3>
          </div>

          <p className="text-slate-600 leading-relaxed text-xs">
            Sesuai arsitektur yang direkomendasikan pada PRD, file foto disimpan dengan struktur folder tahun dan bulan (e.g. <code>FOTO KEGIATAN / 2026 / 10-Oktober / LKP-20261007-000125_01.jpg</code>), serta database menyimpan metadata, nomor laporan, dan URL bukti hyperlink terverifikasi.
          </p>

          <div className="bg-white p-3 rounded-xl border border-amber-200 font-mono text-[11px] text-slate-700">
            <div>📂 LAPORAN KEGIATAN PEGAWAI STABN RADEN WIJAYA</div>
            <div className="pl-4">├── 📁 FOTO KEGIATAN / 2026 / [Bulan] / LKP-YYYYMMDD-XXXXXX_XX.jpg</div>
            <div className="pl-4">└── 📁 EXPORT PDF / 2026 / Rekap_LKP_STABN_[Periode].pdf</div>
          </div>
        </div>
      </form>
    </div>
  );
};
