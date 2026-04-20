"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  filename: string;
}

export default function ExportButtons({ data, columns, filename }: ExportButtonsProps) {
  function exportExcel() {
    const rows = data.map((row) =>
      Object.fromEntries(columns.map((col) => [col.label, row[col.key] ?? ""]))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  function exportPDF() {
    const doc = new jsPDF();
    const headers = columns.map((c) => c.label);
    const rows = data.map((row) => columns.map((col) => String(row[col.key] ?? "")));
    autoTable(doc, { head: [headers], body: rows });
    doc.save(`${filename}.pdf`);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportExcel}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
      >
        Excel
      </button>
      <button
        onClick={exportPDF}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
      >
        PDF
      </button>
      <button
        onClick={handlePrint}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
      >
        Print
      </button>
    </div>
  );
}
