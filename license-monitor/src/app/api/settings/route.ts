import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  let settings = await prisma.alertSetting.findFirst();

  if (!settings) {
    settings = await prisma.alertSetting.create({ data: body });
  } else {
    settings = await prisma.alertSetting.update({
      where: { id: settings.id },
      data: {
        emailEnabled: body.emailEnabled,
        smsEnabled: body.smsEnabled,
        warning90days: body.warning90days,
        warning60days: body.warning60days,
        warning30days: body.warning30days,
        recipientEmail: body.recipientEmail || null,
        recipientPhone: body.recipientPhone || null,
      },
    });
  }

  return NextResponse.json(settings);
}
