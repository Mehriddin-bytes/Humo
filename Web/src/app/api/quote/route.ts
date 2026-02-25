import { NextRequest, NextResponse } from "next/server";

interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();

    if (!body.name || !body.email || !body.service) {
      return NextResponse.json(
        { error: "Name, email, and service are required." },
        { status: 400 }
      );
    }

    // Log the quote request (visible in server console)
    console.log("New quote request:", {
      name: body.name,
      email: body.email,
      phone: body.phone || "Not provided",
      service: body.service,
      message: body.message || "No message",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
