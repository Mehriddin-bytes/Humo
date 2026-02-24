import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil, Trash2, Mail, Phone, Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { LicensesTable } from "@/components/licenses/licenses-table";
import { DeleteWorkerButton } from "./delete-worker-button";

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      licenses: {
        include: { licenseType: true },
        orderBy: { expiryDate: "asc" },
      },
    },
  });

  if (!worker) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${worker.firstName} ${worker.lastName}`}
        description={worker.position || undefined}
      >
        <Button variant="outline" asChild>
          <Link href={`/workers/${worker.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <DeleteWorkerButton workerId={worker.id} workerName={`${worker.firstName} ${worker.lastName}`} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{worker.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{worker.phone || "No phone"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{worker.position || "No position"}</span>
          </div>
          {worker.notes && (
            <div className="sm:col-span-3">
              <p className="text-sm text-muted-foreground">{worker.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Licenses ({worker.licenses.filter((l) => l.status === "active").length})
          </h2>
          <Button asChild>
            <Link href={`/workers/${worker.id}/licenses/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add License
            </Link>
          </Button>
        </div>
        <LicensesTable licenses={worker.licenses} workerId={worker.id} />
      </div>
    </div>
  );
}
