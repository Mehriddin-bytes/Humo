"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  User,
  Trash2,
  X,
  Layers,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { getLicenseStatus } from "@/lib/license-status";
import type { LicenseWithWorker, MissingLicenseEntry } from "@/types";

type GroupMode = "license" | "employee";

interface WorkerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
}

interface LicenseStatusTableProps {
  licenses: LicenseWithWorker[];
  missingLicenses?: MissingLicenseEntry[];
  workers?: WorkerInfo[];
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export function LicenseStatusTable({
  licenses,
  missingLicenses = [],
  workers = [],
}: LicenseStatusTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [groupMode, setGroupMode] = useState<GroupMode>("license");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set()
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "worker" | "license";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique license types for the filter dropdown
  const licenseTypeMap = new Map<string, string>();
  for (const l of licenses)
    licenseTypeMap.set(l.licenseType.id, l.licenseType.name);
  for (const m of missingLicenses)
    licenseTypeMap.set(m.licenseTypeId, m.licenseTypeName);
  const licenseTypes = Array.from(licenseTypeMap).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  const q = search.toLowerCase();

  // Filter licenses
  const filtered = licenses
    .filter((license) => {
      if (statusFilter === "not_assigned") return false;
      const workerName =
        `${license.worker.firstName} ${license.worker.lastName}`.toLowerCase();
      const typeName = license.licenseType.name.toLowerCase();
      const code = (license.code || "").toLowerCase();
      return (
        workerName.includes(q) || typeName.includes(q) || code.includes(q)
      );
    })
    .filter((license) => {
      if (typeFilter !== "all" && license.licenseType.id !== typeFilter)
        return false;
      if (statusFilter === "all") return true;
      const { status } = getLicenseStatus(new Date(license.expiryDate));
      if (statusFilter === "expired") return status === "expired";
      if (statusFilter === "critical") return status === "critical";
      if (statusFilter === "warning") return status === "warning";
      if (statusFilter === "caution") return status === "caution";
      if (statusFilter === "valid") return status === "valid";
      return true;
    })
    .sort((a, b) => {
      const aStatus = getLicenseStatus(new Date(a.expiryDate));
      const bStatus = getLicenseStatus(new Date(b.expiryDate));
      return aStatus.daysUntil - bStatus.daysUntil;
    });

  // Filter missing licenses
  const filteredMissing = missingLicenses.filter((entry) => {
    if (statusFilter !== "all" && statusFilter !== "not_assigned") return false;
    if (typeFilter !== "all" && entry.licenseTypeId !== typeFilter) return false;
    const workerName =
      `${entry.worker.firstName} ${entry.worker.lastName}`.toLowerCase();
    const typeName = entry.licenseTypeName.toLowerCase();
    return workerName.includes(q) || typeName.includes(q);
  });

  function toggleExpand(groupId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function getStats(
    groupLicenses: LicenseWithWorker[],
    missingCount: number
  ) {
    let expired = 0;
    let expiring = 0;
    let valid = 0;
    for (const l of groupLicenses) {
      const { status } = getLicenseStatus(new Date(l.expiryDate));
      if (status === "expired") expired++;
      else if (
        status === "critical" ||
        status === "warning" ||
        status === "caution"
      )
        expiring++;
      else valid++;
    }
    return { expired, expiring, valid, missing: missingCount };
  }

  async function handleDelete() {
    if (!deleteDialog) return;
    setIsDeleting(true);
    const endpoint =
      deleteDialog.type === "worker"
        ? `/api/workers/${deleteDialog.id}`
        : `/api/licenses/${deleteDialog.id}`;
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      toast.success(
        deleteDialog.type === "worker"
          ? "Employee deleted"
          : "License removed"
      );
      router.refresh();
    } else {
      toast.error(
        deleteDialog.type === "worker"
          ? "Failed to delete employee"
          : "Failed to remove license"
      );
    }
    setIsDeleting(false);
    setDeleteDialog(null);
  }

  // Reset expanded state when switching group mode (all collapsed by default)
  function handleGroupModeChange(mode: GroupMode) {
    setGroupMode(mode);
    setExpandedGroups(new Set());
  }

  // --- GROUP BY LICENSE TYPE ---
  const licenseTypeGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        name: string;
        licenses: LicenseWithWorker[];
        missing: MissingLicenseEntry[];
      }
    >();
    for (const license of filtered) {
      const key = license.licenseType.id;
      if (!grouped.has(key))
        grouped.set(key, {
          name: license.licenseType.name,
          licenses: [],
          missing: [],
        });
      grouped.get(key)!.licenses.push(license);
    }
    for (const entry of filteredMissing) {
      const key = entry.licenseTypeId;
      if (!grouped.has(key))
        grouped.set(key, {
          name: entry.licenseTypeName,
          licenses: [],
          missing: [],
        });
      grouped.get(key)!.missing.push(entry);
    }
    return Array.from(grouped.entries()).sort((a, b) => {
      const aWorst =
        a[1].missing.length > 0
          ? -Infinity
          : a[1].licenses.length > 0
            ? Math.min(
                ...a[1].licenses.map(
                  (l) => getLicenseStatus(new Date(l.expiryDate)).daysUntil
                )
              )
            : Infinity;
      const bWorst =
        b[1].missing.length > 0
          ? -Infinity
          : b[1].licenses.length > 0
            ? Math.min(
                ...b[1].licenses.map(
                  (l) => getLicenseStatus(new Date(l.expiryDate)).daysUntil
                )
              )
            : Infinity;
      return aWorst - bWorst;
    });
  }, [filtered, filteredMissing]);

  // --- GROUP BY EMPLOYEE ---
  const employeeGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        worker: WorkerInfo;
        licenses: LicenseWithWorker[];
        missing: MissingLicenseEntry[];
      }
    >();

    // Initialize all workers (so employees with no data still show if they match search)
    for (const w of workers) {
      const workerName = `${w.firstName} ${w.lastName}`.toLowerCase();
      if (q && !workerName.includes(q)) continue;
      grouped.set(w.id, { worker: w, licenses: [], missing: [] });
    }

    for (const license of filtered) {
      const key = license.workerId;
      if (!grouped.has(key))
        grouped.set(key, {
          worker: license.worker,
          licenses: [],
          missing: [],
        });
      grouped.get(key)!.licenses.push(license);
    }
    for (const entry of filteredMissing) {
      const key = entry.worker.id;
      if (!grouped.has(key))
        grouped.set(key, {
          worker: entry.worker,
          licenses: [],
          missing: [],
        });
      grouped.get(key)!.missing.push(entry);
    }

    // Filter out employees with no licenses/missing if a status filter is active
    if (statusFilter !== "all") {
      for (const [key, group] of grouped.entries()) {
        if (group.licenses.length === 0 && group.missing.length === 0) {
          grouped.delete(key);
        }
      }
    }

    return Array.from(grouped.entries()).sort((a, b) => {
      const aScore = getEmployeeSortScore(a[1].licenses, a[1].missing.length);
      const bScore = getEmployeeSortScore(b[1].licenses, b[1].missing.length);
      if (aScore !== bScore) return aScore - bScore;
      const aName = `${a[1].worker.firstName} ${a[1].worker.lastName}`;
      const bName = `${b[1].worker.firstName} ${b[1].worker.lastName}`;
      return aName.localeCompare(bName);
    });
  }, [filtered, filteredMissing, workers, q, statusFilter]);

  function getEmployeeSortScore(
    workerLicenses: LicenseWithWorker[],
    missingCount: number
  ): number {
    if (missingCount > 0) return -1000 + missingCount * -1;
    if (workerLicenses.length === 0) return 1000;
    const worstDays = Math.min(
      ...workerLicenses.map(
        (l) => getLicenseStatus(new Date(l.expiryDate)).daysUntil
      )
    );
    return worstDays;
  }

  const isEmpty = filtered.length === 0 && filteredMissing.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by employee, license type, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All License Types</SelectItem>
            {licenseTypes.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_assigned">No License</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="critical">Critical (30d)</SelectItem>
            <SelectItem value="warning">Warning (60d)</SelectItem>
            <SelectItem value="caution">Caution (90d)</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Group mode toggle */}
      <div className="flex items-center gap-1 rounded-lg border p-1 w-fit">
        <Button
          variant={groupMode === "license" ? "default" : "ghost"}
          size="sm"
          className="h-8 gap-2"
          onClick={() => handleGroupModeChange("license")}
        >
          <Layers className="h-3.5 w-3.5" />
          By License Type
        </Button>
        <Button
          variant={groupMode === "employee" ? "default" : "ghost"}
          size="sm"
          className="h-8 gap-2"
          onClick={() => handleGroupModeChange("employee")}
        >
          <Users className="h-3.5 w-3.5" />
          By Employee
        </Button>
      </div>

      {isEmpty && groupMode === "license" ? (
        <div className="rounded-md border py-8 text-center text-muted-foreground">
          No licenses found
        </div>
      ) : groupMode === "license" ? (
        <div className="space-y-3">
          {licenseTypeGroups.map(([typeId, group]) => {
            const isExpanded = expandedGroups.has(typeId);
            const stats = getStats(group.licenses, group.missing.length);
            const totalInGroup = group.licenses.length + group.missing.length;

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
                      {totalInGroup} {pluralize(totalInGroup, "employee", "employees")}
                    </span>
                  </div>
                  <StatsBadges stats={stats} />
                </button>

                {isExpanded && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.missing.map((entry) => (
                        <MissingRow
                          key={`missing-${entry.worker.id}`}
                          entry={entry}
                        />
                      ))}
                      {group.licenses.map((license) => (
                        <LicenseRow
                          key={license.id}
                          license={license}
                          groupName={group.name}
                          onDeleteLicense={(id, name) =>
                            setDeleteDialog({ type: "license", id, name })
                          }
                          onDeleteWorker={(id, name) =>
                            setDeleteDialog({ type: "worker", id, name })
                          }
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* GROUP BY EMPLOYEE VIEW */
        <div className="space-y-3">
          {employeeGroups.length === 0 ? (
            <div className="rounded-md border py-8 text-center text-muted-foreground">
              No employees found
            </div>
          ) : (
            employeeGroups.map(([workerId, group]) => {
              const isExpanded = expandedGroups.has(workerId);
              const stats = getStats(
                group.licenses,
                group.missing.length
              );
              const employeeName = `${group.worker.firstName} ${group.worker.lastName}`;
              const totalItems = group.licenses.length + group.missing.length;

              return (
                <div
                  key={workerId}
                  className="rounded-md border overflow-hidden"
                >
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
                      <span className="font-semibold">{employeeName}</span>
                      {group.worker.position && (
                        <span className="text-sm text-muted-foreground">
                          {group.worker.position}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {totalItems} {pluralize(totalItems, "license", "licenses")}
                      </span>
                    </div>
                    <StatsBadges stats={stats} />
                  </button>

                  {isExpanded && (
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
                        {group.missing.map((entry) => (
                          <TableRow
                            key={`missing-${entry.licenseTypeId}`}
                            className="font-semibold"
                          >
                            <TableCell />
                            <TableCell className="font-semibold">
                              {entry.licenseTypeName}
                            </TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>
                              <Badge className="!bg-black !text-white">
                                No license
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {group.licenses.map((license) => (
                          <TableRow
                            key={license.id}
                            className="hover:bg-accent/50 transition-colors"
                          >
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/licenses/${license.id}/edit`}
                                    >
                                      Edit License
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setDeleteDialog({
                                        type: "license",
                                        id: license.id,
                                        name: `${license.licenseType.name} license for ${employeeName}`,
                                      })
                                    }
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Remove License
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="font-medium">
                              {license.licenseType.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {license.code || "—"}
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
                            <TableCell>
                              <StatusBadge expiryDate={license.expiryDate} />
                            </TableCell>
                          </TableRow>
                        ))}
                        {totalItems === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-muted-foreground py-4"
                            >
                              No licenses assigned
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog?.type === "worker"
                ? "Delete Employee"
                : "Remove License"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === "worker"
                ? `Are you sure you want to delete ${deleteDialog.name}? This will also delete all their licenses. This action cannot be undone.`
                : `Are you sure you want to remove this ${deleteDialog?.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? "Deleting..."
                : deleteDialog?.type === "worker"
                  ? "Delete Employee"
                  : "Remove License"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Sub-components ---

function StatsBadges({
  stats,
}: {
  stats: { expired: number; expiring: number; valid: number; missing: number };
}) {
  return (
    <div className="flex items-center gap-2">
      {stats.missing > 0 && (
        <Badge className="!bg-black !text-white">
          {stats.missing} no {pluralize(stats.missing, "license", "licenses")}
        </Badge>
      )}
      {stats.expired > 0 && (
        <Badge variant="destructive">{stats.expired} expired</Badge>
      )}
      {stats.expiring > 0 && (
        <Badge variant="orange">{stats.expiring} expiring</Badge>
      )}
      {stats.valid > 0 && (
        <Badge variant="success">{stats.valid} valid</Badge>
      )}
    </div>
  );
}

function MissingRow({ entry }: { entry: MissingLicenseEntry }) {
  const employeeName = `${entry.worker.firstName} ${entry.worker.lastName}`;
  return (
    <TableRow className="font-semibold">
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href={`/workers/${entry.worker.id}`}>
                <User className="mr-2 h-4 w-4" />
                Go to Profile
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell>
        <Link
          href={`/workers/${entry.worker.id}`}
          className="font-semibold hover:underline"
        >
          {employeeName}
        </Link>
      </TableCell>
      <TableCell>—</TableCell>
      <TableCell>—</TableCell>
      <TableCell>—</TableCell>
      <TableCell>
        <Badge className="!bg-black !text-white">No license</Badge>
      </TableCell>
    </TableRow>
  );
}

function LicenseRow({
  license,
  groupName,
  onDeleteLicense,
  onDeleteWorker,
}: {
  license: LicenseWithWorker;
  groupName: string;
  onDeleteLicense: (id: string, name: string) => void;
  onDeleteWorker: (id: string, name: string) => void;
}) {
  const employeeName = `${license.worker.firstName} ${license.worker.lastName}`;
  return (
    <TableRow className="hover:bg-accent/50 transition-colors">
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href={`/workers/${license.workerId}`}>
                <User className="mr-2 h-4 w-4" />
                Go to Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                onDeleteLicense(
                  license.id,
                  `${groupName} license for ${employeeName}`
                )
              }
            >
              <X className="mr-2 h-4 w-4" />
              Remove License
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteWorker(license.workerId, employeeName)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <TableCell>
        <Link
          href={`/workers/${license.workerId}`}
          className="font-medium hover:underline"
        >
          {employeeName}
        </Link>
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
  );
}
