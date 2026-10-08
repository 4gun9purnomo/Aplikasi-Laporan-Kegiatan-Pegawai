import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [usernameOrNip, setUsernameOrNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrNip.trim()) {
      setErrorMessage('Username atau NIP wajib diisi.');
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    setIsLoading(true);
    const result = await login(usernameOrNip, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Gagal masuk ke sistem.');
    }
  };

  const handleQuickLogin = (userKey: 'pengelola' | 'pegawai_agung' | 'pegawai_bambang') => {
    if (userKey === 'pengelola') {
      setUsernameOrNip('pengelola');
      setPassword('admin123');
    } else if (userKey === 'pegawai_agung') {
      setUsernameOrNip('198804152014031002');
      setPassword('pegawai123');
    } else if (userKey === 'pegawai_bambang') {
      setUsernameOrNip('197903202008011015');
      setPassword('pegawai123');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-slate-50 to-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official Logo */}
        <div className="inline-block p-3 rounded-2xl bg-white shadow-md border border-amber-100 mb-4 transition-transform hover:scale-105 duration-200">
          <img
            src="/logo.svg"
            alt="Logo STABN Raden Wijaya Wonogiri"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow"
          />
        </div>

        <p className="text-[11px] font-bold tracking-wider text-amber-800 uppercase">
          KEMENTERIAN AGAMA REPUBLIK INDONESIA
        </p>
        <h1 className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          LAPORAN KEGIATAN PEGAWAI
        </h1>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">
          STABN Raden Wijaya Wonogiri Jawa Tengah
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="usernameOrNip"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Username / NIP <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="usernameOrNip"
                  type="text"
                  value={usernameOrNip}
                  onChange={(e) => setUsernameOrNip(e.target.value)}
                  placeholder="Masukkan NIP atau username"
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 focus:bg-white transition"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="block w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 focus:bg-white transition"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 active:scale-[0.99] transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 stroke-[2.2]" />
                <span>{isLoading ? 'Memeriksa...' : 'MASUK KE APLIKASI'}</span>
              </button>
            </div>
          </form>

          {/* Demo account quick login helpers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Akun Uji Coba Cepat (One-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('pegawai_agung')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50/70 border border-slate-200 rounded-xl transition text-[11px]"
              >
                <div className="font-bold text-slate-800 text-xs">Pegawai: Agung</div>
                <div className="text-slate-500">NIP: 19880415...</div>
                <div className="text-amber-700 font-mono text-[10px] mt-0.5">pegawai123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pengelola')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50/70 border border-slate-200 rounded-xl transition text-[11px]"
              >
                <div className="font-bold text-slate-800 text-xs">Pengelola (Admin)</div>
                <div className="text-slate-500">User: pengelola</div>
                <div className="text-amber-700 font-mono text-[10px] mt-0.5">admin123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer address */}
        <div className="mt-6 text-center text-slate-500 text-[11px] space-y-1">
          <p>Jalan Kantil Bulusulur Wonogiri, Jawa Tengah 57615</p>
          <p>Telepon: (0273) 323439 • Website: www.radenwijaya.ac.id</p>
        </div>
      </div>
    </div>
  );
};
