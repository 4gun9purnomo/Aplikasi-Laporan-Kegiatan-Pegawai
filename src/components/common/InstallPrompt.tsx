import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, X } from 'lucide-react';

interface InstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center p-1.5 shrink-0">
            <img src="/logo.svg" alt="STABN" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              LKP STABN Raden Wijaya
            </h3>
            <p className="text-xs text-slate-500">
              Pasang aplikasi di layar utama HP Anda
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-800">
              Petunjuk Pasang di iPhone / iPad (Safari):
            </p>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
              <p>Ketuk tombol <strong>Share</strong> (ikon <Share className="w-3.5 h-3.5 inline text-blue-600" />) di bilah bawah browser Safari.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
              <p>Gulir ke bawah lalu pilih menu <strong>Tambahkan ke Layar Utama</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />).</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
              <p>Ketuk <strong>Tambah</strong> di pojok kanan atas.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Aplikasi ini mendukung Progressive Web App (PWA). Anda dapat memasangnya tanpa perlu download dari PlayStore, menghemat memori, dan dapat dibuka secepat aplikasi native.
            </p>
            {isInstallable && (
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Sekarang</span>
              </button>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700 font-medium text-center"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
