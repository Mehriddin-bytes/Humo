export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getLicenseStatus } from "@/lib/license-status";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LicenseStatusTable } from "@/components/dashboard/license-status-table";

export default async function DashboardPage() {
  const [workers, licenses, requiredEntries] = await Promise.all([
    prisma.worker.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.license.findMany({
      where: { status: "active" },
      include: {
        licenseType: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
            email: true,
            phone: true,
            position: true,
          },
        },
      },
    }),
  ]);

  const totalWorkers = workers.length;

  // Find required license types where the worker has no active license
  const activeLicenseKeys = new Set(
    licenses.map((l) => `${l.workerId}:${l.licenseTypeId}`)
  );
  const missingLicenses = requiredEntries
    .filter((req) => !activeLicenseKeys.has(`${req.workerId}:${req.licenseTypeId}`))
    .map((req) => ({
      licenseTypeId: req.licenseTypeId,
      licenseTypeName: req.licenseType.name,
      worker: req.worker,
    }));

  let expired = 0;
  let expiringSoon = 0;

  for (const license of licenses) {
    const { status } = getLicenseStatus(license.expiryDate);
    if (status === "expired") expired++;
    if (status === "critical" || status === "warning" || status === "caution")
      expiringSoon++;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of all employee licenses and their status"
      />
      <StatsCards
        totalWorkers={totalWorkers}
        totalLicenses={licenses.length}
        expiringSoon={expiringSoon}
        expired={expired}
        noLicenses={missingLicenses.length}
        licensesNeeded={missingLicenses.length + expiringSoon}
      />
      <LicenseStatusTable
        licenses={licenses}
        missingLicenses={missingLicenses}
        workers={workers}
      />
    </div>
  );
}
