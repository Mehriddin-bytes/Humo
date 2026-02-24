export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
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
import { getLicenseStatus } from "@/lib/license-status";
import { FileCheck, CheckCircle, CircleOff } from "lucide-react";

export default async function LicenseTypesPage() {
  const licenseTypes = await prisma.licenseType.findMany({
    include: {
      licenses: {
        where: { status: "active" },
        include: {
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalTypes = licenseTypes.length;
  const typesInUse = licenseTypes.filter(
    (lt) => lt.licenses.length > 0
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="License Types"
        description="Overview of all license categories and their usage"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total License Types
            </CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTypes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types In Use</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typesInUse}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unused Types</CardTitle>
            <CircleOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTypes - typesInUse}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Total Licenses</TableHead>
              <TableHead className="text-center">Workers</TableHead>
              <TableHead className="text-center">Expired</TableHead>
              <TableHead className="text-center">Expiring Soon</TableHead>
              <TableHead className="text-center">Valid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenseTypes.map((lt) => {
              const uniqueWorkers = new Set(
                lt.licenses.map((l) => l.workerId)
              ).size;

              let expired = 0;
              let expiringSoon = 0;
              let valid = 0;

              for (const license of lt.licenses) {
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
                <TableRow
                  key={lt.id}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <TableCell>
                    <Link
                      href={`/license-types/${lt.id}`}
                      className="font-medium hover:underline"
                    >
                      {lt.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {lt.description || "—"}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {lt.licenses.length}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {uniqueWorkers}
                  </TableCell>
                  <TableCell className="text-center">
                    {expired > 0 ? (
                      <Badge variant="destructive">{expired}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {expiringSoon > 0 ? (
                      <Badge variant="orange">{expiringSoon}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {valid > 0 ? (
                      <Badge variant="success">{valid}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
