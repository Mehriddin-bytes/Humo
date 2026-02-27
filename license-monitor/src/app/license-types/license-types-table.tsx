"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ExportButton } from "@/components/shared/export-button";
import type { ExportData } from "@/lib/export";

interface LicenseTypeRow {
  id: string;
  name: string;
  description: string | null;
  totalLicenses: number;
  uniqueWorkers: number;
  expired: number;
  expiringSoon: number;
  valid: number;
}

interface LicenseTypesTableProps {
  licenseTypes: LicenseTypeRow[];
}

export function LicenseTypesTable({ licenseTypes }: LicenseTypesTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<LicenseTypeRow | null>(null);

  function getExportData(): ExportData {
    return {
      title: "License Types",
      headers: ["License Type", "Description", "Total Licenses", "Workers", "Expired", "Expiring Soon", "Valid"],
      rows: licenseTypes.map((lt) => [
        lt.name,
        lt.description || "",
        String(lt.totalLicenses),
        String(lt.uniqueWorkers),
        String(lt.expired),
        String(lt.expiringSoon),
        String(lt.valid),
      ]),
    };
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    const res = await fetch(`/api/license-types/${deleteTarget.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success(`"${deleteTarget.name}" deleted`);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete");
    }
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <ExportButton data={getExportData()} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
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
            {licenseTypes.map((lt) => (
              <TableRow
                key={lt.id}
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
                        <Link href={`/license-types/${lt.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/license-types/${lt.id}/edit`}>
                          Edit {lt.name}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTarget(lt)}
                      >
                        Remove {lt.name}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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
                  {lt.totalLicenses}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {lt.uniqueWorkers}
                </TableCell>
                <TableCell className="text-center">
                  {lt.expired > 0 ? (
                    <Badge variant="destructive">{lt.expired}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {lt.expiringSoon > 0 ? (
                    <Badge variant="orange">{lt.expiringSoon}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {lt.valid > 0 ? (
                    <Badge variant="success">{lt.valid}</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this license type. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
