export interface ExportData {
  title: string;
  headers: string[];
  rows: string[][];
}

export function exportToCSV(data: ExportData): void {
  const escapeCell = (cell: string): string => {
    if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const lines: string[] = [];
  lines.push(data.headers.map(escapeCell).join(","));
  for (const row of data.rows) {
    lines.push(row.map(escapeCell).join(","));
  }

  const csvContent = lines.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${data.title}.csv`);
}

export async function exportToExcel(data: ExportData): Promise<void> {
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headerCells = data.headers
    .map(
      (h) =>
        `<td style="background-color:#1f2937; color:#ffffff; font-weight:700; font-size:11pt; padding:8px 14px; border:1px solid #374151; text-align:left;">${escapeHtml(h)}</td>`
    )
    .join("");

  const bodyRows = data.rows
    .map((row, rowIdx) => {
      const bg = rowIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
      const cells = row
        .map((cell, colIdx) => {
          const statusColor = getStatusCellStyle(cell, colIdx, data.headers);
          return `<td style="background-color:${bg}; padding:6px 14px; border:1px solid #e2e8f0; font-size:10pt; ${statusColor}">${escapeHtml(cell || "—")}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const colCount = data.headers.length;

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>${escapeHtml(data.title.slice(0, 31))}</x:Name>
    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
  </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
  <table>
    <tr>
      <td colspan="${colCount}" style="background-color:#f8fafc; padding:14px; font-size:16pt; font-weight:700; color:#0f172a; border-bottom:3px solid #1f2937;">
        ${escapeHtml(data.title)}
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#f8fafc; padding:6px 14px 14px; font-size:9pt; color:#64748b; border-bottom:1px solid #e2e8f0;">
        Generated on ${now} &mdash; ${data.rows.length} record${data.rows.length !== 1 ? "s" : ""}
      </td>
    </tr>
    <tr>${headerCells}</tr>
    ${bodyRows}
  </table>
</body>
</html>`;

  const blob = new Blob(["\uFEFF" + html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  downloadBlob(blob, `${data.title}.xls`);
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header ---
  doc.setFillColor(31, 41, 55);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(data.title, 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text("WPL License Monitor", 14, 17);

  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${now}  |  ${data.rows.length} records`, pageWidth - 14, 11, { align: "right" });

  // --- Summary bar ---
  const summaryStats = getSummaryStatsText(data);
  if (summaryStats) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 26, pageWidth - 28, 8, 1.5, 1.5, "FD");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(summaryStats, 18, 31);
  }

  const startY = summaryStats ? 38 : 28;

  // --- Status column index ---
  const statusIdx = data.headers.findIndex((h) => h.toLowerCase() === "status");
  const daysLeftIdx = data.headers.findIndex((h) => h.toLowerCase().includes("days left"));

  // --- Table ---
  autoTable(doc, {
    head: [["#", ...data.headers]],
    body: data.rows.map((row, idx) => [String(idx + 1), ...row.map((c) => c || "—")]),
    startY,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [51, 65, 85],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: [241, 245, 249],
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8, textColor: [148, 163, 184], fontSize: 6.5 },
    },
    didParseCell(hookData) {
      if (hookData.section !== "body") return;
      const colIdx = hookData.column.index - 1; // offset by row number column
      const cellText = String(hookData.cell.raw || "");
      const lower = cellText.toLowerCase();

      const isStatus = colIdx === statusIdx;
      const isDaysLeft = colIdx === daysLeftIdx;

      if (isStatus || isDaysLeft) {
        if (lower === "expired") {
          hookData.cell.styles.textColor = [220, 38, 38];
          hookData.cell.styles.fontStyle = "bold";
        } else if (lower === "missing") {
          hookData.cell.styles.textColor = [30, 41, 59];
          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.fillColor = [254, 242, 242];
        } else if (lower === "valid") {
          hookData.cell.styles.textColor = [22, 163, 74];
          hookData.cell.styles.fontStyle = "bold";
        } else if (lower.includes("d left") || isDaysLeft) {
          const days = parseInt(lower);
          if (!isNaN(days)) {
            if (days <= 30) {
              hookData.cell.styles.textColor = [220, 38, 38];
              hookData.cell.styles.fontStyle = "bold";
            } else if (days <= 60) {
              hookData.cell.styles.textColor = [234, 88, 12];
              hookData.cell.styles.fontStyle = "bold";
            } else if (days <= 90) {
              hookData.cell.styles.textColor = [202, 138, 4];
              hookData.cell.styles.fontStyle = "bold";
            }
          }
        }
      }
    },
    didDrawPage(hookData) {
      const pageH = doc.internal.pageSize.getHeight();
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageH - 10, pageWidth - 14, pageH - 10);
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("WPL License Monitor — Confidential", 14, pageH - 6);
      doc.text(
        `Page ${hookData.pageNumber}`,
        pageWidth - 14,
        pageH - 6,
        { align: "right" }
      );
    },
  });

  // Open in new tab
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}

// --- Internal helpers ---

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSummaryStatsText(data: ExportData): string {
  const statusIdx = data.headers.findIndex(
    (h) => h.toLowerCase() === "status"
  );
  if (statusIdx === -1) return `Total: ${data.rows.length} records`;

  const counts: Record<string, number> = {};
  for (const row of data.rows) {
    const val = row[statusIdx] || "Unknown";
    const key = val.includes("d left") ? "Expiring" : val;
    counts[key] = (counts[key] || 0) + 1;
  }

  const parts = [`Total: ${data.rows.length} records`];
  for (const [label, count] of Object.entries(counts)) {
    parts.push(`${label}: ${count}`);
  }
  return parts.join("   |   ");
}

function getStatusCellStyle(
  cell: string,
  colIdx: number,
  headers: string[]
): string {
  const header = headers[colIdx]?.toLowerCase() || "";
  if (header !== "status" && !header.includes("days left")) return "";

  const lower = cell.toLowerCase();
  if (lower === "expired")
    return "color:#dc2626; font-weight:700;";
  if (lower === "missing")
    return "color:#1e293b; font-weight:700; background-color:#fef2f2;";
  if (lower === "valid")
    return "color:#16a34a; font-weight:700;";
  if (lower.includes("d left")) {
    const days = parseInt(lower);
    if (!isNaN(days)) {
      if (days <= 30) return "color:#dc2626; font-weight:600;";
      if (days <= 60) return "color:#ea580c; font-weight:600;";
      if (days <= 90) return "color:#ca8a04; font-weight:600;";
    }
  }
  return "";
}

