import { executeRawSql } from "../raw-sql-client";
import crypto from "crypto";
import { dailyPulsePrompt } from "../prompts/daily-pulse-prompt";
import { callClaudeWithRetry } from "../ai/claude";

export async function processDailyPulse(sessionId: string, rawDataId: string) {
    try {
      // First, create a pending record in dailyPulse
      const pulseId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      await executeRawSql(
        "INSERT INTO daily_pulse (id, session_id, status, started_at, data, completed_at, error) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [pulseId, sessionId, 'processing', now, null, null, null]
      );
  
      // Fetch the raw data
      const rawDataRecord = await executeRawSql(
        "SELECT * FROM raw_data WHERE id = $1",
        [rawDataId]
      );
  
      if (!rawDataRecord || rawDataRecord.length === 0) {
        throw new Error(`Raw data not found for ID: ${rawDataId}`);
      }
  
      const rawContent = JSON.parse(rawDataRecord[0].data);
  
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

      console.log("DAILY PULSE DATA processed by CLAUDE:", processedSummary);
  
      if (!processedSummary) {
        throw new Error('Failed to process data with Claude');
      }
  
      // Update the daily pulse record to complete
      const completedAt = new Date().toISOString();
      await executeRawSql(
        "UPDATE daily_pulse SET status = $1, data = $2, completed_at = $3 WHERE id = $4",
        ['complete', JSON.stringify(processedSummary.content[0]?.text), completedAt, pulseId]
      );
  
      return processedSummary;
  
    } catch (error) {
      console.error(`Error processing daily pulse for session ${sessionId}:`, error);
      
      // Update the record with error status
      const completedAt = new Date().toISOString();
      await executeRawSql(
        "UPDATE daily_pulse SET status = $1, error = $2, completed_at = $3 WHERE session_id = $4 AND status = $5",
        ['error', error instanceof Error ? error.message : 'Unknown error', completedAt, sessionId, 'processing']
      );
      
      throw error;
    }
}

export async function getProcessedDataBySession(sessionId: string) {
  try {
    const processedResult = await executeRawSql(
      "SELECT * FROM processed_data WHERE session_id = $1",
      [sessionId]
    );

    if (!processedResult || processedResult.length === 0) {
      return null;
    }

    return JSON.parse(processedResult[0].data);
  } catch (error) {
    console.error(`Error fetching processed data for session ${sessionId}:`, error);
    throw error;
  }
}

export async function getDailyPulseData(sessionId: string) {
    try {
      const pulseData = await executeRawSql(
        "SELECT * FROM daily_pulse WHERE session_id = $1",
        [sessionId]
      );
  
      if (!pulseData || pulseData.length === 0) {
        return { status: 'not_started', data: null };
      }
  
      if (pulseData[0].status === 'complete') {
        return { 
          status: 'complete', 
          data: pulseData[0].data
        };
      }
  
      return { 
        status: pulseData[0].status, 
        data: null,
        startedAt: pulseData[0].started_at,
        error: pulseData[0].error 
      };
    } catch (error) {
      console.error(`Error fetching daily pulse data for session ${sessionId}:`, error);
      throw error;
    }
}