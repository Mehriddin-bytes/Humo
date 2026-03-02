"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
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
import { LicenseRowActions } from "@/components/shared/license-row-actions";
import { ExcludeFilter, type FilterOption } from "@/components/shared/exclude-filter";

interface WorkerInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  position: string | null;
}

interface LicenseEntry {
  id: string;
  code: string | null;
  workerId: string;
  issueDate: string;
  expiryDate: string;
  licenseTypeName: string;
  licenseTypeId: string;
  worker: WorkerInfo;
}

interface ExpiringListProps {
  licenses: LicenseEntry[];
}

export function ExpiringList({ licenses }: ExpiringListProps) {
  const [excludedTypes, setExcludedTypes] = useState<Set<string>>(new Set());
  const [excludedEmployees, setExcludedEmployees] = useState<Set<string>>(new Set());

  // Build filter options
  const typeOptions: FilterOption[] = (() => {
    const map = new Map<string, string>();
    for (const l of licenses) map.set(l.licenseTypeId, l.licenseTypeName);
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  })();

  const employeeOptions: FilterOption[] = (() => {
    const map = new Map<string, string>();
    for (const l of licenses)
      map.set(l.workerId, `${l.worker.firstName} ${l.worker.lastName}`);
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  })();

  // Apply filters
  const filtered = licenses.filter(
    (l) => !excludedTypes.has(l.licenseTypeId) && !excludedEmployees.has(l.workerId)
  );

  // Group by worker
  const workerMap = new Map<
    string,
    { worker: WorkerInfo; licenses: LicenseEntry[] }
  >();
  for (const license of filtered) {
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

  const hasFilters = excludedTypes.size > 0 || excludedEmployees.size > 0;

  return (
    <div className="space-y-8">
      {(typeOptions.length > 1 || employeeOptions.length > 1) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Exclude:</span>
          <ExcludeFilter
            label="License Types"
            options={typeOptions}
            excluded={excludedTypes}
            onChange={setExcludedTypes}
          />
          <ExcludeFilter
            label="Employees"
            options={employeeOptions}
            excluded={excludedEmployees}
            onChange={setExcludedEmployees}
          />
        </div>
      )}

      {Array.from(workerMap.values())
        .sort((a, b) => {
          const aMin = Math.min(
            ...a.licenses.map(
              (l) => getLicenseStatus(new Date(l.expiryDate)).daysUntil
            )
          );
          const bMin = Math.min(
            ...b.licenses.map(
              (l) => getLicenseStatus(new Date(l.expiryDate)).daysUntil
            )
          );
          return aMin - bMin;
        })
        .map(({ worker, licenses: workerLicenses }) => (
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
              <Badge variant="orange">
                {workerLicenses.length} expiring
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
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerLicenses
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
                              workerId={license.workerId}
                              licenseId={license.id}
                              licenseTypeName={license.licenseTypeName}
                              workerFirstName={license.worker.firstName}
                              workerName={`${license.worker.firstName} ${license.worker.lastName}`}
                              showProfile={false}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {license.licenseTypeName}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {license.code || "\u2014"}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(license.issueDate),
                              "MMM d, yyyy"
                            )}
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
                            <StatusBadge
                              expiryDate={new Date(license.expiryDate)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          {hasFilters
            ? "No licenses match the current filters."
            : "No licenses expiring within 90 days. Everything looks good."}
        </div>
      )}
    </div>
  );
}
