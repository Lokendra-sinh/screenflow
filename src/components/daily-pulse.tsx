'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DailyPulseDashboard from './daily-pulse-dashboard';

export default function DailyPulsePage() {
  const [pulseData, setPulseData] = useState<any>(null);
  const [status, setStatus] = useState<string>('loading');
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const sessionId = params.id;

  useEffect(() => {
    async function fetchData() {
      try {
        setStatus('loading');
        const response = await fetch(`/api/sessions/${sessionId}/daily-pulse`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch daily pulse data');
        }
        
        console.log('Daily Pulse Data:', data.data.content[0].text);
        setPulseData(data.data);
        setStatus('success');
      } catch (err) {
        console.error('Error fetching daily pulse data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStatus('error');
      }
    }
    
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  if (status === 'loading') {
    return <div className="p-4">Loading daily pulse data...</div>;
  }

  if (status === 'error') {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!pulseData) {
    return <div className="p-4">No data available</div>;
  }

  return (
    <div className="p-4">
      <DailyPulseDashboard pulseData={pulseData} />
    </div>
  );
}