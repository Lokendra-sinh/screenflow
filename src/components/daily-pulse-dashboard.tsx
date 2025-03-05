"use client";

import React, { useState } from "react";
import {
  Clock,
  Layers,
  Box,
  BarChart3,
  Clock3,
  ArrowLeftRight,
} from "lucide-react";
import { extractDailyPulseData } from "@/lib/helpers/extract-daily-pulse-data";
import ProductivityAnalysis from "./productivity-analysis";
import TimeDistribution from "./time-distribution";
import { ContextFlow } from "./context-flow";
import { DailyPulseResponse } from "@/types/daily-pulse-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DailyPulseDashboardProps {
  pulseData: DailyPulseResponse | null | undefined;
}

const DailyPulseDashboard = ({ pulseData }: DailyPulseDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");


  if (!pulseData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Processing data...</p>
        </div>
      </div>
    );
  }


  const dailyPulseData = extractDailyPulseData(pulseData);
  const productivityData = dailyPulseData?.productivityAnalysis;
  const timeDistributionData = dailyPulseData?.timeDistribution;
  const contextData = {
    contextGroups: dailyPulseData?.contextGroups || [],
    contextSwitches: dailyPulseData?.contextSwitches || [],
  };


  if (!pulseData.session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-primary">No session data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        <SessionOverview session={pulseData.session} />
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <ProductivityAnalysis productivityData={productivityData} />
              <TimeDistribution timeData={timeDistributionData} />
              <ContextFlow contextData={contextData} />
            </div>
          )}

          {activeTab === "productivity" && (
            <ProductivityAnalysis productivityData={productivityData} />
          )}

          {activeTab === "time-distribution" && (
            <TimeDistribution timeData={timeDistributionData} />
          )}

          {activeTab === "context-groups" && (
            <ContextFlow contextData={contextData} />
          )}
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-foreground">Session analytics</h1>
    <p className="text-muted-foreground mt-2">
      Your digital activity patterns visualized
    </p>
  </div>
);

const SessionOverview = ({ session }) => {
  // Safety checks for session data
  if (!session) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Session information unavailable
        </CardContent>
      </Card>
    );
  }

  // Format duration nicely
  const formatDuration = (seconds) => {
    if (seconds === undefined || seconds === null) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Session Overview</CardTitle>
        <CardDescription>{session.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-md p-2 flex-shrink-0">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Session Duration</p>
              <p className="font-medium">{formatDuration(session.duration)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-md p-2 flex-shrink-0">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Time</p>
              <p className="font-medium">{formatDate(session.startTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-md p-2 flex-shrink-0">
              <Layers className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Context Groups</p>
              <p className="font-medium">{session.frameCount || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-md p-2 flex-shrink-0">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End Time</p>
              <p className="font-medium">{formatDate(session.endTime)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Box className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="productivity" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span>Productivity</span>
        </TabsTrigger>
        <TabsTrigger value="time-distribution" className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          <span>Time</span>
        </TabsTrigger>
        <TabsTrigger value="context-groups" className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          <span>Context</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default DailyPulseDashboard;