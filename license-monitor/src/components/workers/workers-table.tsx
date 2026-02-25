"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MoreHorizontal, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { getWorstStatus } from "@/lib/license-status";
import type { WorkerWithLicenses } from "@/types";

interface WorkersTableProps {
  workers: WorkerWithLicenses[];
}

export function WorkersTable({ workers }: WorkersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = workers.filter((worker) => {
    const name = `${worker.firstName} ${worker.lastName}`.toLowerCase();
    const position = (worker.position || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || position.includes(q);
  });

  async function handleDelete() {
    if (!deleteDialog) return;
    setIsDeleting(true);
    const res = await fetch(`/api/workers/${deleteDialog.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Employee deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete employee");
    }
    setIsDeleting(false);
    setDeleteDialog(null);
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Licenses</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((worker) => {
                const worstStatus = getWorstStatus(worker.licenses);
                const name = `${worker.firstName} ${worker.lastName}`;
                return (
                  <TableRow key={worker.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link href={`/workers/${worker.id}`}>
                              <User className="mr-2 h-4 w-4" />
                              Go to Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setDeleteDialog({ id: worker.id, name })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/workers/${worker.id}`}
                        className="font-medium hover:underline"
                      >
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell>{worker.position || "—"}</TableCell>
                    <TableCell>{worker.phone || "—"}</TableCell>
                    <TableCell>{worker.email || "—"}</TableCell>
                    <TableCell>{worker.licenses.length}</TableCell>
                    <TableCell>
                      {worstStatus ? (
                        <Badge variant={worstStatus.variant}>
                          {worstStatus.label}
                        </Badge>
                      ) : (
                        <Badge className="!bg-black !text-white">
                          No licenses
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog?.name}? This will
              also delete all their licenses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
