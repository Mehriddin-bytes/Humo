import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requirements = await prisma.workerRequiredLicenseType.findMany({
    where: { workerId: id },
    include: { licenseType: true },
    orderBy: { licenseType: { name: "asc" } },
  });
  return NextResponse.json(requirements);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const licenseTypeIds: string[] = body.licenseTypeIds || [];

  const worker = await prisma.worker.findUnique({ where: { id } });
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.workerRequiredLicenseType.deleteMany({ where: { workerId: id } }),
    ...licenseTypeIds.map((ltId) =>
      prisma.workerRequiredLicenseType.create({
        data: { workerId: id, licenseTypeId: ltId },
      })
    ),
  ]);

  const updated = await prisma.workerRequiredLicenseType.findMany({
    where: { workerId: id },
    include: { licenseType: true },
    orderBy: { licenseType: { name: "asc" } },
  });

  return NextResponse.json(updated);
}
