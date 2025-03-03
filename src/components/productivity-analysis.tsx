import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowUp, ArrowDown, Zap, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const ProductivityAnalysis = ({ productivityData }) => {
  // If no data is provided, use sample data
  const data = productivityData || {
    highProductivityPeriods: [
      {
        contributingFactors: [
          "focused code review",
          "technical documentation",
          "sustained attention"
        ],
        duration: 45000,
        endTime: "2025-03-03T03:12:15.142580Z",
        startTime: "2025-03-03T03:11:30.464639Z"
      }
    ],
    longestFocusDuration: {
      contextGroupId: "cg-1",
      description: "Extended focus on code review and documentation",
      duration: 45000
    },
    lowProductivityPeriods: [
      {
        duration: 60000,
        endTime: "2025-03-03T03:13:58.031986Z",
        possibleCause: "social media browsing",
        startTime: "2025-03-03T03:12:15.331648Z"
      }
    ],
    productiveTimePercentage: 65,
    switchingFrequency: 1
  };

  // Format timestamps and durations
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate total session time
  const calculateTotalTime = () => {
    if (data.highProductivityPeriods.length > 0 && data.lowProductivityPeriods.length > 0) {
      const firstStart = new Date(data.highProductivityPeriods[0].startTime).getTime();
      const lastEnd = new Date(data.lowProductivityPeriods[0].endTime).getTime();
      return formatDuration(lastEnd - firstStart);
    }
    return "N/A";
  };

  // Helper function to determine productivity status color
  const getProductivityColor = (percentage) => {
    if (percentage >= 70) return "text-emerald-600";
    if (percentage >= 50) return "text-emerald-500";
    return "text-emerald-400";
  };
  
  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
      <div className="space-y-6">
        {/* Main Productivity Indicator */}
        <Card className="border-emerald-200 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 flex flex-col justify-center">
              <h3 className="text-lg font-medium text-emerald-800 mb-2">Productivity Score</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-5xl font-bold text-emerald-700">{data.productiveTimePercentage}%</div>
                <div className="flex flex-col">
                  <Badge className="mb-1 bg-emerald-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {calculateTotalTime()} total
                  </Badge>
                  <Badge variant="outline" className="border-emerald-200">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {data.switchingFrequency} context switch
                  </Badge>
                </div>
              </div>
              
              <Progress
                value={data.productiveTimePercentage}
                className="h-3 bg-emerald-100"
                indicatorClassName="bg-emerald-600"
              />
            </div>
            
            <div className="lg:w-1/3 bg-emerald-50 p-6 border-l border-emerald-100">
              <h4 className="font-medium text-emerald-800 mb-3">Focus Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span>High Productivity</span>
                  <span className="font-medium">{formatDuration(data.highProductivityPeriods[0].duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Low Productivity</span>
                  <span className="font-medium">{formatDuration(data.lowProductivityPeriods[0].duration)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-200 mt-2">
                  <span>Longest Focus</span>
                  <span className="font-medium">{formatDuration(data.longestFocusDuration.duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Productivity Periods Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Productivity Period */}
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-emerald-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-emerald-800 flex items-center">
                  <ArrowUp className="mr-2 h-5 w-5 text-emerald-600" /> 
                  High Productivity
                </CardTitle>
                <Badge className="bg-emerald-600">
                  {formatDuration(data.highProductivityPeriods[0].duration)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <div className="text-xs text-emerald-700 uppercase font-semibold mb-1">Time Period</div>
                <div className="p-2 bg-emerald-50 rounded-md text-sm">
                  {formatTime(data.highProductivityPeriods[0].startTime)} - {formatTime(data.highProductivityPeriods[0].endTime)}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-emerald-700 uppercase font-semibold mb-1">Contributing Factors</div>
                <div className="flex flex-wrap gap-2">
                  {data.highProductivityPeriods[0].contributingFactors.map((factor, index) => (
                    <div key={index} className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-sm">
                      <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Low Productivity Period */}
          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-emerald-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-emerald-800 flex items-center">
                  <ArrowDown className="mr-2 h-5 w-5 text-emerald-500" /> 
                  Low Productivity
                </CardTitle>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                  {formatDuration(data.lowProductivityPeriods[0].duration)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <div className="text-xs text-emerald-700 uppercase font-semibold mb-1">Time Period</div>
                <div className="p-2 bg-emerald-50 rounded-md text-sm">
                  {formatTime(data.lowProductivityPeriods[0].startTime)} - {formatTime(data.lowProductivityPeriods[0].endTime)}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-emerald-700 uppercase font-semibold mb-1">Possible Cause</div>
                <div className="flex items-center px-3 py-2 bg-emerald-100 text-emerald-800 rounded-md text-sm">
                  <XCircle className="h-3 w-3 mr-2 text-emerald-500" />
                  {data.lowProductivityPeriods[0].possibleCause}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Longest Focus Session */}
        <Card className="border-emerald-200 shadow-sm bg-gradient-to-r from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-md mr-4">
                  <Zap className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-800">Longest Focus Session</h3>
                  <p className="text-sm text-emerald-600">{data.longestFocusDuration.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-700">{formatDuration(data.longestFocusDuration.duration)}</div>
                <p className="text-xs text-emerald-600">Context Group: {data.longestFocusDuration.contextGroupId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <CardFooter className="p-0 pt-2 text-xs text-right text-emerald-700">
          Data captured on March 3, 2025 • Productive time: {data.productiveTimePercentage}% of session
        </CardFooter>
      </div>
    </div>
  );
};

export default ProductivityAnalysis;