import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { BottomNav, UserTab } from './components/common/BottomNav';
import { NotificationToast } from './components/common/NotificationToast';
import { OfflineBanner } from './components/common/OfflineBanner';
import { InstallPrompt } from './components/common/InstallPrompt';

// Employee components
import { UserDashboard } from './components/user/UserDashboard';
import { UserReportList } from './components/user/UserReportList';
import { UserProfile } from './components/user/UserProfile';
import { CreateReportModal } from './components/user/CreateReportModal';
import { UserReportDetailModal } from './components/user/UserReportDetailModal';
import { UserExportModal } from './components/user/UserExportModal';

// Admin components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminMonitoring } from './components/admin/AdminMonitoring';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { AdminIndicatorManagement } from './components/admin/AdminIndicatorManagement';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminActivityLogs } from './components/admin/AdminActivityLogs';
import { AdminExportModal } from './components/admin/AdminExportModal';

import { LaporanKegiatan } from './types';
import {
  LayoutDashboard,
  FileText,
  Users,
  Target,
  Settings,
  History,
  PlusCircle,
  FileDown,
  Layers,
} from 'lucide-react';

type AdminTab = 'dashboard' | 'monitoring' | 'users' | 'indicators' | 'settings' | 'logs';

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { deleteReport } = useApp();

  // Navigation states
  const [userTab, setUserTab] = useState<UserTab>('beranda');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LaporanKegiatan | null>(null);
  const [selectedReport, setSelectedReport] = useState<LaporanKegiatan | null>(null);
  const [isUserExportOpen, setIsUserExportOpen] = useState(false);
  const [isAdminExportOpen, setIsAdminExportOpen] = useState(false);
  const [isInstallPromptOpen, setIsInstallPromptOpen] = useState(false);

  if (!currentUser) {
    return <LoginPage />;
  }

  const isPengelola = currentUser.role === 'pengelola';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Institutional Top Header */}
      <Header onOpenInstall={() => setIsInstallPromptOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {isPengelola ? (
          /* PENGELOLA (ADMIN) VIEW WITH DESKTOP SIDEBAR (PRD Section 49) */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Admin Sidebar / Navigation Menu */}
            <aside className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs sticky top-20">
                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Menu Pengelola
                  </p>
                </div>

                <nav className="space-y-1 text-xs">
                  <button
                    onClick={() => setAdminTab('dashboard')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${
                      adminTab === 'dashboard'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Statistik</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('monitoring')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${
                      adminTab === 'monitoring'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Monitoring Laporan</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('users')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${
                      adminTab === 'users'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Kelola Pengguna</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('indicators')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${
                      adminTab === 'indicators'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Indikator Kinerja</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${
                      adminTab === 'settings'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan Profil</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('logs')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition ${
                      adminTab === 'logs'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>Log Aktivitas</span>
                  </button>
                </nav>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsAdminExportOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition"
                  >
                    <FileDown className="w-4 h-4 text-amber-700" />
                    <span>Ekspor Laporan (PDF/XLS)</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Admin Content Area */}
            <main className="flex-1 min-w-0">
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  onNavigate={(tab) => setAdminTab(tab)}
                  onOpenExportModal={() => setIsAdminExportOpen(true)}
                />
              )}
              {adminTab === 'monitoring' && (
                <AdminMonitoring
                  onViewDetail={(rep) => setSelectedReport(rep)}
                  onOpenExportModal={() => setIsAdminExportOpen(true)}
                />
              )}
              {adminTab === 'users' && <AdminUserManagement />}
              {adminTab === 'indicators' && <AdminIndicatorManagement />}
              {adminTab === 'settings' && <AdminSettings />}
              {adminTab === 'logs' && <AdminActivityLogs />}
            </main>
          </div>
        ) : (
          /* PENGGUNA (PEGAWAI) VIEW WITH DESKTOP TABS & MOBILE FIRST DESIGN */
          <main className="max-w-3xl mx-auto space-y-4">
            {/* Desktop Tab Selector */}
            <div className="hidden md:flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs mb-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setUserTab('beranda')}
                  className={`px-4 py-2 rounded-xl font-bold transition ${
                    userTab === 'beranda'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={() => setUserTab('laporan')}
                  className={`px-4 py-2 rounded-xl font-bold transition ${
                    userTab === 'laporan'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Riwayat Laporan Saya
                </button>
                <button
                  onClick={() => setUserTab('profil')}
                  className={`px-4 py-2 rounded-xl font-bold transition ${
                    userTab === 'profil'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Profil Pegawai
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingReport(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Buat Laporan</span>
              </button>
            </div>

            {/* Tab Views */}
            {userTab === 'beranda' && (
              <UserDashboard
                onOpenCreateReport={() => {
                  setEditingReport(null);
                  setIsCreateModalOpen(true);
                }}
                onOpenExportModal={() => setIsUserExportOpen(true)}
                onViewAllReports={() => setUserTab('laporan')}
                onViewDetail={(report) => setSelectedReport(report)}
              />
            )}

            {userTab === 'laporan' && (
              <UserReportList
                onOpenCreateReport={() => {
                  setEditingReport(null);
                  setIsCreateModalOpen(true);
                }}
                onOpenExportModal={() => setIsUserExportOpen(true)}
                onViewDetail={(report) => setSelectedReport(report)}
                onEditReport={(report) => {
                  setEditingReport(report);
                  setIsCreateModalOpen(true);
                }}
              />
            )}

            {userTab === 'profil' && (
              <UserProfile
                onOpenInstall={() => setIsInstallPromptOpen(true)}
                onOpenExportModal={() => setIsUserExportOpen(true)}
              />
            )}
          </main>
        )}
      </div>

      {/* Mobile-First Bottom Navigation for Employees (PRD Section 35) */}
      {!isPengelola && (
        <BottomNav
          currentTab={userTab}
          onSelectTab={(tab) => setUserTab(tab)}
          onOpenCreateReport={() => {
            setEditingReport(null);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {/* Global Modals */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingReport(null);
        }}
        editReport={editingReport}
      />

      <UserReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onEdit={(rep) => {
          setEditingReport(rep);
          setIsCreateModalOpen(true);
        }}
        onDelete={(repId) => {
          deleteReport(repId);
        }}
      />

      <UserExportModal
        isOpen={isUserExportOpen}
        onClose={() => setIsUserExportOpen(false)}
      />

      <AdminExportModal
        isOpen={isAdminExportOpen}
        onClose={() => setIsAdminExportOpen(false)}
      />

      <InstallPrompt
        isOpen={isInstallPromptOpen}
        onClose={() => setIsInstallPromptOpen(false)}
      />

      {/* Global Toast Notifications & Offline Status Indicator */}
      <NotificationToast />
      <OfflineBanner />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
