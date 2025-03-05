import { getDb } from "./db";
import { rawData, processedData, sessions } from "./schema";
import { eq } from "drizzle-orm";
import crypto from 'crypto';
import { callLLMWithData } from "./ai/callLLMWithData";

interface QueueItem {
  sessionId: string;
  rawDataId: string;
}

// Define the screen data type to fix the type error
interface ScreenDataItem {
  timestamp: string;
  windowName: string;
  url: string;
  text: string;
}

export const processQueue: QueueItem[] = [];
let isProcessing = false;

async function processItem(item: QueueItem) {
  const db = await getDb();
  
  try {
    await db.update(sessions)
      .set({ status: 'processing' })
      .where(eq(sessions.id, item.sessionId));
    
    // PostgreSQL change: use first() instead of get()
    const rawDataRecord = await db.select()
      .from(rawData)
      .where(eq(rawData.id, item.rawDataId))
      .then(rows => rows[0]);
    
    if (!rawDataRecord) {
      throw new Error(`Raw data not found with ID: ${item.rawDataId}`);
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(rawDataRecord.data);
    } catch (error) {
      console.error("Error parsing data:", error);
      throw new Error("Failed to parse JSON data");
    }
    
    const cleanedData = cleanAndPrepareData(parsedData);
    
    const llmResponse = await callLLMWithData(cleanedData);
    
    await db.insert(processedData).values({
      id: crypto.randomUUID(),
      sessionId: item.sessionId,
      data: JSON.stringify(llmResponse),
      processedAt: new Date()
    });
    
    await db.update(sessions)
      .set({ status: 'complete' })
      .where(eq(sessions.id, item.sessionId));
      
  } catch (error) {
    console.error(`Error processing item ${item.sessionId}:`, error);
    
    // Update session status to error
    await db.update(sessions)
      .set({ status: 'error' })
      .where(eq(sessions.id, item.sessionId));
  }
}

// Function to clean and prepare data
function cleanAndPrepareData(data: any) {
  // Check if data has the expected structure
  if (!data || !Array.isArray(data.data)) {
    console.warn("Data doesn't have expected structure:", data);
    return { concatenatedText: "", screenData: [] as ScreenDataItem[] };
  }
  
  // Extract and concatenate all text content from OCR items
  let concatenatedText = "";
  const screenData: ScreenDataItem[] = [];
  
  // Sort the data by timestamp to maintain chronological order
  const sortedData = [...data.data].sort((a, b) => {
    return new Date(a.content.timestamp).getTime() - new Date(b.content.timestamp).getTime();
  });
  
  for (const item of sortedData) {
    if (item.type === "OCR" && item.content && item.content.text) {
      // Add to the concatenated text with separators for readability
      if (item.content.text.trim()) {
        concatenatedText += item.content.text + "\n\n---\n\n";
        
        // Create a structured item for each screen capture
        screenData.push({
          timestamp: item.content.timestamp,
          windowName: item.content.windowName || "Unknown",
          url: item.content.browserUrl || "Unknown",
          text: item.content.text
        });
      }
    }
  }
  
  return {
    concatenatedText,
    screenData,
    totalItems: data.data.length,
    captureTimespan: data.data.length > 0 ? {
      start: data.data[0].content.timestamp,
      end: data.data[data.data.length - 1].content.timestamp
    } : null
  };
}

// Worker function to continuously process the queue
async function worker() {
  if (isProcessing || processQueue.length === 0) {
    // Schedule next check
    setTimeout(worker, 1000);
    return;
  }
  
  isProcessing = true;
  
  try {
    const item = processQueue.shift();
    if (item) {
      await processItem(item);
    }
  } catch (error) {
    console.error("Worker encountered an error:", error);
  } finally {
    isProcessing = false;
    // Schedule next check
    setTimeout(worker, 1000);
  }
}

// Start the worker
worker();