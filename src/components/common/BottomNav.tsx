import React from 'react';
import { Home, PlusCircle, FileText, User } from 'lucide-react';

export type UserTab = 'beranda' | 'lapor' | 'laporan' | 'profil';

interface BottomNavProps {
  currentTab: UserTab;
  onSelectTab: (tab: UserTab) => void;
  onOpenCreateReport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateReport,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Beranda */}
        <button
          onClick={() => onSelectTab('beranda')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'beranda'
              ? 'text-amber-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Beranda</span>
        </button>

        {/* Tab 2: Lapor (Prominent Center Button) */}
        <button
          onClick={() => {
            onOpenCreateReport();
          }}
          className="flex flex-col items-center justify-center py-1 group"
        >
          <div className="w-11 h-11 -mt-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md flex items-center justify-center group-active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-bold text-amber-700 leading-tight mt-0.5">
            + Lapor
          </span>
        </button>

        {/* Tab 3: Laporan */}
        <button
          onClick={() => onSelectTab('laporan')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'laporan'
              ? 'text-amber-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Laporan</span>
        </button>

        {/* Tab 4: Profil */}
        <button
          onClick={() => onSelectTab('profil')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === 'profil'
              ? 'text-amber-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Profil</span>
        </button>
      </div>
    </div>
  );
};
