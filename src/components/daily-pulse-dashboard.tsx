import React, { useState, useEffect } from "react";
import {
  Clock,
  Activity,
  Layers,
  Zap,
  Box,
  BarChart3,
  Clock3,
  ArrowLeftRight,
} from "lucide-react";
import { extractDailyPulseData } from "@/lib/helpers/extract-daily-pulse-data";
import ProductivityAnalysis from "./productivity-analysis";
import TimeDistribution from "./time-distribution";
import { ContextFlow } from "./context-flow";

const DailyPulseDashboard = ({ pulseData }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    if (
      pulseData &&
      pulseData.content &&
      pulseData.content[0] &&
      pulseData.content[0].text
    ) {
      try {
        const parsed = JSON.parse(pulseData.content[0].text);
        console.log("PARSED data is: ", parsed);
        setParsedData(parsed);
      } catch (err) {
        console.error("Error parsing pulse data:", err);
      }
    } else if (typeof pulseData === "object" && !Array.isArray(pulseData)) {
      // If data is already parsed
      setParsedData(pulseData);
    }
  }, [pulseData]);

  if (!parsedData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-700">Processing data...</p>
        </div>
      </div>
    );
  }

  const dailyPulseData = extractDailyPulseData(parsedData);
  const productivityData = dailyPulseData?.productivityAnalysis;
  const timeDistributionData = dailyPulseData?.timeDistribution;
  const contextData = {
    contextGroups: dailyPulseData?.contextGroups,
    contextSwitches: dailyPulseData?.contextSwitches,
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        <SessionOverview session={parsedData.session} />
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "overview" && (
          <div className="space-y-8 mt-6">
            <ProductivityAnalysis productivityData={productivityData} />
            <TimeDistribution timeData={timeDistributionData} />
            <ContextFlow contextData={contextData} />
          </div>
        )}

        {activeTab === "productivity" && (
          <div className="mt-6">
            <ProductivityAnalysis productivityData={productivityData} />
          </div>
        )}

        {activeTab === "time-distribution" && (
          <div className="mt-6">
            <TimeDistribution timeData={timeDistributionData} />
          </div>
        )}

        {activeTab === "context-groups" && (
          <div className="mt-6">
            <ContextFlow contextData={contextData} />
          </div>
        )}
      </div>
    </div>
  );
};

const Header = () => (
  <div className="mb-8 text-center">
    <h1 className="text-4xl font-bold text-emerald-800 mb-2">
      Digital Daily Pulse
    </h1>
    <p className="text-emerald-600">
      Your digital activity patterns visualized
    </p>
  </div>
);

const SessionOverview = ({ session }) => {
  // Format duration nicely
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-emerald-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center justify-center md:justify-start">
          <div className="bg-emerald-100 p-2 rounded-full mr-3">
            <Clock className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-emerald-600">Session Duration</p>
            <p className="text-xl font-bold text-emerald-800">
              {formatDuration(session.duration)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start">
          <div className="bg-emerald-100 p-2 rounded-full mr-3">
            <Activity className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-emerald-600">Start Time</p>
            <p className="text-lg font-medium text-emerald-800">
              {formatDate(session.startTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start">
          <div className="bg-emerald-100 p-2 rounded-full mr-3">
            <Layers className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-emerald-600">Context Groups</p>
            <p className="text-xl font-bold text-emerald-800">
              {session.frameCount}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start">
          <div className="bg-emerald-100 p-2 rounded-full mr-3">
            <Zap className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-emerald-600">End Time</p>
            <p className="text-lg font-medium text-emerald-800">
              {formatDate(session.endTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: <Box size={18} /> },
    {
      id: "productivity",
      label: "Productivity Analysis",
      icon: <BarChart3 size={18} />,
    },
    {
      id: "time-distribution",
      label: "Time Distribution",
      icon: <Clock3 size={18} />,
    },
    {
      id: "context-groups",
      label: "Context Flow",
      icon: <ArrowLeftRight size={18} />,
    },
  ];

  return (
    <div className="bg-white p-1 rounded-xl shadow-sm mb-6 border border-emerald-200 overflow-x-auto">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 mx-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyPulseDashboard;


