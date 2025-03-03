import { getDb } from "../db";
import { rawData, dailyPulse, processedData } from "../schema";
import { and, eq, } from "drizzle-orm";
import crypto from "crypto";
import { dailyPulsePrompt } from "../prompts/daily-pulse-prompt";
import { callClaudeWithRetry } from "../ai/claude";


export async function processDailyPulse(sessionId: string, rawDataId: string) {
    
    const db = getDb();
  
    try {
      // First, create a pending record in dailyPulse
      const pulseId = crypto.randomUUID();
      const now = new Date().toISOString();
      
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
  
      // Fetch the raw data
      const rawDataRecord = await db.select()
        .from(rawData)
        .where(eq(rawData.id, rawDataId))
        .get();
  
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
          completedAt: new Date().toISOString()
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
          completedAt: new Date().toISOString()
        })
        .where(and(
          eq(dailyPulse.sessionId, sessionId),
          eq(dailyPulse.status, 'processing')
        ));
      
      throw error;
    }
  }

export async function getProcessedDataBySession(sessionId: string) {
  const db = getDb();
  
  try {
    const processedResult = await db.select()
      .from(processedData)
      .where(eq(processedData.sessionId, sessionId))
      .get();

    if (!processedResult) {
      return null;
    }

    return JSON.parse(processedResult.data);
  } catch (error) {
    console.error(`Error fetching processed data for session ${sessionId}:`, error);
    throw error;
  }
}


// function createEmptyDailyPulseResponse(screenData: any) {
//   let startTime = new Date().toISOString();
//   let endTime = new Date().toISOString();
//   let frameCount = 0;
  
//   try {
//     if (Array.isArray(screenData)) {

//       if (screenData.length > 0) {
//         const timestamps = screenData
//           .filter(r => r.content?.timestamp)
//           .map(r => r.content.timestamp);
        
//         if (timestamps.length > 0) {
//           startTime = timestamps.sort()[0];
//           endTime = timestamps.sort().pop() || endTime;
//           frameCount = screenData.length;
//         }
//       }
//     }
//   } catch (e) {
//     console.error("Error extracting basic info for empty response:", e);
//   }
  
//   // Generate a session ID based on the timestamp
//   const sessionId = `session-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  
//   return {
//     session: {
//       id: sessionId,
//       startTime,
//       endTime,
//       duration: calculateDuration(startTime, endTime),
//       frameCount
//     },
//     contextGroups: [],
//     contextSwitches: [],
//     flowStates: [],
//     insights: {
//       topActivities: [],
//       interestCategories: [],
//       behavioralPatterns: [],
//       knowledgeAreas: []
//     },
//     timeline: {
//       timePoints: [],
//       intensityCurve: []
//     }
//   };
// }


// function calculateDuration(start: string, end: string): number {
//   return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
// }


// function validateDailyPulseResponse(response: any) {

//   const requiredProps = ['session', 'contextGroups', 'contextSwitches', 'flowStates', 'insights', 'timeline'];
  
//   requiredProps.forEach(prop => {
//     if (!response[prop]) {
//       response[prop] = prop === 'session' 
//         ? { id: `session-${Date.now()}`, startTime: new Date().toISOString(), endTime: new Date().toISOString(), duration: 0, frameCount: 0 }
//         : prop === 'insights'
//           ? { topActivities: [], interestCategories: [], behavioralPatterns: [], knowledgeAreas: [] }
//           : prop === 'timeline'
//             ? { timePoints: [], intensityCurve: [] }
//             : [];
//     }
//   });
  

//   if (Array.isArray(response.contextGroups)) {
//     response.contextGroups.forEach((group: any, index: number) => {
//       if (!group.id) {
//         group.id = `cg-${index + 1}`;
//       }
//     });
//   }
  
//   return response;
// }

export async function getDailyPulseData(sessionId: string) {
    const db = getDb();
    
    try {
      const pulseData = await db.select()
        .from(dailyPulse)
        .where(eq(dailyPulse.sessionId, sessionId))
        .get();
  
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