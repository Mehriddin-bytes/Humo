"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getWorstStatus } from "@/lib/license-status";
import type { WorkerWithLicenses } from "@/types";

interface WorkersTableProps {
  workers: WorkerWithLicenses[];
}

export function WorkersTable({ workers }: WorkersTableProps) {
  const [search, setSearch] = useState("");

  const filtered = workers.filter((worker) => {
    const name = `${worker.firstName} ${worker.lastName}`.toLowerCase();
    const position = (worker.position || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || position.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search workers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No workers found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((worker) => {
                const worstStatus = getWorstStatus(worker.licenses);
                return (
                  <TableRow key={worker.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell>
                      <Link
                        href={`/workers/${worker.id}`}
                        className="font-medium hover:underline"
                      >
                        {worker.firstName} {worker.lastName}
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
                        <span className="text-muted-foreground text-sm">
                          No licenses
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
