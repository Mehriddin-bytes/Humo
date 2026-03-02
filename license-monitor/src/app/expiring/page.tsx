export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { getLicenseStatus } from "@/lib/license-status";
import { ExportButton } from "@/components/shared/export-button";
import { ExpiringList } from "./expiring-list";

export default async function ExpiringPage() {
  const allLicenses = await prisma.license.findMany({
    where: { status: "active" },
    include: {
      licenseType: true,
      worker: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          position: true,
        },
      },
    },
    orderBy: { expiryDate: "asc" },
  });

  const expiring = allLicenses.filter((l) => {
    const { status } = getLicenseStatus(l.expiryDate);
    return status === "critical" || status === "warning" || status === "caution";
  });

  // Group by urgency level for summary cards
  const critical = expiring.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "critical"
  );
  const warning = expiring.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "warning"
  );
  const caution = expiring.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "caution"
  );

  const uniqueWorkers = new Set(expiring.map((l) => l.workerId)).size;

  // Serialize for client component
  const serializedLicenses = expiring.map((l) => ({
    id: l.id,
    code: l.code,
    workerId: l.workerId,
    issueDate: l.issueDate.toISOString(),
    expiryDate: l.expiryDate.toISOString(),
    licenseTypeName: l.licenseType.name,
    licenseTypeId: l.licenseTypeId,
    worker: l.worker,
  }));

  // Sort by employee name for grouped export
  const sortedForExport = [...expiring].sort((a, b) => {
    const aName = `${a.worker.firstName} ${a.worker.lastName}`;
    const bName = `${b.worker.firstName} ${b.worker.lastName}`;
    const cmp = aName.localeCompare(bName);
    if (cmp !== 0) return cmp;
    return getLicenseStatus(a.expiryDate).daysUntil - getLicenseStatus(b.expiryDate).daysUntil;
  });

  const exportData = {
    title: "Expiring Licenses",
    headers: ["Employee", "License Type", "Code", "Issue Date", "Expiry Date", "Days Left", "Status"],
    groupColumn: 0,
    rows: sortedForExport.map((license) => {
      const { daysUntil, label } = getLicenseStatus(license.expiryDate);
      return [
        `${license.worker.firstName} ${license.worker.lastName}`,
        license.licenseType.name,
        license.code || "",
        format(new Date(license.issueDate), "MMM d, yyyy"),
        format(new Date(license.expiryDate), "MMM d, yyyy"),
        `${daysUntil} days`,
        label,
      ];
    }),
  };

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <PageHeader
          title="Expiring Soon"
          description={`${expiring.length} license${expiring.length !== 1 ? "s" : ""} expiring within 90 days across ${uniqueWorkers} worker${uniqueWorkers !== 1 ? "s" : ""}`}
        >
          <ExportButton data={exportData} />
        </PageHeader>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <div className="text-sm font-medium text-red-800 dark:text-red-400">
            Critical (&le;30 days)
          </div>
          <div className="text-2xl font-bold text-red-600">{critical.length}</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
          <div className="text-sm font-medium text-orange-800 dark:text-orange-400">
            Warning (31&ndash;60 days)
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {warning.length}
          </div>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
            Caution (61&ndash;90 days)
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {caution.length}
          </div>
        </div>
      </div>

      <ExpiringList licenses={serializedLicenses} />
    </div>
  );
}
