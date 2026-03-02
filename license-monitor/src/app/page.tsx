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

  // Sort helpers for export ordering
  const sortedMissing = [...missingLicenses].sort((a, b) => {
    const cmp = a.licenseTypeName.localeCompare(b.licenseTypeName);
    if (cmp !== 0) return cmp;
    return `${a.worker.firstName} ${a.worker.lastName}`.localeCompare(
      `${b.worker.firstName} ${b.worker.lastName}`
    );
  });

  const sortedLicenses = [...licenses].sort((a, b) => {
    const aName = `${a.worker.firstName} ${a.worker.lastName}`;
    const bName = `${b.worker.firstName} ${b.worker.lastName}`;
    const cmp = aName.localeCompare(bName);
    if (cmp !== 0) return cmp;
    return a.licenseType.name.localeCompare(b.licenseType.name);
  });

  const sortedExpired = [...expiredLicenses].sort((a, b) => {
    const aName = `${a.worker.firstName} ${a.worker.lastName}`;
    const bName = `${b.worker.firstName} ${b.worker.lastName}`;
    const cmp = aName.localeCompare(bName);
    if (cmp !== 0) return cmp;
    return a.licenseType.name.localeCompare(b.licenseType.name);
  });

  const sortedExpiringByEmployee = [...expiringLicenses].sort((a, b) => {
    const aName = `${a.worker.firstName} ${a.worker.lastName}`;
    const bName = `${b.worker.firstName} ${b.worker.lastName}`;
    const cmp = aName.localeCompare(bName);
    if (cmp !== 0) return cmp;
    return getLicenseStatus(a.expiryDate).daysUntil - getLicenseStatus(b.expiryDate).daysUntil;
  });

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
      groupColumn: 0,
      rows: sortedLicenses.map((l) => {
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
    licensesNeeded: (() => {
      // Group by license type, then list missing + expiring together within each type
      const typeMap = new Map<string, { missing: typeof missingLicenses; expiring: typeof expiringLicenses }>();
      for (const m of missingLicenses) {
        if (!typeMap.has(m.licenseTypeName)) typeMap.set(m.licenseTypeName, { missing: [], expiring: [] });
        typeMap.get(m.licenseTypeName)!.missing.push(m);
      }
      for (const l of expiringLicenses) {
        if (!typeMap.has(l.licenseType.name)) typeMap.set(l.licenseType.name, { missing: [], expiring: [] });
        typeMap.get(l.licenseType.name)!.expiring.push(l);
      }
      const rows: string[][] = [];
      for (const typeName of Array.from(typeMap.keys()).sort((a, b) => a.localeCompare(b))) {
        const group = typeMap.get(typeName)!;
        const sortedM = [...group.missing].sort((a, b) =>
          `${a.worker.firstName} ${a.worker.lastName}`.localeCompare(`${b.worker.firstName} ${b.worker.lastName}`)
        );
        const sortedE = [...group.expiring].sort((a, b) =>
          getLicenseStatus(a.expiryDate).daysUntil - getLicenseStatus(b.expiryDate).daysUntil
        );
        for (const m of sortedM) {
          rows.push([typeName, `${m.worker.firstName} ${m.worker.lastName}`, m.worker.position || "", "Missing", ""]);
        }
        for (const l of sortedE) {
          const { daysUntil } = getLicenseStatus(l.expiryDate);
          rows.push([typeName, `${l.worker.firstName} ${l.worker.lastName}`, l.worker.position || "", "Expiring", `${format(new Date(l.expiryDate), "MMM d, yyyy")} (${daysUntil}d left)`]);
        }
      }
      return {
        title: "Licenses Needed",
        headers: ["License Type", "Employee", "Position", "Status", "Expiry Date"],
        rows,
        groupColumn: 0,
      };
    })(),
    noLicenses: {
      title: "No Licenses",
      headers: ["License Type", "Employee", "Position"],
      groupColumn: 0,
      rows: sortedMissing.map((m) => [
        m.licenseTypeName,
        `${m.worker.firstName} ${m.worker.lastName}`,
        m.worker.position || "",
      ]),
    },
    expiring: {
      title: "Expiring Licenses",
      headers: ["Employee", "License Type", "Code", "Issue Date", "Expiry Date", "Days Left", "Status"],
      groupColumn: 0,
      rows: sortedExpiringByEmployee.map((l) => {
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
      groupColumn: 0,
      rows: sortedExpired.map((l) => {
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
