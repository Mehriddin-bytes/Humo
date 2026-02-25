export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { getLicenseStatus } from "@/lib/license-status";
import { LicensesNeededList } from "./licenses-needed-list";

export default async function LicensesNeededPage() {
  const [licenses, requiredEntries] = await Promise.all([
    prisma.license.findMany({
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
    }),
    prisma.workerRequiredLicenseType.findMany({
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
    }),
  ]);

  // Missing licenses
  const activeLicenseKeys = new Set(
    licenses.map((l) => `${l.workerId}:${l.licenseTypeId}`)
  );
  const missingLicenses = requiredEntries
    .filter(
      (req) => !activeLicenseKeys.has(`${req.workerId}:${req.licenseTypeId}`)
    )
    .map((req) => ({
      licenseTypeId: req.licenseTypeId,
      licenseTypeName: req.licenseType.name,
      worker: req.worker,
    }));

  // Expiring licenses (within 90 days)
  const expiringLicenses = licenses.filter((l) => {
    const { status } = getLicenseStatus(l.expiryDate);
    return status === "critical" || status === "warning" || status === "caution";
  });

  // Serialize dates for client component
  const serializedExpiring = expiringLicenses.map((l) => ({
    id: l.id,
    code: l.code,
    licenseTypeId: l.licenseTypeId,
    licenseTypeName: l.licenseType.name,
    expiryDate: l.expiryDate.toISOString(),
    worker: l.worker,
  }));

  const totalNeeded = missingLicenses.length + expiringLicenses.length;

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
          title="Licenses to Renew / Get"
          description={`${totalNeeded} license${totalNeeded !== 1 ? "s" : ""} needed — ${missingLicenses.length} missing, ${expiringLicenses.length} expiring soon`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/20">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-400">
            Missing (No License)
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {missingLicenses.length}
          </div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
          <div className="text-sm font-medium text-orange-800 dark:text-orange-400">
            Expiring (Within 90 days)
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {expiringLicenses.length}
          </div>
        </div>
      </div>

      <LicensesNeededList
        missingLicenses={missingLicenses}
        expiringLicenses={serializedExpiring}
      />

      {totalNeeded === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No licenses needed right now. All employees are covered.
        </div>
      )}
    </div>
  );
}
