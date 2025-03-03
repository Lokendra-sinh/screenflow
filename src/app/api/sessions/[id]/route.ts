import {  NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sessions, processedData } from "@/lib/schema";
import { eq } from "drizzle-orm";


export async function GET(req: Request, { params } : { params: Promise<{id: string}>}) {
  try {
    const sessionId  = (await params).id
    
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }
    
    const db = getDb();
    
    // Get session details
    const session = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .get();
    
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    // If session is still in progress, return just the status
    if (!['complete', 'error'].includes(session.status)) {
      return NextResponse.json({
        session: {
          id: session.id,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          createdAt: session.createdAt
        },
        message: "Session is still being processed"
      });
    }
    
    // For completed sessions, get the processed data
    const processedResult = await db.select()
      .from(processedData)
      .where(eq(processedData.sessionId, sessionId))
      .get();
    
    if (!processedResult) {
      return NextResponse.json({ 
        error: "Processed data not found for this session",
        session
      }, { status: 404 });
    }
    
    // Parse the processed data
    let jobData;
    try {
      jobData = JSON.parse(processedResult.data);
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
    const processedAt = new Date(processedResult.processedAt);
    
    // Return the enhanced session data
    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        createdAt: session.createdAt,
        formattedStartTime: startTime.toLocaleString(),
        formattedEndTime: endTime.toLocaleString(),
        duration,
        processedAt: processedResult.processedAt,
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