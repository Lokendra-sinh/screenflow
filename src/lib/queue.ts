import { executeRawSql } from '@/lib/raw-sql-client';
import crypto from 'crypto';
import { callLLMWithData } from "./ai/callLLMWithData";

interface QueueItem {
  sessionId: string;
  rawDataId: string;
}

interface ScreenDataItem {
  timestamp: string;
  windowName: string;
  url: string;
  text: string;
}

export const processQueue: QueueItem[] = [];
let isProcessing = false;

async function processItem(item: QueueItem) {
  try {

    await executeRawSql(
      "UPDATE sessions SET status = 'processing' WHERE id = $1",
      [item.sessionId]
    );
    
    // Get raw data record
    const rawDataResult = await executeRawSql(
      "SELECT * FROM raw_data WHERE id = $1",
      [item.rawDataId]
    );
    
    if (!rawDataResult || rawDataResult.length === 0) {
      throw new Error(`Raw data not found with ID: ${item.rawDataId}`);
    }
    
    const rawDataRecord = rawDataResult[0];
    
    let parsedData;
    try {
      parsedData = JSON.parse(rawDataRecord.data);
    } catch (error) {
      console.error("Error parsing data:", error);
      throw new Error("Failed to parse JSON data");
    }
    
    const cleanedData = cleanAndPrepareData(parsedData);
    
    const llmResponse = await callLLMWithData(cleanedData);
    
    // Insert processed data
    const processedDataId = crypto.randomUUID();
    const now = new Date().toISOString();
    await executeRawSql(
      "INSERT INTO processed_data (id, session_id, data, processed_at) VALUES ($1, $2, $3, $4)",
      [processedDataId, item.sessionId, JSON.stringify(llmResponse), now]
    );
    
    // Update session status to complete
    await executeRawSql(
      "UPDATE sessions SET status = 'complete' WHERE id = $1",
      [item.sessionId]
    );
      
  } catch (error) {
    console.error(`Error processing item ${item.sessionId}:`, error);
    
    // Update session status to error
    await executeRawSql(
      "UPDATE sessions SET status = 'error' WHERE id = $1",
      [item.sessionId]
    );
  }
}

// Function to clean and prepare data
function cleanAndPrepareData(data: any) {
  // Check if data has the expected structure
  if (!data || !Array.isArray(data.data)) {
    console.warn("Data doesn't have expected structure:", data);
    return { concatenatedText: "", screenData: [] as ScreenDataItem[] };
  }
  

  let concatenatedText = "";
  const screenData: ScreenDataItem[] = [];
  
  const sortedData = [...data.data].sort((a, b) => {
    return new Date(a.content.timestamp).getTime() - new Date(b.content.timestamp).getTime();
  });
  
  for (const item of sortedData) {
    if (item.type === "OCR" && item.content && item.content.text) {
      if (item.content.text.trim()) {
        concatenatedText += item.content.text + "\n\n---\n\n";
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


async function worker() {
  if (isProcessing || processQueue.length === 0) {
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
    setTimeout(worker, 1000);
  }
}


worker();