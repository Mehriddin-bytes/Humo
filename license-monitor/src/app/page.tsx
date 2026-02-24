export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getLicenseStatus } from "@/lib/license-status";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LicenseStatusTable } from "@/components/dashboard/license-status-table";

export default async function DashboardPage() {
  const totalWorkers = await prisma.worker.count();

  const licenses = await prisma.license.findMany({
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
  });

  const requiredEntries = await prisma.workerRequiredLicenseType.findMany({
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
  });

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
        description="Overview of all worker licenses and their status"
      />
      <StatsCards
        totalWorkers={totalWorkers}
        totalLicenses={licenses.length}
        expiringSoon={expiringSoon}
        expired={expired}
      />
      <div>
        <h2 className="text-lg font-semibold mb-4">All Licenses</h2>
        <LicenseStatusTable licenses={licenses} missingLicenses={missingLicenses} />
      </div>
    </div>
  );
}
