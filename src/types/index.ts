export type UserRole = 'pengelola' | 'pengguna';

export interface User {
  id: string;
  nip: string;
  nama: string;
  username: string;
  password_hash: string;
  jabatan: string;
  unit_kerja: string;
  role: UserRole;
  status: boolean; // true = Aktif, false = Nonaktif
  foto_profil?: string;
  created_at: string;
  updated_at: string;
}

export interface IndikatorKinerja {
  id: string;
  kode: string; // e.g. IK-001
  nama: string;
  uraian: string;
  unit_kerja: string;
  status: boolean; // true = Aktif, false = Nonaktif
  is_general: boolean; // Opsi A: Umum (semua user) atau Opsi B: Spesifik
  assigned_user_ids: string[]; // User IDs who can use this indicator
  created_at: string;
  updated_at: string;
}

export interface FotoLaporan {
  id: string;
  laporan_id?: string;
  nama_file: string;
  file_url: string; // Data URL or storage link
  drive_file_id?: string;
  urutan: number;
  ukuran_file: number; // in bytes
  created_at: string;
}

export interface LaporanKegiatan {
  id: string;
  nomor_laporan: string; // format: LKP-YYYYMMDD-XXXXXX
  user_id: string;
  nip: string;
  nama: string;
  jabatan: string;
  unit_kerja: string;
  indikator_id: string;
  indikator_kode: string;
  indikator_nama: string;
  tanggal_kegiatan: string; // YYYY-MM-DD
  uraian: string;
  status: 'Terkirim' | 'Deleted';
  foto: FotoLaporan[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  username: string;
  nama: string;
  aktivitas: string; // e.g. "Login", "Membuat laporan", "Edit laporan", "Hapus laporan", "Ekspor laporan", dll
  reference_id?: string;
  keterangan?: string;
  created_at: string;
}

export interface SystemSettings {
  nama_kementerian: string;
  nama_kampus: string;
  alamat_kampus: string;
  telepon: string;
  email: string;
  website: string;
  max_backdate_days: number; // 7, 14, 30 hari
  max_photos: number; // 3
  min_uraian_length: number; // 20
  target_photo_kb: number; // 300
  photo_quality: number; // 0.8
  google_drive_folder: string;
  pejabat_penandatangan: string;
  nip_penandatangan: string;
  jabatan_penandatangan: string;
}
