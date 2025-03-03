// app/api/daily-pulse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDailyPulseData } from "@/lib/processors/process-daily-pulse";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const sessionId = (await params).id
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: "No session ID provided" 
      }, { status: 400 });
    }

    const pulseData = await getDailyPulseData(sessionId);
    
    return NextResponse.json({
      success: true,
      data: pulseData.data,
      status: pulseData.status
    });
  } catch (e) {
    console.error("Error fetching daily pulse data", e);
    return NextResponse.json({
      success: false, 
      error: "Internal server error",
      details: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}