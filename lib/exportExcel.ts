import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportReportsToExcel(reports: any[]) {
  const worksheetData = reports.map((r) => ({
    "ID Laporan": r.id,
    Deskripsi: r.deskripsi || "Tidak ada deskripsi",
    Kategori: r.category,
    Prioritas: r.label,
    Status: r.status,
    "Jumlah Dukungan": r.support_count || 0,
    "Tanggal Dibuat": new Date(r.created_at).toLocaleString("id-ID"),
    Lokasi: `${r.latitude}, ${r.longitude}`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, `Laporan_Ekspor_${new Date().getTime()}.xlsx`);
}
