import { executeRawSql } from "@/lib/raw-sql-client";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{id: string}>}) {
  try {
    const sessionId = (await params).id;
    
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }
    

    const sessionResult = await executeRawSql(
      "SELECT * FROM sessions WHERE id = $1",
      [sessionId]
    );
    
    if (!sessionResult || sessionResult.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    const session = {
      id: sessionResult[0].id,
      status: sessionResult[0].status,
      startTime: sessionResult[0].start_time,
      endTime: sessionResult[0].end_time,
      createdAt: sessionResult[0].created_at
    };
    
    // If session is still in progress, return just the status
    if (!['complete', 'error'].includes(session.status)) {
      return NextResponse.json({
        session,
        message: "Session is still being processed"
      });
    }
    
    // For completed sessions, get the processed data
    const processedResult = await executeRawSql(
      "SELECT * FROM processed_data WHERE session_id = $1",
      [sessionId]
    );
    
    if (!processedResult || processedResult.length === 0) {
      return NextResponse.json({ 
        error: "Processed data not found for this session",
        session
      }, { status: 404 });
    }
    
    // Parse the processed data
    let jobData;
    try {
      jobData = JSON.parse(processedResult[0].data);
    } catch (error) {
      console.error("Error parsing processed data:", error);
      return NextResponse.json({ 
        error: "Failed to parse processed data",
        session
      }, { status: 500 });
    }
    
    // Calculate session metrics
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
    const processedAt = new Date(processedResult[0].processed_at);
    
    // Return the enhanced session data
    return NextResponse.json({
      session: {
        ...session,
        formattedStartTime: startTime.toLocaleString(),
        formattedEndTime: endTime.toLocaleString(),
        duration,
        processedAt: processedResult[0].processed_at,
        formattedProcessedAt: processedAt.toLocaleString(),
        processingTime: Math.round((processedAt.getTime() - endTime.getTime()) / 1000) // in seconds
      },
      jobData,
      // Include some useful metadata
      meta: {
        totalJobs: jobData.count || 0,
        processingCompleted: session.status === 'complete',
        dataAge: Math.round((Date.now() - processedAt.getTime()) / 1000 / 60) // in minutes
      }
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
  }
}