import { NextResponse } from "next/server";
import { exec } from "child_process";
import { pipe } from "@screenpipe/js"
import { getDb } from "@/lib/db";
import { rawData, sessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { processDailyPulse } from "@/lib/processors/process-daily-pulse";
import { processQueue } from "@/lib/queue";

export async function POST(req: Request): Promise<Response> {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: "No session ID provided" 
      }, { status: 400 });
    }

    const db = await getDb();

    // PostgreSQL change: Use first() instead of get()
    const existingSession = await db.select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .then(rows => rows[0]);
      
    if (!existingSession) {
      return NextResponse.json({ 
        success: false, 
        error: "Session not found" 
      }, { status: 404 });
    }

    const results = await pipe.queryScreenpipe({
      startTime: existingSession.startTime,
      limit: 2000,
      contentType: "ocr",
    });

    console.log("PIPE RESULTS are:", results!.data)

    if (results && results.data.length > 0) {
      const now = new Date();
      let rawDataId = "";

      // PostgreSQL transaction handling
      await db.transaction(async (tx) => {
        // Insert raw data and get the ID
        const rawDataResult = await tx.insert(rawData)
          .values({
            id: crypto.randomUUID(),
            sessionId: sessionId,
            data: JSON.stringify(results),
            capturedAt: now
          })
          .returning({ id: rawData.id });

        rawDataId = rawDataResult[0].id;

        // Update session status
        await tx.update(sessions)
          .set({
            status: 'processing', 
            endTime: now.toISOString(),
          })
          .where(eq(sessions.id, sessionId));
      });

      processQueue.push({
        sessionId,
        rawDataId
      });

      try {
        processDailyPulse(sessionId, rawDataId)
          .catch(error => {
            console.error(`Error in daily pulse processing for session ${sessionId}:`, error);
          });

        await db.update(sessions)
          .set({ status: 'complete' })
          .where(eq(sessions.id, sessionId));
          
      } catch (error) {
        console.error('Error processing session data:', error);
        
        await db.update(sessions)
          .set({ status: 'error' })
          .where(eq(sessions.id, sessionId));
      }
    } else {
      await db.update(sessions)
        .set({
          status: 'captured',
          endTime: new Date().toISOString(),
        })
        .where(eq(sessions.id, sessionId));
    }

    return new Promise((resolve) => {
      const killCmd = process.platform === 'win32'
        ? 'taskkill /F /IM screenpipe.exe'
        : 'pkill -f screenpipe';
        
      exec(killCmd, (error) => {
        if (error && error.code !== 1) {
          console.error("Error stopping Screenpipe:", error);
          return resolve(NextResponse.json({ 
            success: false, 
            error: error.message 
          }, { status: 500 }));
        }
        
        return resolve(NextResponse.json({
          success: true,
          message: "Screenpipe session stopped and processing initiated",
        }));
      });
    });
  } catch (e) {
    console.error("Error processing stop request", e);
    return NextResponse.json({
      success: false, 
      error: "Internal server error",
      details: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}