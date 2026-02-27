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
import { ExportButton } from "@/components/shared/export-button";

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

  // Group by worker to show how many expired licenses each worker has
  const workerMap = new Map<
    string,
    { worker: (typeof expired)[0]["worker"]; licenses: typeof expired }
  >();
  for (const license of expired) {
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
          description={`${expired.length} license${expired.length !== 1 ? "s" : ""} have expired across ${workerMap.size} worker${workerMap.size !== 1 ? "s" : ""}`}
        >
          <ExportButton data={exportData} />
        </PageHeader>
      </div>

      {Array.from(workerMap.values()).map(({ worker, licenses }) => (
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
            <Badge variant="destructive">
              {licenses.length} expired
            </Badge>
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => (
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
                      {format(new Date(license.expiryDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge expiryDate={license.expiryDate} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {expired.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No expired licenses. All licenses are up to date.
        </div>
      )}
    </div>
  );
}
