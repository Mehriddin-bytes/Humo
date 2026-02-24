import { NextRequest, NextResponse } from "next/server";
import { checkExpiringLicenses } from "@/lib/notifications/check-expiry";

export async function POST(request: NextRequest) {
  // Verify cron secret (skip if called from settings page with same-origin)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isInternalCall = request.headers.get("x-internal-call") === "true";

  if (!isInternalCall && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await checkExpiringLicenses();
  return NextResponse.json(result);
}
