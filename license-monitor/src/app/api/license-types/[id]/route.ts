import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const name = (body.name || "").trim();
  const description = (body.description || "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "License type name is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.licenseType.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, id: { not: id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A license type with this name already exists" },
      { status: 409 }
    );
  }

  const updated = await prisma.licenseType.update({
    where: { id },
    data: { name, description: description || null },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const licenseType = await prisma.licenseType.findUnique({
    where: { id },
    include: { _count: { select: { licenses: true } } },
  });

  if (!licenseType) {
    return NextResponse.json(
      { error: "License type not found" },
      { status: 404 }
    );
  }

  if (licenseType._count.licenses > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete "${licenseType.name}" because it has ${licenseType._count.licenses} license(s) associated with it. Remove those licenses first.`,
      },
      { status: 400 }
    );
  }

  await prisma.licenseType.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
