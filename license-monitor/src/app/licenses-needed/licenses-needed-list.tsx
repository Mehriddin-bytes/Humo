"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface WorkerInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  position: string | null;
}

interface MissingEntry {
  licenseTypeId: string;
  licenseTypeName: string;
  worker: WorkerInfo;
}

interface ExpiringEntry {
  id: string;
  code: string | null;
  licenseTypeId: string;
  licenseTypeName: string;
  expiryDate: string;
  worker: WorkerInfo;
}

interface LicensesNeededListProps {
  missingLicenses: MissingEntry[];
  expiringLicenses: ExpiringEntry[];
}

export function LicensesNeededList({
  missingLicenses,
  expiringLicenses,
}: LicensesNeededListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group by license type
  const typeGroups = new Map<
    string,
    { name: string; missing: MissingEntry[]; expiring: ExpiringEntry[] }
  >();

  for (const entry of missingLicenses) {
    const key = entry.licenseTypeId;
    if (!typeGroups.has(key))
      typeGroups.set(key, { name: entry.licenseTypeName, missing: [], expiring: [] });
    typeGroups.get(key)!.missing.push(entry);
  }

  for (const license of expiringLicenses) {
    const key = license.licenseTypeId;
    if (!typeGroups.has(key))
      typeGroups.set(key, { name: license.licenseTypeName, missing: [], expiring: [] });
    typeGroups.get(key)!.expiring.push(license);
  }

  const sortedGroups = Array.from(typeGroups.entries()).sort((a, b) => {
    const aTotal = a[1].missing.length + a[1].expiring.length;
    const bTotal = b[1].missing.length + b[1].expiring.length;
    return bTotal - aTotal;
  });

  function toggleExpand(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  if (sortedGroups.length === 0) return null;

  return (
    <div className="space-y-3">
      {sortedGroups.map(([typeId, group]) => {
        const total = group.missing.length + group.expiring.length;
        const isExpanded = expandedGroups.has(typeId);

        return (
          <div key={typeId} className="rounded-md border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleExpand(typeId)}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="font-semibold">{group.name}</span>
                <span className="text-sm text-muted-foreground">
                  {total} {total === 1 ? "license" : "licenses"} needed
                </span>
              </div>
              <div className="flex items-center gap-2">
                {group.missing.length > 0 && (
                  <Badge className="!bg-black !text-white">
                    {group.missing.length} missing
                  </Badge>
                )}
                {group.expiring.length > 0 && (
                  <Badge variant="orange">
                    {group.expiring.length} expiring
                  </Badge>
                )}
              </div>
            </button>

            {isExpanded && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.missing
                    .sort((a, b) =>
                      `${a.worker.firstName} ${a.worker.lastName}`.localeCompare(
                        `${b.worker.firstName} ${b.worker.lastName}`
                      )
                    )
                    .map((entry) => (
                      <TableRow key={`missing-${entry.worker.id}-${typeId}`}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/workers/${entry.worker.id}`}
                            className="hover:underline"
                          >
                            {entry.worker.firstName} {entry.worker.lastName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.worker.position || "—"}
                        </TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>
                          <Badge className="!bg-black !text-white">
                            No license
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  {group.expiring
                    .sort(
                      (a, b) =>
                        getLicenseStatus(new Date(a.expiryDate)).daysUntil -
                        getLicenseStatus(new Date(b.expiryDate)).daysUntil
                    )
                    .map((license) => {
                      const { daysUntil } = getLicenseStatus(
                        new Date(license.expiryDate)
                      );
                      return (
                        <TableRow key={license.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/workers/${license.worker.id}`}
                              className="hover:underline"
                            >
                              {license.worker.firstName} {license.worker.lastName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {license.worker.position || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {license.code || "—"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(license.expiryDate), "MMM d, yyyy")}
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({daysUntil}d left)
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge expiryDate={new Date(license.expiryDate)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </div>
        );
      })}
    </div>
  );
}
