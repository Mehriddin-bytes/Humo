"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { LicenseWithType } from "@/types";

interface LicensesTableProps {
  licenses: LicenseWithType[];
  workerId: string;
}

export function LicensesTable({ licenses, workerId }: LicensesTableProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(licenseId: string) {
    setDeleting(licenseId);
    const res = await fetch(`/api/licenses/${licenseId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("License deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete license");
    }
    setDeleting(null);
  }

  // Sort: active licenses first (by expiry), then replaced licenses
  const sorted = [...licenses].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  const activeLicenses = sorted.filter((l) => l.status === "active");
  const replacedLicenses = sorted.filter((l) => l.status === "replaced");

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeLicenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No active licenses.{" "}
                  <Link
                    href={`/workers/${workerId}/licenses/new`}
                    className="text-primary hover:underline"
                  >
                    Add one
                  </Link>
                </TableCell>
              </TableRow>
            ) : (
              activeLicenses.map((license) => (
                <TableRow key={license.id}>
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/licenses/${license.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete License</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this{" "}
                              {license.licenseType.name} license? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(license.id)}
                              disabled={deleting === license.id}
                            >
                              {deleting === license.id
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {replacedLicenses.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Replaced Licenses ({replacedLicenses.length})
          </h3>
          <div className="rounded-md border opacity-60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {replacedLicenses.map((license) => (
                  <TableRow key={license.id}>
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
                      <StatusBadge
                        expiryDate={license.expiryDate}
                        licenseStatus="replaced"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Replaced License
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this old{" "}
                                {license.licenseType.name} license record?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(license.id)}
                                disabled={deleting === license.id}
                              >
                                {deleting === license.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
