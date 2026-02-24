export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getLicenseStatus } from "@/lib/license-status";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LicenseStatusTable } from "@/components/dashboard/license-status-table";

export default async function DashboardPage() {
  const [totalWorkers, licenses] = await Promise.all([
    prisma.worker.count(),
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
  ]);

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
        <LicenseStatusTable licenses={licenses} />
      </div>
    </div>
  );
}
