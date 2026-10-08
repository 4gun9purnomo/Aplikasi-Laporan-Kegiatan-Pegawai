import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LogOut, UserCheck, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HeaderProps {
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInstall }) => {
  const { currentUser, logout, switchUser } = useAuth();
  const { users } = useApp();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  if (!currentUser) return null;

  const isPengelola = currentUser.role === 'pengelola';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Left Zone */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.svg"
              alt="Logo STABN Raden Wijaya"
              className="w-10 h-10 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base leading-tight">
                  STABN Raden Wijaya
                </span>
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded tracking-wide ${
                    isPengelola
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isPengelola ? 'Pengelola' : 'Pegawai'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs md:max-w-md">
                Laporan Kegiatan Pegawai Wonogiri
              </p>
            </div>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Install PWA button */}
            {!isInstalled && (isInstallable || isIOS) && (
              <button
                onClick={() => {
                  if (isInstallable) {
                    install();
                  } else if (onOpenInstall) {
                    onOpenInstall();
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                title="Install Aplikasi ke HP / Desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}

            {/* Quick Switch Role / User Dropdown for convenience */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left"
                title="Ganti akun / Coba role lain"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-amber-800 shrink-0 overflow-hidden">
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {currentUser.nama.split(',')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    NIP: {currentUser.nip}
                  </p>
                </div>
              </button>

              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">
                      Akun Aktif
                    </p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.nama}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser.jabatan}
                    </p>
                  </div>

                  <div className="px-3 py-1.5">
                    <p className="text-[11px] text-slate-400 uppercase font-semibold mb-1">
                      Coba Role / Pegawai Lain
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowSwitchMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                            u.id === currentUser.id
                              ? 'bg-amber-50 text-amber-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="truncate">{u.nama}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.role === 'pengelola' ? 'Pengelola' : 'Pegawai'} ({u.username})
                            </div>
                          </div>
                          {u.id === currentUser.id ? (
                            <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <span className="text-[10px] text-slate-400 shrink-0">Pilih</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                    <button
                      onClick={() => {
                        setShowSwitchMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
