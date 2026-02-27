"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  type ExportData,
} from "@/lib/export";

interface ExportButtonProps {
  data: ExportData;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const isEmpty = data.rows.length === 0;

  async function handleExport(format: "csv" | "excel" | "pdf") {
    if (isEmpty) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      switch (format) {
        case "csv":
          exportToCSV(data);
          toast.success("CSV file downloaded");
          break;
        case "excel":
          await exportToExcel(data);
          toast.success("Excel file downloaded");
          break;
        case "pdf":
          exportToPDF(data);
          toast.success("Print dialog opened");
          break;
      }
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || isEmpty}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <Printer className="mr-2 h-4 w-4" />
          PDF (Print)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
