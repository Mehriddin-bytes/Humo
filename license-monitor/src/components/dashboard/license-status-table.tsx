"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, ChevronDown, ChevronRight, MoreHorizontal, User, Trash2, X } from "lucide-react";
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
import type { LicenseWithWorker } from "@/types";

interface LicenseStatusTableProps {
  licenses: LicenseWithWorker[];
}

export function LicenseStatusTable({ licenses }: LicenseStatusTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "worker" | "license";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique license types for the filter dropdown
  const licenseTypes = Array.from(
    new Map(
      licenses.map((l) => [l.licenseType.id, l.licenseType.name])
    )
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const filtered = licenses
    .filter((license) => {
      const workerName =
        `${license.worker.firstName} ${license.worker.lastName}`.toLowerCase();
      const typeName = license.licenseType.name.toLowerCase();
      const code = (license.code || "").toLowerCase();
      const q = search.toLowerCase();
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

  // Group filtered licenses by type
  const grouped = new Map<
    string,
    { name: string; licenses: typeof filtered }
  >();
  for (const license of filtered) {
    const key = license.licenseType.id;
    if (!grouped.has(key)) {
      grouped.set(key, { name: license.licenseType.name, licenses: [] });
    }
    grouped.get(key)!.licenses.push(license);
  }

  // Sort groups: most urgent first (by worst license in group)
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const aWorst = Math.min(
      ...a[1].licenses.map((l) =>
        getLicenseStatus(new Date(l.expiryDate)).daysUntil
      )
    );
    const bWorst = Math.min(
      ...b[1].licenses.map((l) =>
        getLicenseStatus(new Date(l.expiryDate)).daysUntil
      )
    );
    return aWorst - bWorst;
  });

  function toggleCollapse(typeId: string) {
    setCollapsedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeId)) next.delete(typeId);
      else next.add(typeId);
      return next;
    });
  }

  function getGroupStats(groupLicenses: typeof filtered) {
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
    return { expired, expiring, valid };
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
          ? "Worker deleted"
          : "License removed"
      );
      router.refresh();
    } else {
      toast.error(
        deleteDialog.type === "worker"
          ? "Failed to delete worker"
          : "Failed to remove license"
      );
    }
    setIsDeleting(false);
    setDeleteDialog(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by worker, license type, or code..."
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
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="critical">Critical (30d)</SelectItem>
            <SelectItem value="warning">Warning (60d)</SelectItem>
            <SelectItem value="caution">Caution (90d)</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border py-8 text-center text-muted-foreground">
          No licenses found
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map(([typeId, group]) => {
            const isCollapsed = collapsedTypes.has(typeId);
            const stats = getGroupStats(group.licenses);

            return (
              <div key={typeId} className="rounded-md border overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCollapse(typeId)}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-semibold">{group.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {group.licenses.length} worker{group.licenses.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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
                </button>

                {!isCollapsed && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.licenses.map((license) => {
                        const workerName = `${license.worker.firstName} ${license.worker.lastName}`;
                        return (
                          <TableRow
                            key={license.id}
                            className="hover:bg-accent/50 transition-colors"
                          >
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
                                      setDeleteDialog({
                                        type: "license",
                                        id: license.id,
                                        name: `${group.name} license for ${workerName}`,
                                      })
                                    }
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Remove License
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      setDeleteDialog({
                                        type: "worker",
                                        id: license.workerId,
                                        name: workerName,
                                      })
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Worker
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/workers/${license.workerId}`}
                                className="font-medium hover:underline"
                              >
                                {workerName}
                              </Link>
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
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog?.type === "worker" ? "Delete Worker" : "Remove License"}
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
              {isDeleting ? "Deleting..." : deleteDialog?.type === "worker" ? "Delete Worker" : "Remove License"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
