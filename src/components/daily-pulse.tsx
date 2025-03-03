'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DailyPulseDashboard from './daily-pulse-dashboard';


const fetchDailyPulseData = async (sessionId) => {
  const response = await fetch(`/api/sessions/${sessionId}/daily-pulse`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch daily pulse data');
  }
  
  // If data.data is a string that contains JSON, parse it
  if (typeof data.data === 'string') {
    try {
      return JSON.parse(data.data);
    } catch (err) {
      console.error("Error parsing response data:", err);
      return data.data; // Return as is if parsing fails
    }
  }
  
  return data.data;
};
export default function DailyPulsePage() {
  const params = useParams();
  const sessionId = params.id;

  const { 
    data: pulseData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['dailyPulse', sessionId],
    queryFn: () => fetchDailyPulseData(sessionId),
    enabled: !!sessionId, 
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });


  if (isLoading) {
    return <div className="p-4">Loading daily pulse data...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Error: {error?.message || 'An unknown error occurred'}</div>;
  }

  if (!pulseData) {
    return <div className="p-4">No data available</div>;
  }

  // Parse the JSON string if necessary
  let parsedPulseData;
  try {
    // Check if pulseData is a string and attempt to parse it
    parsedPulseData = typeof pulseData === 'string' 
      ? JSON.parse(pulseData)
      : pulseData;
  } catch (err) {
    console.error("Error parsing pulse data:", err);
    return <div className="p-4 text-red-500">Error parsing data</div>;
  }

  return (
    <div className="p-4">
      <DailyPulseDashboard pulseData={parsedPulseData} />
    </div>
  );
}