import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLicenseStatus } from "@/lib/license-status";

export async function GET() {
  const [totalWorkers, licenses] = await Promise.all([
    prisma.worker.count(),
    prisma.license.findMany({
      include: {
        licenseType: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            position: true,
          },
        },
      },
      orderBy: { expiryDate: "asc" },
    }),
  ]);

  let expired = 0;
  let expiring30 = 0;
  let expiring60 = 0;
  let expiring90 = 0;
  let valid = 0;

  for (const license of licenses) {
    const { status } = getLicenseStatus(license.expiryDate);
    switch (status) {
      case "expired":
        expired++;
        break;
      case "critical":
        expiring30++;
        break;
      case "warning":
        expiring60++;
        break;
      case "caution":
        expiring90++;
        break;
      case "valid":
        valid++;
        break;
    }
  }

  return NextResponse.json({
    totalWorkers,
    totalLicenses: licenses.length,
    expired,
    expiring30,
    expiring60,
    expiring90,
    valid,
    licenses,
  });
}
