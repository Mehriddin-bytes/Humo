import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { LicenseTypeForm } from "./license-type-form";

export default async function EditLicenseTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const licenseType = await prisma.licenseType.findUnique({ where: { id } });

  if (!licenseType) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Edit License Type"
        description={licenseType.name}
      />
      <LicenseTypeForm
        id={licenseType.id}
        defaultName={licenseType.name}
        defaultDescription={licenseType.description || ""}
      />
    </div>
  );
}
