import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import { getLicenseStatus } from "@/lib/license-status";
import { sendExpiryEmail } from "./email";
import { sendExpirySms } from "./sms";

export async function checkExpiringLicenses() {
  const settings = await prisma.alertSetting.findFirst();
  if (!settings) {
    return { checked: 0, alertsSent: 0, errors: 0, message: "No alert settings found" };
  }

  if (!settings.emailEnabled && !settings.smsEnabled) {
    return { checked: 0, alertsSent: 0, errors: 0, message: "All notifications disabled" };
  }

  const now = new Date();
  const cutoffDate = addDays(now, 90);

  const licenses = await prisma.license.findMany({
    where: {
      status: "active",
      expiryDate: { lte: cutoffDate },
    },
    include: {
      licenseType: true,
      worker: true,
    },
  });

  let alertsSent = 0;
  let errors = 0;

  for (const license of licenses) {
    const { status } = getLicenseStatus(license.expiryDate);

    let alertLevel: string | null = null;
    if (status === "expired") alertLevel = "expired";
    else if (status === "critical" && settings.warning30days) alertLevel = "30_days";
    else if (status === "warning" && settings.warning60days) alertLevel = "60_days";
    else if (status === "caution" && settings.warning90days) alertLevel = "90_days";

    if (!alertLevel) continue;

    // Check for recent alert to prevent duplicates
    const recentAlert = await prisma.alertLog.findFirst({
      where: {
        licenseId: license.id,
        alertLevel,
        success: true,
        sentAt: { gte: addDays(now, -7) },
      },
    });

    if (recentAlert) continue;

    const workerName = `${license.worker.firstName} ${license.worker.lastName}`;

    if (settings.emailEnabled && settings.recipientEmail) {
      const result = await sendExpiryEmail({
        recipientEmail: settings.recipientEmail,
        workerName,
        licenseType: license.licenseType.name,
        licenseCode: license.code,
        expiryDate: license.expiryDate,
        alertLevel,
      });

      await prisma.alertLog.create({
        data: {
          licenseId: license.id,
          alertType: "email",
          alertLevel,
          success: result.success,
          error: result.error,
        },
      });

      if (result.success) alertsSent++;
      else errors++;
    }

    if (settings.smsEnabled && settings.recipientPhone) {
      const result = await sendExpirySms({
        recipientPhone: settings.recipientPhone,
        workerName,
        licenseType: license.licenseType.name,
        expiryDate: license.expiryDate,
        alertLevel,
      });

      await prisma.alertLog.create({
        data: {
          licenseId: license.id,
          alertType: "sms",
          alertLevel,
          success: result.success,
          error: result.error,
        },
      });

      if (result.success) alertsSent++;
      else errors++;
    }
  }

  return { checked: licenses.length, alertsSent, errors, message: "Check complete" };
}
