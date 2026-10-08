import * as XLSX from 'xlsx';
import { LaporanKegiatan, SystemSettings } from '../types';
import { formatDateIndonesian } from './pdfExport';

export interface ExcelExportOptions {
  reports: LaporanKegiatan[];
  startDate: string;
  endDate: string;
  settings: SystemSettings;
  filterLabel?: string;
}

export const exportReportsToExcel = ({
  reports,
  startDate,
  endDate,
  settings,
  filterLabel = 'Semua',
}: ExcelExportOptions): void => {
  // Format spreadsheet data rows
  const headerInfo = [
    [settings.nama_kementerian],
    [settings.nama_kampus],
    ['REKAPITULASI LAPORAN KEGIATAN HARIAN PEGAWAI'],
    [`Periode: ${formatDateIndonesian(startDate)} s.d. ${formatDateIndonesian(endDate)}`],
    [`Filter: ${filterLabel}`],
    [], // empty row
  ];

  const tableHeaders = [
    'No',
    'Nomor Laporan',
    'Tanggal Kegiatan',
    'NIP',
    'Nama Pegawai',
    'Jabatan',
    'Unit Kerja',
    'Kode Indikator',
    'Indikator Kinerja',
    'Uraian Kegiatan',
    'Jumlah Foto',
    'Link Foto 1',
    'Link Foto 2',
    'Link Foto 3',
    'Status',
    'Waktu Submit',
  ];

  const dataRows = reports.map((r, idx) => {
    const photo1 = r.foto[0]?.file_url || '';
    const photo2 = r.foto[1]?.file_url || '';
    const photo3 = r.foto[2]?.file_url || '';

    return [
      idx + 1,
      r.nomor_laporan,
      r.tanggal_kegiatan,
      r.nip,
      r.nama,
      r.jabatan,
      r.unit_kerja,
      r.indikator_kode,
      r.indikator_nama,
      r.uraian,
      r.foto.length,
      photo1.startsWith('http') ? photo1 : (photo1 ? '[Tersimpan]' : '-'),
      photo2.startsWith('http') ? photo2 : (photo2 ? '[Tersimpan]' : '-'),
      photo3.startsWith('http') ? photo3 : (photo3 ? '[Tersimpan]' : '-'),
      r.status,
      r.created_at,
    ];
  });

  const fullSheetData = [...headerInfo, tableHeaders, ...dataRows];

  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 24 }, // Nomor Laporan
    { wch: 15 }, // Tanggal
    { wch: 22 }, // NIP
    { wch: 28 }, // Nama
    { wch: 25 }, // Jabatan
    { wch: 30 }, // Unit Kerja
    { wch: 14 }, // Kode
    { wch: 35 }, // Indikator
    { wch: 50 }, // Uraian
    { wch: 12 }, // Jml Foto
    { wch: 25 }, // Link 1
    { wch: 25 }, // Link 2
    { wch: 25 }, // Link 3
    { wch: 12 }, // Status
    { wch: 22 }, // Submit
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Kegiatan');

  // Trigger file download
  const filename = `Rekap_LKP_STABN_${startDate}_${endDate}.xlsx`;
  XLSX.writeFile(wb, filename);
};
