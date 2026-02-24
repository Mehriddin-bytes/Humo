import { Resend } from "resend";
import { format } from "date-fns";

export async function sendExpiryEmail(params: {
  recipientEmail: string;
  workerName: string;
  licenseType: string;
  licenseCode: string | null;
  expiryDate: Date;
  alertLevel: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const expiryFormatted = format(params.expiryDate, "MMMM d, yyyy");
  const codeStr = params.licenseCode ? ` (${params.licenseCode})` : "";
  const subject =
    params.alertLevel === "expired"
      ? `EXPIRED: ${params.workerName} - ${params.licenseType}${codeStr}`
      : `License Expiring: ${params.workerName} - ${params.licenseType}${codeStr}`;

  const body =
    params.alertLevel === "expired"
      ? `The following license has EXPIRED:\n\nWorker: ${params.workerName}\nLicense: ${params.licenseType}${codeStr}\nExpired on: ${expiryFormatted}\n\nPlease arrange renewal immediately.`
      : `The following license is expiring soon:\n\nWorker: ${params.workerName}\nLicense: ${params.licenseType}${codeStr}\nExpiry Date: ${expiryFormatted}\nAlert Level: ${params.alertLevel}\n\nPlease arrange renewal before the expiry date.`;

  try {
    await resend.emails.send({
      from: "WPL License Monitor <onboarding@resend.dev>",
      to: params.recipientEmail,
      subject,
      text: body,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
