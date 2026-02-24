import { format } from "date-fns";
import twilio from "twilio";

export async function sendExpirySms(params: {
  recipientPhone: string;
  workerName: string;
  licenseType: string;
  expiryDate: Date;
  alertLevel: string;
}): Promise<{ success: boolean; error?: string }> {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const expiryFormatted = format(params.expiryDate, "MMM d, yyyy");
  const body =
    params.alertLevel === "expired"
      ? `WPL ALERT: ${params.workerName}'s ${params.licenseType} has EXPIRED (${expiryFormatted}). Renew immediately.`
      : `WPL ALERT: ${params.workerName}'s ${params.licenseType} expires ${expiryFormatted} (${params.alertLevel}). Please arrange renewal.`;

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: params.recipientPhone,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown SMS error",
    };
  }
}
