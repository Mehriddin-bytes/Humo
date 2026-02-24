import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { licenseSchema } from "@/lib/validations/license";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = licenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const newIssueDate = new Date(data.issueDate);
  const newExpiryDate = new Date(data.expiryDate);
  const newCode = data.code || null;

  // Block exact duplicates: same worker, type, dates, and code
  const duplicate = await prisma.license.findFirst({
    where: {
      workerId: data.workerId,
      licenseTypeId: data.licenseTypeId,
      issueDate: newIssueDate,
      expiryDate: newExpiryDate,
      code: newCode,
    },
    include: { licenseType: true },
  });

  if (duplicate) {
    return NextResponse.json(
      { error: `This exact "${duplicate.licenseType.name}" license already exists.` },
      { status: 409 }
    );
  }

  // Find the current active license of the same type for this worker
  const existingActive = await prisma.license.findFirst({
    where: {
      workerId: data.workerId,
      licenseTypeId: data.licenseTypeId,
      status: "active",
    },
  });

  // Determine whether the new license or the existing one should be "active"
  // The one with the latest expiry date wins
  const newIsNewer = !existingActive || newExpiryDate >= existingActive.expiryDate;

  if (newIsNewer && existingActive) {
    // New license is newer — mark all old ones as replaced
    await prisma.license.updateMany({
      where: {
        workerId: data.workerId,
        licenseTypeId: data.licenseTypeId,
        status: "active",
      },
      data: { status: "replaced" },
    });
  }

  const license = await prisma.license.create({
    data: {
      workerId: data.workerId,
      licenseTypeId: data.licenseTypeId,
      code: data.code || null,
      issueDate: new Date(data.issueDate),
      expiryDate: newExpiryDate,
      status: newIsNewer ? "active" : "replaced",
      notes: data.notes || null,
    },
    include: { licenseType: true, worker: true },
  });

  return NextResponse.json(license, { status: 201 });
}
