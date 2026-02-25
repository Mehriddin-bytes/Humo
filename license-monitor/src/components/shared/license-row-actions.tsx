"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, User, Pencil, Trash2, X } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LicenseRowActionsProps {
  workerId: string;
  licenseId?: string;
  /** The license type name, e.g. "WHIMS / GHS Training" */
  licenseTypeName?: string;
  /** The worker's first name, e.g. "Alvaro" — used in "Remove X from Alvaro" */
  workerFirstName?: string;
  /** The worker's full name — used in delete confirmation */
  workerName?: string;
  showProfile?: boolean;
  showEdit?: boolean;
  showRemoveLicense?: boolean;
  showDeleteWorker?: boolean;
}

export function LicenseRowActions({
  workerId,
  licenseId,
  licenseTypeName,
  workerFirstName,
  workerName,
  showProfile = true,
  showEdit = true,
  showRemoveLicense = true,
  showDeleteWorker = false,
}: LicenseRowActionsProps) {
  const router = useRouter();
  const [deleteType, setDeleteType] = useState<"license" | "worker" | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteType) return;
    setIsDeleting(true);
    const endpoint =
      deleteType === "worker"
        ? `/api/workers/${workerId}`
        : `/api/licenses/${licenseId}`;
    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      toast.success(
        deleteType === "worker" ? "Employee deleted" : "License removed"
      );
      router.refresh();
    } else {
      toast.error(
        deleteType === "worker"
          ? "Failed to delete employee"
          : "Failed to remove license"
      );
    }
    setIsDeleting(false);
    setDeleteType(null);
  }

  const hasSeparator =
    showProfile && (showEdit || showRemoveLicense || showDeleteWorker);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {showProfile && (
            <DropdownMenuItem asChild>
              <Link href={`/workers/${workerId}`}>
                <User className="mr-2 h-4 w-4" />
                Go to Profile
              </Link>
            </DropdownMenuItem>
          )}
          {hasSeparator && <DropdownMenuSeparator />}
          {showEdit && licenseId && (
            <DropdownMenuItem asChild>
              <Link href={`/licenses/${licenseId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit {licenseTypeName || "License"}
              </Link>
            </DropdownMenuItem>
          )}
          {showRemoveLicense && licenseId && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteType("license")}
            >
              <X className="mr-2 h-4 w-4" />
              Remove {licenseTypeName || "License"}{workerFirstName ? ` from ${workerFirstName}` : ""}
            </DropdownMenuItem>
          )}
          {showDeleteWorker && (
            <>
              {(showEdit || showRemoveLicense) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteType("worker")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Employee
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!deleteType}
        onOpenChange={(open) => !open && setDeleteType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === "worker" ? "Delete Employee" : "Remove License"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === "worker"
                ? `Are you sure you want to delete ${workerName}? This will also delete all their licenses. This action cannot be undone.`
                : `Are you sure you want to remove ${licenseTypeName || "this license"}${workerFirstName ? ` from ${workerFirstName}` : ""}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? "Deleting..."
                : deleteType === "worker"
                  ? "Delete Employee"
                  : "Remove License"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
