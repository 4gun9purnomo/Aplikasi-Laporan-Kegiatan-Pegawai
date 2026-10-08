import React from 'react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:right-auto md:max-w-md z-40 bg-amber-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span className="flex-1">
        Anda sedang offline. Mode penyimpanan lokal aktif, laporan tetap dapat dibuat.
      </span>
    </div>
  );
};
