import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { WorkerForm } from "@/components/workers/worker-form";

export default async function EditWorkerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await prisma.worker.findUnique({ where: { id } });

  if (!worker) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title={`Edit ${worker.firstName} ${worker.lastName}`} />
      <WorkerForm
        mode="edit"
        defaultValues={{
          id: worker.id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          email: worker.email || "",
          phone: worker.phone || "",
          position: worker.position || "",
          notes: worker.notes || "",
        }}
      />
    </div>
  );
}
