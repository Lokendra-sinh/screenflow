import { NextResponse } from "next/server";
import { executeRawSql } from "@/lib/raw-sql-client";

export async function GET() {
  try {
    console.log("Fetching sessions...");
    

    const allSessions = await executeRawSql(
      "SELECT id, start_time AS \"startTime\", end_time AS \"endTime\", status, created_at AS \"createdAt\" FROM sessions ORDER BY created_at DESC"
    );
    
    console.log(`Found ${allSessions.length} sessions`);

    const enhancedSessions = await Promise.all(allSessions.map(async (session) => {
      // For completed sessions, get the job count
      let jobCount = 0;
      let lastActivity = session.endTime || session.startTime;
      
      if (session.status === 'complete') {
        try {
          const processedResult = await executeRawSql(
            "SELECT * FROM processed_data WHERE session_id = $1",
            [session.id]
          );
          
          if (processedResult.length > 0) {
            const data = JSON.parse(processedResult[0].data);
            jobCount = data.count || 0;
            lastActivity = processedResult[0].processed_at;
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
      

      const formattedStartTime = new Date(session.startTime).toLocaleString();
      
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

    console.log("Sessions processed successfully");
    
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