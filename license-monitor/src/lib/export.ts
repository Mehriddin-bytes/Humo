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

export function exportToPDF(data: ExportData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to export as PDF.");
    return;
  }

  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headerCells =
    `<th class="row-num">#</th>` +
    data.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");

  const bodyRows = data.rows
    .map((row, idx) => {
      const cells = row
        .map((cell, colIdx) => {
          const cls = getStatusClass(cell, colIdx, data.headers);
          return `<td${cls ? ` class="${cls}"` : ""}>${escapeHtml(cell || "—")}</td>`;
        })
        .join("");
      return `<tr><td class="row-num">${idx + 1}</td>${cells}</tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(data.title)} — WPL License Monitor</title>
  <style>
    @page {
      size: landscape;
      margin: 15mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      padding: 32px 40px;
      color: #1e293b;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Header */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 3px solid #1f2937;
    }
    .report-header .brand {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .report-header h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .report-header .meta {
      text-align: right;
      font-size: 10px;
      color: #64748b;
      line-height: 1.6;
    }
    .report-header .meta strong {
      color: #334155;
    }

    /* Summary bar */
    .summary {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      padding: 10px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 11px;
      color: #475569;
    }
    .summary .stat {
      font-weight: 700;
      color: #0f172a;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      border: 1px solid #cbd5e1;
    }
    thead { background: #1f2937; }
    th {
      padding: 9px 12px;
      text-align: left;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #f1f5f9;
      border: 1px solid #374151;
      white-space: nowrap;
    }
    td {
      padding: 7px 12px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #f1f5f9; }

    /* Row number */
    .row-num {
      text-align: center;
      color: #94a3b8;
      font-size: 9px;
      width: 30px;
      min-width: 30px;
    }

    /* Status colors */
    .status-expired { color: #dc2626; font-weight: 700; }
    .status-critical { color: #dc2626; font-weight: 600; }
    .status-warning { color: #ea580c; font-weight: 600; }
    .status-caution { color: #ca8a04; font-weight: 600; }
    .status-valid { color: #16a34a; font-weight: 600; }
    .status-missing { color: #1e293b; font-weight: 700; background: #fef2f2; }

    /* Footer */
    .report-footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }

    @media print {
      body { padding: 0; }
      .report-header { page-break-after: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <div class="brand">WPL License Monitor</div>
      <h1>${escapeHtml(data.title)}</h1>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${now}</div>
      <div><strong>Records:</strong> ${data.rows.length}</div>
    </div>
  </div>

  <div class="summary">
    <span>Total: <span class="stat">${data.rows.length}</span> records</span>
    ${buildSummaryStats(data)}
  </div>

  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>

  <div class="report-footer">
    <span>WPL License Monitor — Confidential</span>
    <span>Generated ${now}</span>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
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

function getStatusClass(
  cell: string,
  colIdx: number,
  headers: string[]
): string {
  const header = headers[colIdx]?.toLowerCase() || "";
  if (header !== "status" && !header.includes("days left")) return "";

  const lower = cell.toLowerCase();
  if (lower === "expired") return "status-expired";
  if (lower === "missing") return "status-missing";
  if (lower === "valid") return "status-valid";
  if (lower.includes("d left")) {
    const days = parseInt(lower);
    if (!isNaN(days)) {
      if (days <= 30) return "status-critical";
      if (days <= 60) return "status-warning";
      if (days <= 90) return "status-caution";
    }
  }
  return "";
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

function buildSummaryStats(data: ExportData): string {
  const statusIdx = data.headers.findIndex(
    (h) => h.toLowerCase() === "status"
  );
  if (statusIdx === -1) return "";

  const counts: Record<string, number> = {};
  for (const row of data.rows) {
    const val = row[statusIdx] || "Unknown";
    const key = val.includes("d left") ? "Expiring" : val;
    counts[key] = (counts[key] || 0) + 1;
  }

  return Object.entries(counts)
    .map(
      ([label, count]) =>
        `<span>${label}: <span class="stat">${count}</span></span>`
    )
    .join("");
}
