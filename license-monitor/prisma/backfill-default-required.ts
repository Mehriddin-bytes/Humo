/**
 * One-time script to backfill default required license types for all existing workers.
 * Adds WHIMS / GHS Training, Swing Stage Operator, and Working at Heights
 * to every worker who doesn't already have them marked as required.
 *
 * Run with: npx tsx prisma/backfill-default-required.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_REQUIRED = [
  "WHIMS / GHS Training",
  "Swing Stage Operator",
  "Working at Heights",
];

async function main() {
  // Find the license type IDs
  const types = await prisma.licenseType.findMany({
    where: { name: { in: DEFAULT_REQUIRED } },
    select: { id: true, name: true },
  });

  if (types.length !== DEFAULT_REQUIRED.length) {
    const found = types.map((t) => t.name);
    const missing = DEFAULT_REQUIRED.filter((n) => !found.includes(n));
    console.error(`Missing license types in DB: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log(
    `Found license types:\n${types.map((t) => `  - ${t.name} (${t.id})`).join("\n")}`
  );

  // Get all workers
  const workers = await prisma.worker.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      requiredLicenseTypes: { select: { licenseTypeId: true } },
    },
  });

  console.log(`\nProcessing ${workers.length} workers...\n`);

  let created = 0;
  let skipped = 0;

  for (const worker of workers) {
    const existingIds = new Set(
      worker.requiredLicenseTypes.map((r) => r.licenseTypeId)
    );

    const toAdd = types.filter((t) => !existingIds.has(t.id));

    if (toAdd.length === 0) {
      skipped++;
      continue;
    }

    await prisma.workerRequiredLicenseType.createMany({
      data: toAdd.map((t) => ({
        workerId: worker.id,
        licenseTypeId: t.id,
      })),
      skipDuplicates: true,
    });

    created += toAdd.length;
    console.log(
      `  ${worker.firstName} ${worker.lastName}: added ${toAdd.map((t) => t.name).join(", ")}`
    );
  }

  console.log(
    `\nDone! Created ${created} entries. ${skipped} workers already had all defaults.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
