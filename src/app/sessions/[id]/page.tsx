"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RefreshCw, Briefcase, MapPin, Calendar, ExternalLink, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DailyPulsePage from "@/components/daily-pulse";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("jobs");

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch session data");
      }
      const data = await response.json();
      setSessionData(data);
      setError(null);
    } catch (err) {
      setError("Error loading session data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Session Data...</CardTitle>
            <CardDescription>Please wait while we load the session data</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Session</CardTitle>
            <CardDescription>{error || "Failed to load session data"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchSessionData}>Try Again</Button>
            <Link href="/" className="ml-4">
              <Button variant="outline">Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { jobData } = sessionData;
  

  const jobPostings = (jobData?.jobPostings || []).map((job: any) => {
    const title = job.basicInfo?.title || job.role || "Unknown Role";
    const company = job.sourceInfo?.company?.name || job.company || "Unknown Company";
    

    const workplaceType = job.basicInfo?.workplaceType || "Unknown";
    const location = job.basicInfo?.location || job.location || "-";
    const formattedLocation = workplaceType?.toLowerCase().includes("remote") 
      ? `Remote (${location})` 
      : location;
    

    const salary = job.basicInfo?.compensation?.salary || job.salaryInfo || "-";
    

    const experience = job.basicInfo?.experienceRequired || job.experienceRequired || "-";
    

    const postedDate = job.basicInfo?.postedDate || "-";
    

    let workTypeDisplay = "Unknown";
    let workTypeBadgeVariant: "default" | "outline" | "secondary" | "destructive" = "outline";
    
    if (workplaceType) {
      if (workplaceType.toLowerCase().includes("remote")) {
        workTypeDisplay = "Remote";
        workTypeBadgeVariant = "default";
      } else if (workplaceType.toLowerCase().includes("hybrid")) {
        workTypeDisplay = "Hybrid";
        workTypeBadgeVariant = "secondary";
      } else {
        workTypeDisplay = "In-office";
        workTypeBadgeVariant = "outline";
      }
    }
    
    const applyLink = job.sourceInfo?.url ? job.sourceInfo.url : null

    
    return {
      ...job,
      title,
      company,
      formattedLocation,
      salary,
      experience,
      postedDate,
      workTypeDisplay,
      workTypeBadgeVariant,
      applyLink
    };
  });

  const showJobDetails = (job: any) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all sessions
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Job Postings
          </TabsTrigger>
          <TabsTrigger value="pulse" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Daily Pulse
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab Content */}
        <TabsContent value="jobs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings ({jobPostings.length})</CardTitle>
              <CardDescription>
                Jobs captured during your browsing session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobPostings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No job postings were found in this session.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Work Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobPostings.map((job: any) => (
                        <TableRow key={job.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {job.company}
                              {job.sourceInfo?.company?.size && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Briefcase className="ml-1 h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{job.sourceInfo.company.size}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.workTypeBadgeVariant}>
                              {job.workTypeDisplay}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                              {job.formattedLocation}
                            </div>
                          </TableCell>
                          <TableCell>{job.experience}</TableCell>
                          <TableCell>
                            <span className="font-medium">{job.salary}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                              {job.postedDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={() => showJobDetails(job)}
                              >
                                Details
                              </Button>
                              {job.applyLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(job.applyLink, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Daily Pulse Tab Content */}
        <TabsContent value="pulse" className="mt-6">
          <Card>
            {/* <CardHeader>
              <CardTitle>Daily Pulse Dashboard</CardTitle>
              <CardDescription>
                Visualizing your digital activity patterns and focus metrics
              </CardDescription>
            </CardHeader> */}
            <CardContent>
              <DailyPulsePage />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{selectedJob.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <span className="font-medium">{selectedJob.company}</span>
                    {selectedJob.sourceInfo?.platform && (
                      <Badge variant="outline" className="ml-2">
                        {selectedJob.sourceInfo.platform}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={closeJobDetails}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Location</h3>
                  <p className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                    {selectedJob.formattedLocation} 
                    <Badge variant={selectedJob.workTypeBadgeVariant} className="ml-2">
                      {selectedJob.workTypeDisplay}
                    </Badge>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Compensation</h3>
                  <p>{selectedJob.salary || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Experience</h3>
                  <p>{selectedJob.experience || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Posted</h3>
                  <p className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                    {selectedJob.postedDate || "Not specified"}
                  </p>
                </div>
              </div>
              
              {/* Company details */}
              {selectedJob.sourceInfo?.company && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2">About the Company</h3>
                  <div className="bg-muted p-4 rounded-md">
                    {selectedJob.sourceInfo.company.description && (
                      <p className="mb-2">{selectedJob.sourceInfo.company.description}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {selectedJob.sourceInfo.company.size && (
                        <div>
                          <span className="text-muted-foreground">Size:</span> {selectedJob.sourceInfo.company.size}
                        </div>
                      )}
                      {selectedJob.sourceInfo.company.industry && (
                        <div>
                          <span className="text-muted-foreground">Industry:</span> {selectedJob.sourceInfo.company.industry}
                        </div>
                      )}
                      {selectedJob.companyInsights?.growthStage && (
                        <div>
                          <span className="text-muted-foreground">Stage:</span> {selectedJob.companyInsights.growthStage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Role details */}
              {selectedJob.roleDetails && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2">Role Details</h3>
                  {selectedJob.roleDetails.description && (
                    <p className="mb-4">{selectedJob.roleDetails.description}</p>
                  )}
                  
                  {selectedJob.roleDetails.responsibilities && selectedJob.roleDetails.responsibilities.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm text-muted-foreground mb-1">Responsibilities:</h4>
                      <ul className="list-disc pl-5">
                        {selectedJob.roleDetails.responsibilities.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedJob.roleDetails.requiredSkills && selectedJob.roleDetails.requiredSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-1">Required Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.roleDetails.requiredSkills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedJob.roleDetails.techStack && selectedJob.roleDetails.techStack.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm text-muted-foreground mb-1">Tech Stack:</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.roleDetails.techStack.map((tech: string, idx: number) => (
                          <Badge key={idx} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Application info */}
              {selectedJob.applicationInfo && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Application Process</h3>
                  {selectedJob.applicationInfo.applicationProcess && (
                    <p className="mb-2">{selectedJob.applicationInfo.applicationProcess}</p>
                  )}
                  {selectedJob.applicationInfo.referralOption && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Referral available: {selectedJob.applicationInfo.referralOption}
                    </p>
                  )}
                  {selectedJob.applyLink && (
                    <Button 
                      className="mt-2"
                      onClick={() => window.open(selectedJob.applyLink, '_blank')}
                    >
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}