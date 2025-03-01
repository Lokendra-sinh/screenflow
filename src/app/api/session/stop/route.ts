import { NextResponse } from "next/server";
import { exec } from "child_process";
import { pipe } from "@screenpipe/js"
import { getDb } from "@/lib/db";
import { rawData, sessions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { processQueue } from "@/lib/queue";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: "No session ID provided" 
      }, { status: 400 });
    }

    const db = getDb();

    // Verify the session exists before proceeding
    const existingSession = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    if (!existingSession) {
      return NextResponse.json({ 
        success: false, 
        error: "Session not found" 
      }, { status: 404 });
    }

    // Query Screenpipe for data
    const results = await pipe.queryScreenpipe({
      startTime: existingSession.startTime,
      limit: 2000,
      contentType: "all"
    });

    console.log("RESULTS are:", results?.data)
    results!.data.map((d) => {
      console.log("TEXTTTTT START:")
      console.log(JSON.stringify(d.content))
      console.log("TEXT ENDDD")
    })
    console.log("RESULTS STOPPED:")
    // Process the results if they exist
    if (results && results.data.length > 0) {
      const now = new Date().toISOString();
      let rawDataId = "";
      

      await db.transaction(async (tx) => {
        const rawDataResult = await tx.insert(rawData).values({
          id: crypto.randomUUID(),
          sessionId: sessionId,
          data: JSON.stringify(results),
          capturedAt: now
        }).returning({ id: rawData.id });

        rawDataId = rawDataResult[0].id;

        // Update the session status
        await tx.update(sessions).set({
          status: 'captured',
          endTime: now,
        }).where(eq(sessions.id, sessionId));
      });

      console.log("Raw data ID captured:", rawDataId);

      // Add to processing queue with correct sessionId and rawDataId
      processQueue.push({
        sessionId: sessionId,
        rawDataId: rawDataId,
      });
    } else {
      // Update session even if no results were found
      const now = new Date().toISOString();
      await db.update(sessions).set({
        status: 'captured',
        endTime: now,
      }).where(eq(sessions.id, sessionId));
    }

    // Stop the Screenpipe process
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
          message: "Screenpipe session stopped",
        }));
      });
    });
  } catch (e) {
    console.error("Error processing stop request", e);
    return NextResponse.json({
      success: false, 
      error: "Internal server error",
      details: e instanceof Error ? e.message : "Unknown error"
    }, {status: 500});
  }
}