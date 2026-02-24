import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { LicenseForm } from "@/components/licenses/license-form";

export default async function NewLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await prisma.worker.findUnique({ where: { id } });

  if (!worker) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Add License"
        description={`For ${worker.firstName} ${worker.lastName}`}
      />
      <LicenseForm workerId={worker.id} mode="create" />
    </div>
  );
}
