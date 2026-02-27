export const dynamic = "force-dynamic";

import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getLicenseStatus } from "@/lib/license-status";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LicenseStatusTable } from "@/components/dashboard/license-status-table";
import type { ExportData } from "@/lib/export";

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
  const expiringLicenses: typeof licenses = [];
  const expiredLicenses: typeof licenses = [];

  for (const license of licenses) {
    const { status } = getLicenseStatus(license.expiryDate);
    if (status === "expired") {
      expired++;
      expiredLicenses.push(license);
    }
    if (status === "critical" || status === "warning" || status === "caution") {
      expiringSoon++;
      expiringLicenses.push(license);
    }
  }

  // Build export data for each card
  const exports: Record<string, ExportData> = {
    employees: {
      title: "Employees",
      headers: ["Name", "Position", "Phone", "Email"],
      rows: workers.map((w) => [
        `${w.firstName} ${w.lastName}`,
        w.position || "",
        w.phone || "",
        w.email || "",
      ]),
    },
    licenses: {
      title: "All Licenses",
      headers: ["Employee", "License Type", "Code", "Issue Date", "Expiry Date", "Status"],
      rows: licenses.map((l) => {
        const { label } = getLicenseStatus(l.expiryDate);
        return [
          `${l.worker.firstName} ${l.worker.lastName}`,
          l.licenseType.name,
          l.code || "",
          format(new Date(l.issueDate), "MMM d, yyyy"),
          format(new Date(l.expiryDate), "MMM d, yyyy"),
          label,
        ];
      }),
    },
    licensesNeeded: {
      title: "Licenses Needed",
      headers: ["License Type", "Employee", "Position", "Status", "Expiry Date"],
      rows: [
        ...missingLicenses.map((m) => [
          m.licenseTypeName,
          `${m.worker.firstName} ${m.worker.lastName}`,
          m.worker.position || "",
          "Missing",
          "",
        ]),
        ...expiringLicenses.map((l) => {
          const { daysUntil } = getLicenseStatus(l.expiryDate);
          return [
            l.licenseType.name,
            `${l.worker.firstName} ${l.worker.lastName}`,
            l.worker.position || "",
            "Expiring",
            `${format(new Date(l.expiryDate), "MMM d, yyyy")} (${daysUntil}d left)`,
          ];
        }),
      ],
    },
    noLicenses: {
      title: "No Licenses",
      headers: ["License Type", "Employee", "Position"],
      rows: missingLicenses.map((m) => [
        m.licenseTypeName,
        `${m.worker.firstName} ${m.worker.lastName}`,
        m.worker.position || "",
      ]),
    },
    expiring: {
      title: "Expiring Licenses",
      headers: ["Employee", "License Type", "Code", "Issue Date", "Expiry Date", "Days Left", "Status"],
      rows: expiringLicenses.map((l) => {
        const { daysUntil, label } = getLicenseStatus(l.expiryDate);
        return [
          `${l.worker.firstName} ${l.worker.lastName}`,
          l.licenseType.name,
          l.code || "",
          format(new Date(l.issueDate), "MMM d, yyyy"),
          format(new Date(l.expiryDate), "MMM d, yyyy"),
          `${daysUntil} days`,
          label,
        ];
      }),
    },
    expired: {
      title: "Expired Licenses",
      headers: ["Employee", "License Type", "Code", "Issue Date", "Expiry Date", "Status"],
      rows: expiredLicenses.map((l) => {
        const { label } = getLicenseStatus(l.expiryDate);
        return [
          `${l.worker.firstName} ${l.worker.lastName}`,
          l.licenseType.name,
          l.code || "",
          format(new Date(l.issueDate), "MMM d, yyyy"),
          format(new Date(l.expiryDate), "MMM d, yyyy"),
          label,
        ];
      }),
    },
  };

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
        exports={exports}
      />
      <LicenseStatusTable
        licenses={licenses}
        missingLicenses={missingLicenses}
        workers={workers}
      />
    </div>
  );
}
