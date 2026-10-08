import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  UserPlus,
  KeyRound,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const { users, createUser, updateUser, resetUserPassword, toggleUserStatus, showToast } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Reset password modal state
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form inputs
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [username, setUsername] = useState('');
  const [passwordAwal, setPasswordAwal] = useState('pegawai123');
  const [role, setRole] = useState<'pengelola' | 'pengguna'>('pengguna');
  const [status, setStatus] = useState(true);

  const filteredUsers = users.filter(
    (u) =>
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nip.includes(searchTerm) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setNip('');
    setNama('');
    setJabatan('');
    setUnitKerja('');
    setUsername('');
    setPasswordAwal('pegawai123');
    setRole('pengguna');
    setStatus(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setNip(u.nip);
    setNama(u.nama);
    setJabatan(u.jabatan);
    setUnitKerja(u.unit_kerja);
    setUsername(u.username);
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nip.trim() || !nama.trim() || !username.trim()) {
      showToast('NIP, Nama lengkap, dan Username wajib diisi.', 'error');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        nip: nip.trim(),
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        unit_kerja: unitKerja.trim(),
        username: username.trim(),
        role,
        status,
      });
    } else {
      createUser({
        nip: nip.trim(),
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        unit_kerja: unitKerja.trim(),
        username: username.trim(),
        password_hash: passwordAwal.trim() || 'pegawai123',
        role,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword.trim()) {
      showToast('Password baru tidak boleh kosong.', 'error');
      return;
    }

    resetUserPassword(resetModalUser.id, newPassword.trim());
    setResetModalUser(null);
    setNewPassword('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Manajemen Akun Pegawai
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data ASN, hak akses, status aktif/nonaktif, dan reset kata sandi
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Pengguna</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIP, atau unit kerja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <span className="text-xs text-slate-500">
          Total: <strong>{filteredUsers.length}</strong> pengguna
        </span>
      </div>

      {/* Table (PRD Section 9.1 & 10) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center">No</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Unit Kerja</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                    {u.nip}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{u.nama}</div>
                    <div className="text-[11px] text-slate-500">@{u.username}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {u.jabatan || '-'}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {u.unit_kerja || '-'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        u.role === 'pengelola'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role === 'pengelola' ? 'Pengelola' : 'Pengguna'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                        u.status
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                      title="Klik untuk ubah status aktif/nonaktif"
                    >
                      {u.status ? (
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
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 transition"
                        title="Edit Data"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setResetModalUser(u);
                          setNewPassword('pegawai123');
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Pengguna (PRD Section 10) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? 'Edit Akun Pegawai' : 'Tambah Akun Pegawai Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    NIP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="198xxxxxxxx..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama.user"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap, S.Ag., M.Pd."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Pranata Komputer / Analis..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Unit Kerja
                  </label>
                  <input
                    type="text"
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                    placeholder="Subbag Kepegawaian / AUAK..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Role Hak Akses
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'pengelola' | 'pengguna')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="pengguna">Pengguna (Pegawai)</option>
                    <option value="pengelola">Pengelola (Admin)</option>
                  </select>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Password Awal
                    </label>
                    <input
                      type="text"
                      value={passwordAwal}
                      onChange={(e) => setPasswordAwal(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="statusActive"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="statusActive" className="font-semibold text-slate-700 cursor-pointer">
                  Akun aktif dan dapat login
                </label>
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
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password (PRD Section 10) */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900">
                Reset Password Pengguna
              </h3>
              <button
                onClick={() => setResetModalUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Reset kata sandi untuk <strong>{resetModalUser.nama}</strong> (NIP {resetModalUser.nip}).
              </p>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Password Baru
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow transition"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
