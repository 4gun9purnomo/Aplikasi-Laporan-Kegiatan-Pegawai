import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, User, Clock, FileText } from 'lucide-react';

export const AdminActivityLogs: React.FC = () => {
  const { logs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.aktivitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.reference_id && l.reference_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Log Aktivitas Sistem
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail pencatatan aktivitas login, laporan, manipulasi data, dan ekspor
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Total: <strong>{filteredLogs.length}</strong> riwayat
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari aktivitas, nama pengguna, atau referensi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Aktivitas</th>
                <th className="py-3 px-4">Referensi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{log.nama}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      @{log.username}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {log.aktivitas}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-amber-800">
                    {log.reference_id ? (
                      <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {log.reference_id}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
