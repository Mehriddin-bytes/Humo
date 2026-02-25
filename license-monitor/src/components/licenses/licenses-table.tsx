"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
              <TableHead className="w-[50px]"></TableHead>
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href={`/licenses/${license.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit {license.licenseType.name}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(license.id)}
                          disabled={deleting === license.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deleting === license.id ? "Deleting..." : `Remove ${license.licenseType.name}`}
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

      {replacedLicenses.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Replaced Licenses ({replacedLicenses.length})
          </h3>
          <div className="rounded-md border opacity-60">
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
                {replacedLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(license.id)}
                            disabled={deleting === license.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting === license.id ? "Deleting..." : `Remove ${license.licenseType.name}`}
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
