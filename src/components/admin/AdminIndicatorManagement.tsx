import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IndikatorKinerja } from '../../types';
import {
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Target,
  Users,
  Building,
} from 'lucide-react';

export const AdminIndicatorManagement: React.FC = () => {
  const { indicators, users, createIndicator, updateIndicator, toggleIndicatorStatus, showToast } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<IndikatorKinerja | null>(null);

  // Form states
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [uraian, setUraian] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [isGeneral, setIsGeneral] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  const filteredIndicators = indicators.filter(
    (i) =>
      i.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingInd(null);
    // suggest next code
    const nextNum = indicators.length + 1;
    setKode(`IK-${String(nextNum).padStart(3, '0')}`);
    setNama('');
    setUraian('');
    setUnitKerja('');
    setIsGeneral(true);
    setAssignedUserIds(users.map((u) => u.id));
    setIsModalOpen(true);
  };

  const openEditModal = (ind: IndikatorKinerja) => {
    setEditingInd(ind);
    setKode(ind.kode);
    setNama(ind.nama);
    setUraian(ind.uraian);
    setUnitKerja(ind.unit_kerja);
    setIsGeneral(ind.is_general);
    setAssignedUserIds(ind.assigned_user_ids || []);
    setIsModalOpen(true);
  };

  const handleToggleUserAssignment = (userId: string) => {
    setAssignedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kode.trim() || !nama.trim()) {
      showToast('Kode dan Nama indikator wajib diisi.', 'error');
      return;
    }

    if (editingInd) {
      updateIndicator(editingInd.id, {
        kode: kode.trim(),
        nama: nama.trim(),
        uraian: uraian.trim(),
        unit_kerja: unitKerja.trim(),
        is_general: isGeneral,
        assigned_user_ids: assignedUserIds,
      });
    } else {
      createIndicator({
        kode: kode.trim(),
        nama: nama.trim(),
        uraian: uraian.trim(),
        unit_kerja: unitKerja.trim(),
        status: true,
        is_general: isGeneral,
        assigned_user_ids: assignedUserIds,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Manajemen Indikator Kinerja Pegawai
          </h2>
          <p className="text-xs text-slate-500">
            Tetapkan tolak ukur kegiatan berdasarkan tugas pokok dan fungsi (Tupoksi) ASN
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Indikator</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode atau nama indikator kinerja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <span className="text-xs text-slate-500">
          Total: <strong>{filteredIndicators.length}</strong> indikator
        </span>
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Indikator Kinerja</th>
                <th className="py-3 px-4">Uraian / Output</th>
                <th className="py-3 px-4">Unit Kerja</th>
                <th className="py-3 px-4">Aksesibilitas</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIndicators.map((ind) => (
                <tr key={ind.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-900 whitespace-nowrap">
                    {ind.kode}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[200px]">
                    {ind.nama}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-[280px]">
                    <p className="line-clamp-2 leading-relaxed">{ind.uraian || '-'}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {ind.unit_kerja || 'Semua Unit'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {ind.is_general ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                        Umum (Semua ASN)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                        Spesifik ({ind.assigned_user_ids.length} Pegawai)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleIndicatorStatus(ind.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                        ind.status
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                      title="Klik untuk ubah status aktif/nonaktif"
                    >
                      {ind.status ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(ind)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition"
                      title="Edit Indikator"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Indikator (PRD Section 11 & 12) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">
                {editingInd ? 'Edit Indikator Kinerja' : 'Tambah Indikator Kinerja Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Kode Indikator <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    placeholder="IK-001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Unit Kerja Terkait
                  </label>
                  <input
                    type="text"
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                    placeholder="Subbag Kepegawaian..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Indikator Kinerja <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Misal: Pengelolaan Surat Dinas Masuk dan Keluar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Uraian / Penjelasan Output Kegiatan
                </label>
                <textarea
                  rows={2}
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
                  placeholder="Deskripsi standar capaian kinerja tugas pegawai..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* PRD Section 12: Penentuan Indikator untuk Pengguna (Opsi A vs Opsi B) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-700 uppercase">
                  Penetapan Hak Akses Indikator (PRD Bagian 12)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGeneral(true)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isGeneral
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs">Opsi A — Umum</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Dapat dipilih oleh seluruh pegawai
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGeneral(false)}
                    className={`p-3 rounded-xl border text-left transition ${
                      !isGeneral
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs">Opsi B — Spesifik</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                      Khusus untuk pegawai/unit tertentu
                    </div>
                  </button>
                </div>

                {!isGeneral && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-semibold text-slate-700">
                      Pilih Pegawai yang Mendapatkan Indikator Ini:
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {users.map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={assignedUserIds.includes(u.id)}
                            onChange={() => handleToggleUserAssignment(u.id)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-slate-800">
                            {u.nama} <span className="text-slate-400 font-mono">({u.username})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold shadow transition"
                >
                  Simpan Indikator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
