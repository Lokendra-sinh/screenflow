"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, } from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  RefreshCwIcon, 
  ArrowRightIcon, 
  PlayIcon,
  ClipboardListIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Session = {
  id: string;
  status: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
  formattedStartTime: string;
  duration: number | null;
  jobCount: number;
  lastActivity: string;
  isActionable: boolean;
  engagementScore: string;
};

type SessionsResponse = {
  sessions: Session[];
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  totalJobsFound: number;
};


const fetchSessions = async (): Promise<SessionsResponse> => {
  const response = await fetch('/api/sessions');
  
  if (!response.ok) {
    throw new Error(`Error fetching sessions: ${response.status}`);
  }
  
  return response.json();
};

export function SessionsTable() {
  const router = useRouter();
  

  const { 
    data: sessions, 
    isLoading: loading, 
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    refetchInterval: 30000, 
    staleTime: 10000, 
    retry: 3, 
  });

  // Extract the error message
  const errorMessage = error instanceof Error ? error.message : "Failed to fetch sessions";
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recording':
        return <Badge className="bg-blue-500 text-white flex items-center gap-1"><PlayIcon size={12} /> Recording</Badge>;
      case 'captured':
        return <Badge className="bg-purple-500 text-white flex items-center gap-1"><ClipboardListIcon size={12} /> Captured</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500 text-white flex items-center gap-1"><RefreshCwIcon size={12} className="animate-spin" /> Processing</Badge>;
      case 'complete':
        return <Badge className="bg-green-500 text-white flex items-center gap-1"><CheckCircleIcon size={12} /> Complete</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white flex items-center gap-1"><XCircleIcon size={12} /> Error</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  const handleViewSession = (sessionId: string, isActionable: boolean) => {
    if (isActionable) {
      router.push(`/sessions/${sessionId}`);
    }
  };
  
  if (loading && !sessions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Loading sessions data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <RefreshCwIcon className="animate-spin h-10 w-10 text-gray-400" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Error loading sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{errorMessage}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => refetch()}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!sessions || sessions.sessions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>No sessions found</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10 text-gray-500">
          <ClipboardListIcon className="mx-auto h-12 w-12 mb-4" />
          <p>Start a Screenpipe session to track job postings</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Your Screenpipe browsing sessions</CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="text-sm flex flex-col items-end">
            <span className="font-medium">{sessions.totalJobsFound}</span>
            <span className="text-gray-500 text-xs">Jobs Found</span>
          </div>
          <div className="text-sm flex flex-col items-end">
            <span className="font-medium">{sessions.totalSessions}</span>
            <span className="text-gray-500 text-xs">Total Sessions</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={() => refetch()}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Jobs Found</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.sessions.map((session) => (
              <TableRow 
                key={session.id}
                className={
                  session.isActionable 
                    ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" 
                    : "opacity-80"
                }
                onClick={() => handleViewSession(session.id, session.isActionable)}
              >
                <TableCell>
                  <div className="font-medium">
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(session.status)}
                </TableCell>
                <TableCell>
                  {session.duration 
                    ? <span className="flex items-center gap-1 text-gray-600">
                        <ClockIcon size={14} />
                        {Math.floor(session.duration / 60)}m {session.duration % 60}s
                      </span>
                    : session.status === 'recording' 
                      ? <span className="flex items-center gap-1 text-blue-600">
                          <ClockIcon size={14} className="animate-pulse" />
                          Active
                        </span>
                      : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  {session.status === 'complete' ? (
                    <span className={`font-medium ${session.jobCount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {session.jobCount}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {session.isActionable ? (
                    <Link href={`/sessions/${session.id}`}>
                      <Button variant="ghost" size="icon">
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      <RefreshCwIcon size={16} className="animate-spin text-blue-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}