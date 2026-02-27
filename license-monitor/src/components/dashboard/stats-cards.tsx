"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users,
  FileCheck,
  AlertTriangle,
  XCircle,
  FileX,
  ClipboardList,
  MoreHorizontal,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel, exportToPDF, type ExportData } from "@/lib/export";

interface StatsCardsProps {
  totalWorkers: number;
  totalLicenses: number;
  expiringSoon: number;
  expired: number;
  noLicenses: number;
  licensesNeeded: number;
  exports: Record<string, ExportData>;
}

export function StatsCards({
  totalWorkers,
  totalLicenses,
  expiringSoon,
  expired,
  noLicenses,
  licensesNeeded,
  exports,
}: StatsCardsProps) {
  async function handleExport(key: string, format: "csv" | "excel" | "pdf") {
    const data = exports[key];
    if (!data || data.rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    try {
      if (format === "csv") {
        exportToCSV(data);
        toast.success("CSV downloaded");
      } else if (format === "excel") {
        await exportToExcel(data);
        toast.success("Excel downloaded");
      } else {
        exportToPDF(data);
        toast.success("Print dialog opened");
      }
    } catch {
      toast.error("Export failed");
    }
  }

  const cards = [
    {
      title: "Total Employees",
      value: totalWorkers,
      description: "View all employees",
      icon: Users,
      color: "text-blue-600",
      bgHover:
        "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
      href: "/workers",
      exportKey: "employees",
    },
    {
      title: totalLicenses === 1 ? "Total License" : "Total Licenses",
      value: totalLicenses,
      description: "View by license type",
      icon: FileCheck,
      color: "text-green-600",
      bgHover:
        "hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20",
      href: "/license-types",
      exportKey: "licenses",
    },
    {
      title: "Licenses Needed",
      value: licensesNeeded,
      description: `${noLicenses} missing, ${expiringSoon} expiring`,
      icon: ClipboardList,
      color: "text-purple-600",
      bgHover:
        "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
      href: "/licenses-needed",
      exportKey: "licensesNeeded",
    },
    {
      title: noLicenses === 1 ? "No License" : "No Licenses",
      value: noLicenses,
      description: "Missing required",
      icon: FileX,
      color: "text-gray-600",
      bgHover:
        "hover:border-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-950/20",
      href: "/licenses-needed",
      exportKey: "noLicenses",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon,
      description: "Within 90 days",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgHover:
        "hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
      href: "/expiring",
      exportKey: "expiring",
    },
    {
      title: "Expired",
      value: expired,
      description: "Needs renewal",
      icon: XCircle,
      color: "text-red-600",
      bgHover:
        "hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20",
      href: "/expired",
      exportKey: "expired",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`transition-all duration-200 ${card.bgHover} group relative`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Link href={card.href} className="hover:underline">
                {card.title}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-1">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={card.href}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExport(card.exportKey, "excel")}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(card.exportKey, "csv")}>
                    <FileText className="mr-2 h-4 w-4" />
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(card.exportKey, "pdf")}>
                    <Printer className="mr-2 h-4 w-4" />
                    PDF (Print)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={card.href}>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
