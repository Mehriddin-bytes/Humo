"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Layers, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { ExportData } from "@/lib/export";

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

type GroupBy = "licenseType" | "employee";

export function LicensesNeededList({
  missingLicenses,
  expiringLicenses,
}: LicensesNeededListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<GroupBy>("licenseType");

  function toggleExpand(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function handleGroupByChange(newGroupBy: GroupBy) {
    setGroupBy(newGroupBy);
    setExpandedGroups(new Set());
  }

  function getExportData(): ExportData {
    const rows: string[][] = [];
    if (groupBy === "employee") {
      for (const [, group] of employeeGroups) {
        for (const entry of group.missing) {
          rows.push([
            `${group.worker.firstName} ${group.worker.lastName}`,
            group.worker.position || "",
            entry.licenseTypeName,
            "Missing",
            "",
          ]);
        }
        for (const license of group.expiring) {
          const { daysUntil } = getLicenseStatus(new Date(license.expiryDate));
          rows.push([
            `${group.worker.firstName} ${group.worker.lastName}`,
            group.worker.position || "",
            license.licenseTypeName,
            "Expiring",
            `${format(new Date(license.expiryDate), "MMM d, yyyy")} (${daysUntil}d left)`,
          ]);
        }
      }
      return {
        title: "Licenses Needed (By Employee)",
        headers: ["Employee", "Position", "License Type", "Status", "Expiry Date"],
        rows,
      };
    }
    for (const entry of missingLicenses) {
      rows.push([
        entry.licenseTypeName,
        `${entry.worker.firstName} ${entry.worker.lastName}`,
        entry.worker.position || "",
        "Missing",
        "",
      ]);
    }
    for (const license of expiringLicenses) {
      const { daysUntil } = getLicenseStatus(new Date(license.expiryDate));
      rows.push([
        license.licenseTypeName,
        `${license.worker.firstName} ${license.worker.lastName}`,
        license.worker.position || "",
        "Expiring",
        `${format(new Date(license.expiryDate), "MMM d, yyyy")} (${daysUntil}d left)`,
      ]);
    }
    return {
      title: "Licenses Needed (By License Type)",
      headers: ["License Type", "Employee", "Position", "Status", "Expiry Date"],
      rows,
    };
  }

  // --- Group by license type ---
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
  const sortedTypeGroups = Array.from(typeGroups.entries()).sort((a, b) => {
    const aTotal = a[1].missing.length + a[1].expiring.length;
    const bTotal = b[1].missing.length + b[1].expiring.length;
    return bTotal - aTotal;
  });

  // --- Group by employee ---
  const workerGroups = new Map<
    string,
    { worker: WorkerInfo; missing: MissingEntry[]; expiring: ExpiringEntry[] }
  >();
  for (const entry of missingLicenses) {
    const key = entry.worker.id;
    if (!workerGroups.has(key))
      workerGroups.set(key, { worker: entry.worker, missing: [], expiring: [] });
    workerGroups.get(key)!.missing.push(entry);
  }
  for (const license of expiringLicenses) {
    const key = license.worker.id;
    if (!workerGroups.has(key))
      workerGroups.set(key, { worker: license.worker, missing: [], expiring: [] });
    workerGroups.get(key)!.expiring.push(license);
  }
  const employeeGroups = Array.from(workerGroups.entries()).sort((a, b) => {
    const aTotal = a[1].missing.length + a[1].expiring.length;
    const bTotal = b[1].missing.length + b[1].expiring.length;
    return bTotal - aTotal;
  });

  const totalItems = missingLicenses.length + expiringLicenses.length;
  if (totalItems === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            variant={groupBy === "licenseType" ? "default" : "outline"}
            size="sm"
            onClick={() => handleGroupByChange("licenseType")}
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            By License Type
          </Button>
          <Button
            variant={groupBy === "employee" ? "default" : "outline"}
            size="sm"
            onClick={() => handleGroupByChange("employee")}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            By Employee
          </Button>
        </div>
        <ExportButton data={getExportData()} />
      </div>

      {groupBy === "licenseType" &&
        sortedTypeGroups.map(([typeId, group]) => {
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
                    {total} {total === 1 ? "employee" : "employees"}
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
                      <TableHead className="w-[50px]"></TableHead>
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
                          <TableCell>
                            <LicenseRowActions
                              workerId={entry.worker.id}
                              workerName={`${entry.worker.firstName} ${entry.worker.lastName}`}
                              showEdit={false}
                              showRemoveLicense={false}
                            />
                          </TableCell>
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
                            <TableCell>
                              <LicenseRowActions
                                workerId={license.worker.id}
                                licenseId={license.id}
                                licenseTypeName={group.name}
                                workerFirstName={license.worker.firstName}
                                workerName={`${license.worker.firstName} ${license.worker.lastName}`}
                              />
                            </TableCell>
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

      {groupBy === "employee" &&
        employeeGroups.map(([workerId, group]) => {
          const total = group.missing.length + group.expiring.length;
          const isExpanded = expandedGroups.has(workerId);
          const workerName = `${group.worker.firstName} ${group.worker.lastName}`;

          return (
            <div key={workerId} className="rounded-md border overflow-hidden">
              <button
                type="button"
                onClick={() => toggleExpand(workerId)}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-semibold">{workerName}</span>
                  {group.worker.position && (
                    <span className="text-sm text-muted-foreground">
                      {group.worker.position}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    &middot; {total} {total === 1 ? "license" : "licenses"} needed
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
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>License Type</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.missing
                      .sort((a, b) => a.licenseTypeName.localeCompare(b.licenseTypeName))
                      .map((entry) => (
                        <TableRow key={`missing-${workerId}-${entry.licenseTypeId}`}>
                          <TableCell>
                            <LicenseRowActions
                              workerId={workerId}
                              workerName={workerName}
                              showEdit={false}
                              showRemoveLicense={false}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.licenseTypeName}
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
                            <TableCell>
                              <LicenseRowActions
                                workerId={workerId}
                                licenseId={license.id}
                                licenseTypeName={license.licenseTypeName}
                                workerFirstName={group.worker.firstName}
                                workerName={workerName}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {license.licenseTypeName}
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
