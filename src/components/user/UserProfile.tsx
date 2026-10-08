import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  User,
  Shield,
  Building,
  KeyRound,
  LogOut,
  CheckCircle2,
  Calendar,
  Download,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface UserProfileProps {
  onOpenInstall?: () => void;
  onOpenExportModal?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  onOpenInstall,
  onOpenExportModal,
}) => {
  const { currentUser, logout } = useAuth();
  const { updateUser, showToast } = useApp();
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser.password_hash !== oldPassword) {
      showToast('Kata sandi saat ini tidak sesuai.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

    updateUser(currentUser.id, { password_hash: newPassword });
    showToast('Kata sandi berhasil diperbarui.', 'success');
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {currentUser.nama.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {currentUser.role === 'pengelola' ? 'Pengelola Sistem' : 'Pegawai ASN STABN'}
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">
              {currentUser.nama}
            </h2>
            <p className="text-xs text-slate-500 font-mono">NIP. {currentUser.nip}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500">Jabatan:</span>
            <span className="font-semibold text-slate-800 text-right">{currentUser.jabatan}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500">Unit Kerja:</span>
            <span className="font-semibold text-slate-800 text-right">{currentUser.unit_kerja}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500">Username:</span>
            <span className="font-mono text-slate-800 font-semibold">@{currentUser.username}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500">Status Akun:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aktif</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Aksi & Ekspor</h3>

        {onOpenExportModal && (
          <button
            onClick={onOpenExportModal}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold transition"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-amber-700" />
              <span>Ekspor Rekap Laporan Saya ke PDF</span>
            </div>
            <span className="text-xs">➔</span>
          </button>
        )}

        {/* Install app */}
        {!isInstalled && (isInstallable || isIOS) && (
          <button
            onClick={() => {
              if (isInstallable) {
                install();
              } else if (onOpenInstall) {
                onOpenInstall();
              }
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold transition"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-slate-600" />
              <span>Pasang Aplikasi (PWA) di Layar Utama HP</span>
            </div>
            <span className="text-xs">➔</span>
          </button>
        )}

        {/* Change password toggle */}
        <button
          onClick={() => setIsChangingPassword(!isChangingPassword)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold transition"
        >
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-slate-600" />
            <span>Ubah Kata Sandi Akun</span>
          </div>
          <span className="text-xs">{isChangingPassword ? 'Tutup' : 'Ubah'}</span>
        </button>

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Kata Sandi Lama
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Kata Sandi Baru (Min. 6 karakter)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition"
            >
              Simpan Kata Sandi Baru
            </button>
          </form>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition text-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun (Logout)</span>
      </button>
    </div>
  );
};
