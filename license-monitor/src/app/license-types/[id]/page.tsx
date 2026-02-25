import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getLicenseStatus } from "@/lib/license-status";
import { LicenseRowActions } from "@/components/shared/license-row-actions";

export default async function LicenseTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const licenseType = await prisma.licenseType.findUnique({
    where: { id },
    include: {
      licenses: {
        where: { status: "active" },
        include: {
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
      },
    },
  });

  if (!licenseType) notFound();

  const uniqueWorkers = new Set(
    licenseType.licenses.map((l) => l.workerId)
  ).size;

  let expired = 0;
  let expiringSoon = 0;
  let valid = 0;

  for (const license of licenseType.licenses) {
    const { status } = getLicenseStatus(license.expiryDate);
    if (status === "expired") expired++;
    else if (
      status === "critical" ||
      status === "warning" ||
      status === "caution"
    )
      expiringSoon++;
    else valid++;
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/license-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to License Types
          </Link>
        </Button>
        <PageHeader
          title={licenseType.name}
          description={licenseType.description || undefined}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenseType.licenses.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{valid}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Employees with this license
        </h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenseType.licenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No employees have this license yet
                  </TableCell>
                </TableRow>
              ) : (
                licenseType.licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <LicenseRowActions
                        workerId={license.worker.id}
                        licenseId={license.id}
                        licenseTypeName={licenseType.name}
                        workerFirstName={license.worker.firstName}
                        workerName={`${license.worker.firstName} ${license.worker.lastName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/workers/${license.worker.id}`}
                        className="font-medium hover:underline"
                      >
                        {license.worker.firstName} {license.worker.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {license.worker.position || "—"}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
