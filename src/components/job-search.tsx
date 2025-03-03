"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  SearchIcon, 
  RefreshCwIcon, 
  ClipboardListIcon,
  ArrowRightIcon,
  LinkIcon
} from "lucide-react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company: string;
  workType: string;
  location: string;
  experience: string;
  salary: string;
  posted: string;
  sessionId: string;
  relevanceScore?: number;
};

export function JobSearch() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setNoResults(false);
      setError(null);
      
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`Error searching jobs: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.jobs && data.jobs.length > 0) {
        setSearchResults(data.jobs);
      } else {
        setNoResults(true);
        setSearchResults(null);
      }
    } catch (err) {
      console.error("Failed to search jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to search jobs");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeBadge = (workType: string) => {
    if (workType.toLowerCase().includes('remote')) {
      return <Badge className="bg-purple-500 text-white">Remote</Badge>;
    } else if (workType.toLowerCase().includes('office')) {
      return <Badge className="bg-blue-500 text-white">In-office</Badge>;
    } else if (workType.toLowerCase().includes('hybrid')) {
      return <Badge className="bg-green-500 text-white">Hybrid</Badge>;
    } else {
      return <Badge>{workType}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Search Jobs</CardTitle>
        <CardDescription>Search through all your captured job postings with natural language</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="E.g., 'Remote software engineering jobs with React' or 'Senior positions in San Francisco'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex-shrink-0"
          >
            {loading ? (
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <RefreshCwIcon className="animate-spin h-10 w-10 text-gray-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {noResults && (
          <div className="text-center py-10 text-gray-500">
            <ClipboardListIcon className="mx-auto h-12 w-12 mb-4" />
            <p>No jobs matching your search were found</p>
            <p className="text-sm mt-2">Try a different search term or capture more job postings</p>
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.workType && getWorkTypeBadge(job.workType)}</TableCell>
                  <TableCell className="max-w-xs truncate">{job.location}</TableCell>
                  <TableCell>{job.experience || "-"}</TableCell>
                  <TableCell>{job.salary || "-"}</TableCell>
                  <TableCell>{job.posted}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/sessions/${job.sessionId}`}>
                        <Button variant="ghost" size="icon" title="View in session">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="ghost" size="icon" title="View details">
                          <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}