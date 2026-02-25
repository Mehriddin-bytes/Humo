export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLicenseStatus } from "@/lib/license-status";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { LicenseRowActions } from "@/components/shared/license-row-actions";

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

  // Group by urgency level
  const critical = expiring.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "critical"
  );
  const warning = expiring.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "warning"
  );
  const caution = expiring.filter(
    (l) => getLicenseStatus(l.expiryDate).status === "caution"
  );

  // Group by worker
  const workerMap = new Map<
    string,
    { worker: (typeof expiring)[0]["worker"]; licenses: typeof expiring }
  >();
  for (const license of expiring) {
    const existing = workerMap.get(license.workerId);
    if (existing) {
      existing.licenses.push(license);
    } else {
      workerMap.set(license.workerId, {
        worker: license.worker,
        licenses: [license],
      });
    }
  }

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
          description={`${expiring.length} license${expiring.length !== 1 ? "s" : ""} expiring within 90 days across ${workerMap.size} worker${workerMap.size !== 1 ? "s" : ""}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <div className="text-sm font-medium text-red-800 dark:text-red-400">
            Critical (≤30 days)
          </div>
          <div className="text-2xl font-bold text-red-600">{critical.length}</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
          <div className="text-sm font-medium text-orange-800 dark:text-orange-400">
            Warning (31–60 days)
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {warning.length}
          </div>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
            Caution (61–90 days)
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {caution.length}
          </div>
        </div>
      </div>

      {Array.from(workerMap.values())
        .sort((a, b) => {
          // Sort by most urgent license first
          const aMin = Math.min(
            ...a.licenses.map((l) => getLicenseStatus(l.expiryDate).daysUntil)
          );
          const bMin = Math.min(
            ...b.licenses.map((l) => getLicenseStatus(l.expiryDate).daysUntil)
          );
          return aMin - bMin;
        })
        .map(({ worker, licenses }) => (
          <div key={worker.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/workers/${worker.id}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {worker.firstName} {worker.lastName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {[worker.position, worker.phone, worker.email]
                    .filter(Boolean)
                    .join(" · ") || "No contact info"}
                </p>
              </div>
              <Badge variant="orange">{licenses.length} expiring</Badge>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>License Type</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses
                    .sort(
                      (a, b) =>
                        getLicenseStatus(a.expiryDate).daysUntil -
                        getLicenseStatus(b.expiryDate).daysUntil
                    )
                    .map((license) => {
                      const { daysUntil } = getLicenseStatus(license.expiryDate);
                      return (
                        <TableRow key={license.id}>
                          <TableCell>
                            <LicenseRowActions
                              workerId={license.workerId}
                              licenseId={license.id}
                              licenseTypeName={license.licenseType.name}
                              workerFirstName={license.worker.firstName}
                              workerName={`${license.worker.firstName} ${license.worker.lastName}`}
                              showProfile={false}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {license.licenseType.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {license.code || "—"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(license.issueDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(license.expiryDate),
                              "MMM d, yyyy"
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {daysUntil} days
                          </TableCell>
                          <TableCell>
                            <StatusBadge expiryDate={license.expiryDate} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

      {expiring.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No licenses expiring within 90 days. Everything looks good.
        </div>
      )}
    </div>
  );
}
