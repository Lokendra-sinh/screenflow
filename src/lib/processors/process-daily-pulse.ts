import { getDb } from "../db";
import { rawData, dailyPulse, processedData } from "../schema";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";
import { dailyPulsePrompt } from "../prompts/daily-pulse-prompt";
import { callClaudeWithRetry } from "../ai/claude";

export async function processDailyPulse(sessionId: string, rawDataId: string) {
    const db = await getDb();
  
    try {
      // First, create a pending record in dailyPulse
      const pulseId = crypto.randomUUID();
      const now = new Date();
      
      await db.insert(dailyPulse)
        .values({
          id: pulseId,
          sessionId: sessionId,
          status: 'processing',
          startedAt: now,
          data: null,
          completedAt: null,
          error: null
        });
  
      // Fetch the raw data - PostgreSQL change: use first() instead of get()
      const rawDataRecord = await db.select()
        .from(rawData)
        .where(eq(rawData.id, rawDataId))
        .then(rows => rows[0]);
  
      if (!rawDataRecord) {
        throw new Error(`Raw data not found for ID: ${rawDataId}`);
      }
  
      const rawContent = JSON.parse(rawDataRecord.data);
  
      // Extract and prepare the content for processing
      const contentForProcessing = rawContent.data.map((item: any) => ({
        ...item,
        capturedAtTime: new Date(item.content.timestamp).getTime()
      }));
  
      // Sort by timestamp
      contentForProcessing.sort((a: any, b: any) => a.capturedAtTime - b.capturedAtTime);
  
      // Process with Claude
      const systemPrompt = dailyPulsePrompt();
      const processedSummary = await callClaudeWithRetry(systemPrompt, contentForProcessing);

      console.log("DAILY PULSE DATA processed by CLAUDE:", processedSummary)
  
      if (!processedSummary) {
        throw new Error('Failed to process data with Claude');
      }
  
      // Update the daily pulse record to complete
      await db.update(dailyPulse)
        .set({
          status: 'complete',
          data: JSON.stringify(processedSummary.content[0]?.text),
          completedAt: new Date()
        })
        .where(eq(dailyPulse.id, pulseId));
  
      return processedSummary;
  
    } catch (error) {
      console.error(`Error processing daily pulse for session ${sessionId}:`, error);
      
      // Update the record with error status
      await db.update(dailyPulse)
        .set({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        })
        .where(and(
          eq(dailyPulse.sessionId, sessionId),
          eq(dailyPulse.status, 'processing')
        ));
      
      throw error;
    }
}

export async function getProcessedDataBySession(sessionId: string) {
  const db = await getDb();
  
  try {
    // PostgreSQL change: use first() instead of get()
    const processedResult = await db.select()
      .from(processedData)
      .where(eq(processedData.sessionId, sessionId))
      .then(rows => rows[0]);

    if (!processedResult) {
      return null;
    }

    return JSON.parse(processedResult.data);
  } catch (error) {
    console.error(`Error fetching processed data for session ${sessionId}:`, error);
    throw error;
  }
}

export async function getDailyPulseData(sessionId: string) {
    const db = await getDb();
    
    try {
      // PostgreSQL change: use first() instead of get()
      const pulseData = await db.select()
        .from(dailyPulse)
        .where(eq(dailyPulse.sessionId, sessionId))
        .then(rows => rows[0]);
  
      if (!pulseData) {
        return { status: 'not_started', data: null };
      }
  
      if (pulseData.status === 'complete') {
        return { 
          status: 'complete', 
          data: pulseData.data
        };
      }
  
      return { 
        status: pulseData.status, 
        data: null,
        startedAt: pulseData.startedAt,
        error: pulseData.error 
      };
    } catch (error) {
      console.error(`Error fetching daily pulse data for session ${sessionId}:`, error);
      throw error;
    }
}