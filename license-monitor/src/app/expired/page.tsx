export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { getLicenseStatus } from "@/lib/license-status";
import { ExportButton } from "@/components/shared/export-button";
import { ExpiredList } from "./expired-list";

export default async function ExpiredPage() {
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

  const expired = allLicenses.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "expired"
  );

  const uniqueWorkers = new Set(expired.map((l) => l.workerId)).size;

  // Serialize for client component
  const serializedLicenses = expired.map((l) => ({
    id: l.id,
    code: l.code,
    workerId: l.workerId,
    issueDate: l.issueDate.toISOString(),
    expiryDate: l.expiryDate.toISOString(),
    licenseTypeName: l.licenseType.name,
    licenseTypeId: l.licenseTypeId,
    worker: l.worker,
  }));

  const exportData = {
    title: "Expired Licenses",
    headers: ["Employee", "License Type", "Code", "Issue Date", "Expiry Date", "Status"],
    rows: expired.map((license) => {
      const { label } = getLicenseStatus(license.expiryDate);
      return [
        `${license.worker.firstName} ${license.worker.lastName}`,
        license.licenseType.name,
        license.code || "",
        format(new Date(license.issueDate), "MMM d, yyyy"),
        format(new Date(license.expiryDate), "MMM d, yyyy"),
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
          title="Expired Licenses"
          description={`${expired.length} license${expired.length !== 1 ? "s" : ""} have expired across ${uniqueWorkers} worker${uniqueWorkers !== 1 ? "s" : ""}`}
        >
          <ExportButton data={exportData} />
        </PageHeader>
      </div>

      <ExpiredList licenses={serializedLicenses} />
    </div>
  );
}
