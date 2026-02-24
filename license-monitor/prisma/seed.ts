import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const licenseTypes = [
  { name: "WHIMS / GHS Training", description: "Workplace Hazardous Materials Information System / Globally Harmonized System" },
  { name: "Working at Heights", description: "Working at Heights training certification" },
  { name: "Swing Stage Operator", description: "Swing stage / suspended access equipment operator" },
  { name: "Fall Arrest Training", description: "Fall arrest systems and fall protection training" },
  { name: "Confined Space Entry", description: "Confined space entry and rescue training" },
  { name: "Scaffolding Erection", description: "Scaffold erection, use, and dismantling" },
  { name: "Crane Operator", description: "Mobile or tower crane operator certification" },
  { name: "First Aid / CPR", description: "First Aid and CPR certification" },
  { name: "WHMIS 2015", description: "Workplace Hazardous Materials Information System 2015" },
  { name: "Forklift Operator", description: "Forklift / powered industrial truck operator" },
  { name: "Aerial Work Platform", description: "Boom lift, scissor lift, and aerial work platform operator" },
  { name: "Propane Handling", description: "Propane handling and safety training" },
];

async function main() {
  console.log("Seeding database...");

  for (const lt of licenseTypes) {
    await prisma.licenseType.upsert({
      where: { name: lt.name },
      update: {},
      create: lt,
    });
  }
  console.log(`Seeded ${licenseTypes.length} license types`);

  const existingSettings = await prisma.alertSetting.findFirst();
  if (!existingSettings) {
    await prisma.alertSetting.create({
      data: {
        emailEnabled: false,
        smsEnabled: false,
        warning90days: true,
        warning60days: true,
        warning30days: true,
      },
    });
    console.log("Seeded default alert settings");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
