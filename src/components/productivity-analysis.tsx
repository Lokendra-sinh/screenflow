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

  // Format timestamps and durations, with proper error handling
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "N/A";
    }
  };

  const formatDuration = (ms) => {
    if (ms === undefined || ms === null || isNaN(ms)) return "0m 0s";
    
    try {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } catch (error) {
      console.error("Error formatting duration:", error);
      return "0m 0s";
    }
  };

  // Calculate total session time with error handling
  const calculateTotalTime = () => {
    try {
      if (data?.highProductivityPeriods?.length > 0 && data?.lowProductivityPeriods?.length > 0) {
        const firstStart = new Date(data.highProductivityPeriods[0].startTime).getTime();
        const lastEnd = new Date(data.lowProductivityPeriods[0].endTime).getTime();
        
        if (!isNaN(firstStart) && !isNaN(lastEnd) && lastEnd > firstStart) {
          return formatDuration(lastEnd - firstStart);
        }
      }
      
      // If there's only high productivity periods
      if (data?.highProductivityPeriods?.length > 0) {
        const period = data.highProductivityPeriods[0];
        if (period.startTime && period.endTime) {
          const start = new Date(period.startTime).getTime();
          const end = new Date(period.endTime).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            return formatDuration(end - start);
          }
        }
        // If we have duration but not valid timestamps
        if (period.duration) {
          return formatDuration(period.duration);
        }
      }
      
      return "0m 0s";
    } catch (error) {
      console.error("Error calculating total time:", error);
      return "0m 0s";
    }
  };

  // Safely access data with fallbacks
  const getHighProductivityPeriod = () => {
    return data?.highProductivityPeriods?.length > 0 ? data.highProductivityPeriods[0] : null;
  };

  const getLowProductivityPeriod = () => {
    return data?.lowProductivityPeriods?.length > 0 ? data.lowProductivityPeriods[0] : null;
  };

  const highPeriod = getHighProductivityPeriod();
  const lowPeriod = getLowProductivityPeriod();
  const longestFocus = data?.longestFocusDuration || null;
  const productivePercentage = data?.productiveTimePercentage || 0;
  const switchFrequency = data?.switchingFrequency || 0;

  const highPeriodDuration = highPeriod?.duration || 0;
  const lowPeriodDuration = lowPeriod?.duration || 0;
  const longestFocusDuration = longestFocus?.duration || 0;
  
  return (
    <div className="w-full p-6 rounded-lg">
      <div className="space-y-6">
        {/* Main Productivity Indicator */}
        <Card>
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 flex flex-col justify-center">
              <h3 className="text-lg font-medium mb-2">Productivity Score</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-5xl font-bold">{productivePercentage}%</div>
                <div className="flex flex-col">
                  <Badge className="mb-1 bg-secondary text-secondary-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {calculateTotalTime()} total
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {switchFrequency} {switchFrequency === 1 ? "context switch" : "context switches"}
                  </Badge>
                </div>
              </div>
              
              <Progress
                value={productivePercentage}
                className="h-3 bg-secondary"
              />
            </div>
            
            <div className="lg:w-1/3 bg-muted p-6 border-l border-border">
              <h4 className="font-medium mb-3">Focus Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">High Productivity</span>
                  <span className="font-medium">{formatDuration(highPeriodDuration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Low Productivity</span>
                  <span className="font-medium">{formatDuration(lowPeriodDuration)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                  <span className="text-muted-foreground">Longest Focus</span>
                  <span className="font-medium">{formatDuration(longestFocusDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Productivity Periods Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Productivity Period */}
          <Card>
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <ArrowUp className="mr-2 h-5 w-5 text-foreground" /> 
                  High Productivity
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground">
                  {formatDuration(highPeriodDuration)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">TIME PERIOD</div>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {highPeriod ? `${formatTime(highPeriod.startTime)} - ${formatTime(highPeriod.endTime)}` : "No data available"}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">CONTRIBUTING FACTORS</div>
                {highPeriod && highPeriod.contributingFactors?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {highPeriod.contributingFactors.map((factor, index) => (
                      <div key={index} className="flex items-center px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {factor}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 bg-muted rounded-md text-sm">No factors identified</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Low Productivity Period */}
          <Card>
            <CardHeader className="pb-2 border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <ArrowDown className="mr-2 h-5 w-5" /> 
                  Low Productivity
                </CardTitle>
                <Badge variant="outline" className="border-border">
                  {formatDuration(lowPeriodDuration)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-4">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">TIME PERIOD</div>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {lowPeriod ? `${formatTime(lowPeriod.startTime)} - ${formatTime(lowPeriod.endTime)}` : "No data available"}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">POSSIBLE CAUSE</div>
                {lowPeriod && lowPeriod.possibleCause ? (
                  <div className="flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">
                    <XCircle className="h-3 w-3 mr-2" />
                    {lowPeriod.possibleCause}
                  </div>
                ) : (
                  <div className="p-2 bg-muted rounded-md text-sm">No cause identified</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Longest Focus Session */}
        <Card className="bg-gradient-to-r from-muted to-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-secondary p-2 rounded-md mr-4">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">Longest Focus Session</h3>
                  <p className="text-sm text-muted-foreground">{longestFocus?.description || "No description available"}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatDuration(longestFocusDuration)}</div>
                <p className="text-xs text-muted-foreground">
                  Context Group: {longestFocus?.contextGroupId || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <CardFooter className="p-0 pt-2 text-xs text-right text-muted-foreground">
          Data captured on {new Date().toLocaleDateString()} • Productive time: {productivePercentage}% of session
        </CardFooter>
      </div>
    </div>
  );
};

export default ProductivityAnalysis;