export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { AlertSettingsForm } from "@/components/settings/alert-settings-form";
import { AlertLogsTable } from "./alert-logs-table";

export default async function SettingsPage() {
  let settings = await prisma.alertSetting.findFirst();

  if (!settings) {
    settings = await prisma.alertSetting.create({
      data: {
        emailEnabled: false,
        smsEnabled: false,
        warning90days: true,
        warning60days: true,
        warning30days: true,
      },
    });
  }

  const logs = await prisma.alertLog.findMany({
    include: {
      license: {
        include: {
          licenseType: true,
          worker: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Configure alert notifications"
      />
      <AlertSettingsForm settings={settings} />
      <AlertLogsTable logs={logs} />
    </div>
  );
}
