import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await prisma.licenseType.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = (body.name || "").trim();
  const description = (body.description || "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "License type name is required" },
      { status: 400 }
    );
  }

  // Check if a type with this name already exists (case-insensitive)
  const existing = await prisma.licenseType.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    // Return the existing one instead of creating a duplicate
    return NextResponse.json(existing);
  }

  const licenseType = await prisma.licenseType.create({
    data: { name, description: description || null },
  });

  return NextResponse.json(licenseType, { status: 201 });
}
