import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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
    const { allowed, retryAfterSeconds } = checkRateLimit(ip, "verify");
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { role, code } = await request.json();

    if (!role || !code) {
      return NextResponse.json(
        { error: "Role and code are required" },
        { status: 400 }
      );
    }

    const phone = getAdminPhone(role);
    if (!phone) {
      return NextResponse.json(
        { error: "Invalid role" },
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

    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    if (check.status !== "approved") {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 401 }
      );
    }

    // Set auth cookie — session cookie (no maxAge = expires when browser closes)
    const cookieStore = await cookies();
    cookieStore.set("wpl-auth", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Verify code error:", message, err);
    return NextResponse.json(
      { error: `Failed to verify code: ${message}` },
      { status: 500 }
    );
  }
}
