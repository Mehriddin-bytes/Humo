import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.alertLog.findMany({
    include: {
      license: {
        include: {
          licenseType: true,
          worker: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}
