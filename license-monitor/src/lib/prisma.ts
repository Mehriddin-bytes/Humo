import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** License types every new employee must have by default. */
export const DEFAULT_REQUIRED_LICENSE_TYPES = [
  "WHIMS / GHS Training",
  "Swing Stage Operator",
  "Working at Heights",
];
