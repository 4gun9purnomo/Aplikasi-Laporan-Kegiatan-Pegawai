import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LaporanKegiatan, SystemSettings, User } from '../types';

export interface PDFExportOptions {
  reports: LaporanKegiatan[];
  user?: User; // if personal export
  startDate: string;
  endDate: string;
  settings: SystemSettings;
  includeThumbnails?: boolean;
  titleSuffix?: string;
}

export const formatDateIndonesian = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      return `${day} ${months[monthIdx]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const generatePDFReport = async ({
  reports,
  user,
  startDate,
  endDate,
  settings,
  includeThumbnails = false,
  titleSuffix = '',
}: PDFExportOptions): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header / Kop Surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(settings.nama_kementerian.toUpperCase(), pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.nama_kampus.toUpperCase(), pageWidth / 2, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${settings.alamat_kampus}. Telp: ${settings.telepon}`, pageWidth / 2, 27, { align: 'center' });
  doc.text(`Email: ${settings.email} | Website: ${settings.website}`, pageWidth / 2, 31, { align: 'center' });

  // Double line separator for institutional letterhead
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(margin, 34, pageWidth - margin, 34);
  doc.setLineWidth(0.2);
  doc.line(margin, 35.2, pageWidth - margin, 35.2);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const docTitle = user
    ? 'LAPORAN KEGIATAN HARIAN PEGAWAI'
    : `REKAPITULASI LAPORAN KEGIATAN PEGAWAI ${titleSuffix}`.trim();
  doc.text(docTitle, pageWidth / 2, 43, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Periode: ${formatDateIndonesian(startDate)} s.d. ${formatDateIndonesian(endDate)}`,
    pageWidth / 2,
    48,
    { align: 'center' }
  );

  let startY = 54;

  // Personal employee info block if user is provided
  if (user) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, startY, pageWidth - margin * 2, 22, 1.5, 1.5, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Nama Lengkap', margin + 4, startY + 5.5);
    doc.text('NIP', margin + 4, startY + 10.5);
    doc.text('Jabatan', margin + 4, startY + 15.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`: ${user.nama}`, margin + 30, startY + 5.5);
    doc.text(`: ${user.nip}`, margin + 30, startY + 10.5);
    doc.text(`: ${user.jabatan}`, margin + 30, startY + 15.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Unit Kerja', margin + 100, startY + 5.5);
    doc.text('Total Laporan', margin + 100, startY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`: ${user.unit_kerja}`, margin + 125, startY + 5.5);
    doc.text(`: ${reports.length} Kegiatan`, margin + 125, startY + 10.5);

    startY += 26;
  }

  // Build table data
  const tableRows = reports.map((rep, index) => {
    const fotoLinks = rep.foto.length > 0
      ? rep.foto.map((f, i) => `Foto ${i + 1}`).join(' | ')
      : 'Tidak ada foto';

    return [
      (index + 1).toString(),
      formatDateIndonesian(rep.tanggal_kegiatan),
      rep.indikator_nama || '-',
      fotoLinks,
      rep.uraian || '-',
    ];
  });

  autoTable(doc, {
    startY,
    head: [['No', 'Tanggal Kegiatan', 'Indikator Kinerja', 'Link Foto Kegiatan', 'Uraian Kegiatan']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [202, 138, 4], // Amber/gold STABN theme
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      valign: 'top',
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26, halign: 'center' },
      2: { cellWidth: 42 },
      3: { cellWidth: 32, textColor: [2, 132, 199], halign: 'center' },
      4: { cellWidth: 'auto' },
    },
    didDrawCell: (data) => {
      // Add hyperlink to photo links if clicked
      if (data.section === 'body' && data.column.index === 3) {
        const report = reports[data.row.index];
        if (report && report.foto && report.foto.length > 0) {
          // Provide link hint
          const primaryUrl = report.foto[0].drive_file_id 
            ? `https://drive.google.com/file/d/${report.foto[0].drive_file_id}/view`
            : report.foto[0].file_url;
          
          if (primaryUrl && primaryUrl.startsWith('http')) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
              url: primaryUrl,
            });
          }
        }
      }
    },
  });

  // Calculate signature position
  // @ts-expect-error autoTable adds lastAutoTable to jsPDF instance
  let finalY = doc.lastAutoTable.finalY + 12;

  // Add new page if not enough room for signature
  if (finalY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    finalY = 25;
  }

  const currentDateIndo = formatDateIndonesian(new Date().toISOString().split('T')[0]);

  // Signature Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const leftSignX = margin + 10;
  const rightSignX = pageWidth - margin - 60;

  // Left Sign: Pegawai Yang Melaporkan
  if (user) {
    doc.text('Pegawai Yang Melaporkan,', leftSignX, finalY);
    doc.text(user.nama, leftSignX, finalY + 22);
    doc.setFont('helvetica', 'bold');
    doc.text(`NIP. ${user.nip}`, leftSignX, finalY + 26);
    doc.setFont('helvetica', 'normal');
  }

  // Right Sign: Mengetahui Pimpinan
  doc.text(`Wonogiri, ${currentDateIndo}`, rightSignX, finalY - 4);
  doc.text('Mengetahui / Mengesahkan,', rightSignX, finalY);
  doc.text(settings.jabatan_penandatangan, rightSignX, finalY + 4);
  doc.text(settings.pejabat_penandatangan, rightSignX, finalY + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`NIP. ${settings.nip_penandatangan}`, rightSignX, finalY + 26);

  // Download PDF
  const filename = user
    ? `Laporan_Kegiatan_${user.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${startDate}_${endDate}.pdf`
    : `Rekap_Laporan_Kegiatan_STABN_${startDate}_${endDate}.pdf`;

  doc.save(filename);
};
