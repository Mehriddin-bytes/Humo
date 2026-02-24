import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { licenseSchema } from "@/lib/validations/license";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const license = await prisma.license.findUnique({
    where: { id },
    include: { licenseType: true, worker: true },
  });

  if (!license) {
    return NextResponse.json({ error: "License not found" }, { status: 404 });
  }

  return NextResponse.json(license);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = licenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const license = await prisma.license.update({
    where: { id },
    data: {
      licenseTypeId: data.licenseTypeId,
      code: data.code || null,
      issueDate: new Date(data.issueDate),
      expiryDate: new Date(data.expiryDate),
      notes: data.notes || null,
    },
    include: { licenseType: true, worker: true },
  });

  return NextResponse.json(license);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.license.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
