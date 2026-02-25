import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { checkRateLimit } from "@/lib/auth/rate-limit";

function getAdminPhone(role: string): string | undefined {
  if (role === "web") return process.env.WEB_ADMIN_PHONE;
  if (role === "office") return process.env.OFFICE_ADMIN_PHONE;
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed, retryAfterSeconds } = checkRateLimit(ip, "send");
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { role } = await request.json();

    const phone = getAdminPhone(role);
    if (!role || !phone) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_VERIFY_SERVICE_SID
    ) { 
      return NextResponse.json(
        { error: "SMS service not configured" },
        { status: 500 }
      );
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    const roleLabel = role === "web" ? "WEB Admin" : "OFFICE Admin";

    return NextResponse.json({
      success: true,
      roleLabel,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Send code error:", message, err);
    return NextResponse.json(
      { error: `Failed to send verification code: ${message}` },
      { status: 500 }
    );
  }
}
