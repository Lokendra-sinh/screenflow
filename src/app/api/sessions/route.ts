import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sessions, processedData } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = await getDb();
    
    // Get all sessions with their status and timing information
    const allSessions = await db.select({
      id: sessions.id,
      startTime: sessions.startTime,
      endTime: sessions.endTime,
      status: sessions.status,
      createdAt: sessions.createdAt
    })
    .from(sessions)
    .orderBy(desc(sessions.createdAt));
    
    // Add more context to each session
    const enhancedSessions = await Promise.all(allSessions.map(async (session) => {
      // For completed sessions, get the job count
      let jobCount = 0;
      let lastActivity: string = session.endTime || session.startTime;
      
      if (session.status === 'complete') {
        try {
          // PostgreSQL change: use first() instead of get()
          const processedResult = await db.select()
            .from(processedData)
            .where(eq(processedData.sessionId, session.id))
            .then(rows => rows[0]);
          
          if (processedResult) {
            const data = JSON.parse(processedResult.data);
            jobCount = data.count || 0;
            
            // Convert Date to string before assignment
            if (processedResult.processedAt) {
              lastActivity = typeof processedResult.processedAt === 'string' 
                ? processedResult.processedAt 
                : processedResult.processedAt.toISOString();
            }
          }
        } catch (error) {
          console.error(`Error getting job count for session ${session.id}:`, error);
        }
      }
      
      // Calculate duration if session is complete
      let duration: null | number = null;
      if (session.endTime && session.startTime) {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        duration = Math.round((end.getTime() - start.getTime()) / 1000); // Duration in seconds
      }
      
      // Format time for human readability
      const formattedStartTime = new Date(session.startTime).toLocaleString();
      
      // Determine if session is actionable (can be clicked)
      const isActionable = ['complete', 'error'].includes(session.status);
      
      // Add engagement metrics
      const engagementScore = jobCount > 0 ? 'high' : 'low';
      
      return {
        ...session,
        formattedStartTime,
        duration,
        jobCount,
        lastActivity,
        isActionable,
        engagementScore
      };
    }));
    
    return NextResponse.json({ 
      sessions: enhancedSessions,
      totalSessions: enhancedSessions.length,
      completedSessions: enhancedSessions.filter(s => s.status === 'complete').length,
      inProgressSessions: enhancedSessions.filter(s => ['recording', 'capturing', 'processing'].includes(s.status)).length,
      totalJobsFound: enhancedSessions.reduce((sum, session) => sum + (session.jobCount || 0), 0)
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}