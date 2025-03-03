// // lib/content-processor.ts
// import { generateEmbedding, embeddingToBuffer } from './embeddings';
// import { getDb } from './db';
// import { contentChunks, embeddings, rawData } from './schema';
// import { eq } from 'drizzle-orm';
// import crypto from 'crypto';

// interface OCRFrame {
//   type: 'OCR';
//   content: {
//     text: string;
//     browserUrl: string;
//     timestamp: string;
//     // ... other fields
//   };
// }

// // Clean text by removing noise
// function cleanText(text: string): string {
//   return text
//     .replace(/[^\w\s-]/g, ' ')  // Replace special chars with space
//     .replace(/\s+/g, ' ')       // Normalize whitespace
//     .trim();
// }

// // Should we keep this frame's content?
// function isRelevantContent(frame: OCRFrame): boolean {
//   // Skip empty frames
//   if (!frame.content.text.trim()) return false;
  
//   // Skip very short text (likely UI elements)
//   if (frame.content.text.length < 20) return false;
  
//   // Skip navigation/UI text (customize based on your needs)
//   const skipPatterns = [
//     'New Chrome available',
//     'EXPLORER',
//     'PROBLEMS',
//     'OUTLINE',
//     // Add more patterns to skip
//   ];
  
//   return !skipPatterns.some(pattern => 
//     frame.content.text.includes(pattern)
//   );
// }

// // Extract and process content from raw data
// export async function processContent(rawDataId: string, sessionId: string) {
//   const db = getDb();
  
//   // Get raw data
//   const rawDataRecord = await db.select()
//     .from(rawData)
//     .where(eq(rawData.id, rawDataId))
//     .get();
    
//   if (!rawDataRecord) return;
  
//   const data = JSON.parse(rawDataRecord.data);
  
//   // Group frames by URL to combine related content
//   const urlGroups = new Map<string, OCRFrame[]>();
  
//   for (const frame of data.data) {
//     if (frame.type === 'OCR' && isRelevantContent(frame)) {
//       const url = frame.content.browserUrl || 'unknown';
//       if (!urlGroups.has(url)) {
//         urlGroups.set(url, []);
//       }
//       urlGroups.get(url)!.push(frame);
//     }
//   }
  
//   // Process each URL group
//   for (const [url, frames] of urlGroups) {
//     // Combine text from frames, removing duplicates
//     const combinedText = frames
//       .map(f => cleanText(f.content.text))
//       .filter((text, index, self) => self.indexOf(text) === index)
//       .join('\n');
    
//     if (combinedText.length < 50) continue; // Skip if too short after combining
    
//     try {
//       // Store content chunk
//       const chunkId = crypto.randomUUID();
//       const now = new Date().toISOString();
      
//       await db.transaction(async (tx) => {
//         // Save the content chunk
//         await tx.insert(contentChunks).values({
//           id: chunkId,
//           sessionId,
//           rawDataId,
//           content: combinedText,
//           sourceUrl: url,
//           timestamp: frames[0].content.timestamp,
//           createdAt: now
//         });
        
//         // Generate and save embedding
//         const embedding = await generateEmbedding(combinedText);
//         await tx.insert(embeddings).values({
//           id: crypto.randomUUID(),
//           chunkId,
//           embedding: embeddingToBuffer(embedding),
//           createdAt: now
//         });
//       });
//     } catch (error) {
//       console.error(`Error processing content from ${url}:`, error);
//       // Continue with other chunks even if one fails
//     }
//   }
// }