import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { LicenseForm } from "@/components/licenses/license-form";

export default async function EditLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const license = await prisma.license.findUnique({
    where: { id },
    include: { worker: true, licenseType: true },
  });

  if (!license) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Edit License"
        description={`${license.licenseType.name} for ${license.worker.firstName} ${license.worker.lastName}`}
      />
      <LicenseForm
        workerId={license.workerId}
        mode="edit"
        defaultValues={{
          id: license.id,
          workerId: license.workerId,
          licenseTypeId: license.licenseTypeId,
          code: license.code || "",
          issueDate: license.issueDate.toISOString(),
          expiryDate: license.expiryDate.toISOString(),
          notes: license.notes || "",
        }}
      />
    </div>
  );
}
