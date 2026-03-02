import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_REQUIRED_LICENSE_TYPES } from "@/lib/prisma";
import { workerSchema } from "@/lib/validations/worker";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const workers = await prisma.worker.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { position: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      licenses: {
        include: { licenseType: true },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json(workers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = workerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Look up the default required license types
  const defaultTypes = await prisma.licenseType.findMany({
    where: { name: { in: DEFAULT_REQUIRED_LICENSE_TYPES } },
    select: { id: true },
  });

  const worker = await prisma.worker.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      position: data.position || null,
      notes: data.notes || null,
      requiredLicenseTypes: {
        create: defaultTypes.map((lt) => ({ licenseTypeId: lt.id })),
      },
    },
  });

  return NextResponse.json(worker, { status: 201 });
}
