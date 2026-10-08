import { User, IndikatorKinerja, LaporanKegiatan, ActivityLog, SystemSettings } from '../types';
import { INITIAL_USERS, INITIAL_INDIKATORS, INITIAL_REPORTS, INITIAL_LOGS, INITIAL_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'stabn_lkp_users',
  INDIKATORS: 'stabn_lkp_indikators',
  REPORTS: 'stabn_lkp_reports',
  LOGS: 'stabn_lkp_logs',
  SETTINGS: 'stabn_lkp_settings',
  AUTH_USER: 'stabn_lkp_auth_user',
};

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getStoredIndicators = (): IndikatorKinerja[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INDIKATORS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INDIKATORS, JSON.stringify(INITIAL_INDIKATORS));
    return INITIAL_INDIKATORS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_INDIKATORS;
  }
};

export const saveStoredIndicators = (indicators: IndikatorKinerja[]): void => {
  localStorage.setItem(STORAGE_KEYS.INDIKATORS, JSON.stringify(indicators));
};

export const getStoredReports = (): LaporanKegiatan[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REPORTS;
  }
};

export const saveStoredReports = (reports: LaporanKegiatan[]): void => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getStoredLogs = (): ActivityLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_LOGS;
  }
};

export const addStoredLog = (log: Omit<ActivityLog, 'id' | 'created_at'>): void => {
  const current = getStoredLogs();
  const newEntry: ActivityLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newEntry, ...current].slice(0, 300); // retain last 300 logs
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
};

export const getStoredSettings = (): SystemSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: SystemSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Generates unique report number: LKP-YYYYMMDD-XXXXXX
export const generateReportNumber = (dateStr: string): string => {
  const formattedDate = dateStr.replace(/[^0-9]/g, '');
  const prefix = `LKP-${formattedDate}-`;
  const reports = getStoredReports();
  
  // Count existing reports for this day to form sequential suffix
  const matchCount = reports.filter(r => r.nomor_laporan.startsWith(prefix)).length;
  const sequence = String(matchCount + 1).padStart(6, '0');
  return `${prefix}${sequence}`;
};
