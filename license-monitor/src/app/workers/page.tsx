export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { WorkersTable } from "@/components/workers/workers-table";

export default async function WorkersPage() {
  const workers = await prisma.worker.findMany({
    include: {
      licenses: {
        where: { status: "active" },
        include: { licenseType: true },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Workers" description="Manage construction workers">
        <Button asChild>
          <Link href="/workers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Link>
        </Button>
      </PageHeader>
      <WorkersTable workers={workers} />
    </div>
  );
}
