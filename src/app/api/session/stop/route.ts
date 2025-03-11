// route stop.ts
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { pipe } from "@screenpipe/js"
import { executeRawSql } from "@/lib/raw-sql-client";
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

    // Check if session exists
    const existingSession = await executeRawSql(
      "SELECT * FROM sessions WHERE id = $1",
      [sessionId]
    );
      
    if (!existingSession || existingSession.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Session not found" 
      }, { status: 404 });
    }

    const results = await pipe.queryScreenpipe({
      startTime: existingSession[0].start_time,
      limit: 2000,
      contentType: "ocr",
    });

    console.log("PIPE RESULTS are:", results!.data)

    if (results && results.data.length > 0) {
      const now = new Date().toISOString();
      let rawDataId = "";

      // Begin transaction
      await executeRawSql("BEGIN");
      
      try {
        // Insert raw data and get ID
        const newRawDataId = crypto.randomUUID();
        const rawDataResult = await executeRawSql(
          "INSERT INTO raw_data (id, session_id, data, captured_at) VALUES ($1, $2, $3, $4) RETURNING id",
          [newRawDataId, sessionId, JSON.stringify(results), now]
        );
        
        rawDataId = rawDataResult[0].id;

        // Update session status
        await executeRawSql(
          "UPDATE sessions SET status = 'processing', end_time = $1 WHERE id = $2",
          [now, sessionId]
        );
        
        // Commit transaction
        await executeRawSql("COMMIT");
      } catch (error) {
        // Rollback transaction on error
        await executeRawSql("ROLLBACK");
        throw error;
      }

      processQueue.push({
        sessionId,
        rawDataId
      });

      try {
        processDailyPulse(sessionId, rawDataId)
          .catch(error => {
            console.error(`Error in daily pulse processing for session ${sessionId}:`, error);
          });

        await executeRawSql(
          "UPDATE sessions SET status = 'complete' WHERE id = $1",
          [sessionId]
        );
          
      } catch (error) {
        console.error('Error processing session data:', error);
        
        await executeRawSql(
          "UPDATE sessions SET status = 'error' WHERE id = $1",
          [sessionId]
        );
      }
    } else {
      await executeRawSql(
        "UPDATE sessions SET status = 'captured', end_time = $1 WHERE id = $2",
        [new Date().toISOString(), sessionId]
      );
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