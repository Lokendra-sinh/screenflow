import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, ArrowRight, BookOpen, Zap, Code, Hash, FileText, CheckCircle, ArrowRightCircle } from 'lucide-react';

export const ContextFlow = ({ contextData }) => {

  const data = contextData || {
    contextGroups: [
      {
        app: "Visual Studio Code",
        content: {
          keyTerms: ["DailyPulseResponse", "ScreenpipeRecord", "context groups", "flow state", "productivity analysis"],
          knowledgePoints: [
            "System designed to analyze cognitive and behavioral patterns from screen captures",
            "Implements context grouping based on apps and temporal proximity",
            "Tracks flow states and productivity metrics",
            "Generates insights about digital behavior patterns",
            "Focuses on objective patterns rather than personal judgments"
          ],
          summary: "Reviewing and working on the daily pulse analyzer system implementation",
          title: "Daily Pulse Prompt Implementation",
          topSentences: [
            "You are an expert cognitive and behavioral analysis system that processes screen capture data",
            "Analyze screen capture data to generate rich insights about user's digital activity patterns",
            "Group related frames into logical context groups based on application, URL, and temporal proximity"
          ]
        },
        duration: 45000,
        endTime: "2025-03-03T03:12:15.142580Z",
        id: "cg-1",
        metrics: {
          activityType: "code-review",
          contentChangeRate: 0.2,
          focusScore: 80,
          frameRate: 1,
          interactionIntensity: 75,
          textDensity: 85
        },
        startTime: "2025-03-03T03:11:30.464639Z",
        type: "technical-documentation",
        url: null,
        windowName: "daily-pulse-prompt.ts — pipe"
      },
      {
        app: "Google Chrome",
        content: {
          keyTerms: ["Claude 3.7", "Grok 3", "AI models", "LLM"],
          knowledgePoints: [
            "Different AI models have different strengths and use cases",
            "Claude 3.7 has some limitations but remains useful",
            "Emerging pattern of using different AI models for different tasks",
            "Grok 3 focuses on current events and ideation",
            "AI models are being specialized for specific cognitive tasks"
          ],
          summary: "Reading discussions about AI models and their capabilities",
          title: "Twitter/X Feed Browsing",
          topSentences: [
            "Claude 3.7 is really not that smart but it's a great tool",
            "This is honestly fine. maybe what we get is a divergence - you don't use your full brain when you're writing code",
            "ChatGPT 4.5 for emotional intelligence. Claude 3.7 Thinking + Cursor Agent"
          ]
        },
        duration: 60000,
        endTime: "2025-03-03T03:13:58.031986Z",
        id: "cg-2",
        metrics: {
          activityType: "content-consumption",
          contentChangeRate: 0.5,
          focusScore: 50,
          frameRate: 1,
          interactionIntensity: 60,
          textDensity: 65
        },
        startTime: "2025-03-03T03:12:15.331648Z",
        type: "social-media",
        url: "x.com",
        windowName: "Home / X"
      }
    ],
    contextSwitches: [
      {
        fromContextId: "cg-1",
        id: "cs-1",
        reason: "information seeking",
        timestamp: "2025-03-03T03:12:15.331648Z",
        toContextId: "cg-2",
        transitionType: "app-switch"
      }
    ]
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

  // State to track which context card is expanded
  const [expandedContext, setExpandedContext] = useState(null);

  // Get the context switch details between two context groups
  const getContextSwitch = (fromId, toId) => {
    return data.contextSwitches.find(
      (cs) => cs.fromContextId === fromId && cs.toContextId === toId
    );
  };
  
  // Helper function to get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'code-review':
        return <Code className="h-4 w-4" />;
      case 'content-consumption':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Helper function to get color for focus score
  const getFocusColor = (score) => {
    if (score >= 75) return "bg-emerald-600";
    if (score >= 50) return "bg-emerald-500";
    return "bg-emerald-400";
  };

  const getActivityBadgeColor = (type) => {
    if (type === "technical-documentation") return "bg-emerald-700";
    if (type === "social-media") return "bg-emerald-400";
    return "bg-emerald-500";
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">Your Context Flow</h2>
        <p className="text-emerald-600">How you moved between different tasks and activities</p>
      </div>

      {/* Visual Timeline Flow */}
      <div className="relative mb-10 overflow-x-auto pb-2">
        <div className="flex items-center space-x-4">
          {data.contextGroups.map((context, index) => (
            <React.Fragment key={context.id}>
              {/* Context Card */}
              <div 
                className="min-w-64 rounded-xl bg-white border-2 border-emerald-200 shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer"
                onClick={() => setExpandedContext(expandedContext === context.id ? null : context.id)}
              >
                <div className="p-4 border-b border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-emerald-700 px-2 py-1">
                      <Monitor className="h-3 w-3 mr-1" />
                      {context.app}
                    </Badge>
                    <Badge className={`${getActivityBadgeColor(context.type)} px-2 py-1`}>
                      {getActivityIcon(context.metrics.activityType)}
                      <span className="ml-1 capitalize">{context.metrics.activityType}</span>
                    </Badge>
                  </div>
                  <h3 className="font-bold text-emerald-800 text-lg mb-1 truncate" title={context.content.title}>
                    {context.content.title}
                  </h3>
                  <p className="text-sm text-emerald-600 line-clamp-2">
                    {context.content.summary}
                  </p>
                </div>
                
                <div className="p-4 bg-emerald-50">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600">Duration</span>
                      <span className="font-bold text-emerald-800">{formatDuration(context.duration)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600">Focus Score</span>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getFocusColor(context.metrics.focusScore)} mr-1`}></div>
                        <span className="font-bold text-emerald-800">{context.metrics.focusScore}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600">Start</span>
                      <span className="font-medium text-emerald-800">{formatTime(context.startTime)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600">End</span>
                      <span className="font-medium text-emerald-800">{formatTime(context.endTime)}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Badge variant="outline" className="border-emerald-300 text-xs cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      setExpandedContext(expandedContext === context.id ? null : context.id);
                    }}>
                      {expandedContext === context.id ? "Show Less" : "Explore Context"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Context Switch Arrow (if not the last context) */}
              {index < data.contextGroups.length - 1 && (
                <div className="context-switch flex-shrink-0">
                  {(() => {
                    const contextSwitch = getContextSwitch(context.id, data.contextGroups[index + 1].id);
                    return (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <ArrowRight className="h-10 w-10 text-emerald-500" />
                          <div className="absolute -top-3 -right-3 bg-emerald-100 rounded-full p-1 border border-emerald-300">
                            <ArrowRightCircle className="h-4 w-4 text-emerald-700" />
                          </div>
                        </div>
                        {contextSwitch && (
                          <div className="mt-1 text-xs text-emerald-700 font-medium bg-emerald-100 px-2 py-1 rounded-full capitalize">
                            {contextSwitch.reason.replace(/-/g, ' ')}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Expanded Context Details */}
      {expandedContext && (
        <Card className="border-emerald-200 shadow-sm mb-6 overflow-hidden">
          <CardHeader className="pb-2 border-b border-emerald-100 bg-emerald-50">
            <CardTitle className="text-emerald-800">
              {data.contextGroups.find(c => c.id === expandedContext).content.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Key Terms & Metrics */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-emerald-800 font-semibold flex items-center mb-3">
                      <Hash className="h-4 w-4 mr-1" /> Key Terms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.contextGroups.find(c => c.id === expandedContext).content.keyTerms.map((term, i) => (
                        <Badge key={i} variant="outline" className="border-emerald-200 bg-emerald-50">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-emerald-800 font-semibold flex items-center mb-3">
                      <Zap className="h-4 w-4 mr-1" /> Activity Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(data.contextGroups.find(c => c.id === expandedContext).metrics).map(([key, value]) => (
                        <div key={key} className="bg-emerald-50 p-2 rounded-md">
                          <div className="text-xs text-emerald-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="font-bold text-emerald-800">
                            {typeof value === 'number' ? 
                              (key.toLowerCase().includes('rate') ? `${(value * 100).toFixed(0)}%` : value) : 
                              value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Knowledge & Content */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-emerald-800 font-semibold flex items-center mb-3">
                      <FileText className="h-4 w-4 mr-1" /> Key Insights
                    </h3>
                    <ul className="space-y-2">
                      {data.contextGroups.find(c => c.id === expandedContext).content.knowledgePoints.map((point, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-emerald-800 font-semibold flex items-center mb-3">
                      <BookOpen className="h-4 w-4 mr-1" /> Top Sentences
                    </h3>
                    <div className="space-y-2">
                      {data.contextGroups.find(c => c.id === expandedContext).content.topSentences.map((sentence, i) => (
                        <div key={i} className="p-2 bg-emerald-50 rounded-md text-sm border-l-2 border-emerald-300">
                          {sentence}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Switch Details */}
      {data.contextSwitches.length > 0 && (
        <Card className="border-emerald-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800 flex items-center">
              <ArrowRightCircle className="mr-2 h-5 w-5" /> Context Switches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.contextSwitches.map((contextSwitch) => {
                const fromContext = data.contextGroups.find(c => c.id === contextSwitch.fromContextId);
                const toContext = data.contextGroups.find(c => c.id === contextSwitch.toContextId);
                
                return (
                  <div key={contextSwitch.id} className="flex flex-col sm:flex-row sm:items-center p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="sm:w-1/3 mb-3 sm:mb-0">
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 text-emerald-700 mr-1" />
                        <span className="font-medium text-emerald-800 mr-2">{fromContext.app}</span>
                      </div>
                      <div className="text-sm text-emerald-600 ml-5 truncate" title={fromContext.content.title}>
                        {fromContext.content.title}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center sm:w-1/3">
                      <ArrowRight className="h-6 w-6 text-emerald-500 mb-1" />
                      <Badge className="bg-emerald-700 capitalize">
                        {contextSwitch.reason.replace(/-/g, ' ')}
                      </Badge>
                      <span className="text-xs text-emerald-600 mt-1">{formatTime(contextSwitch.timestamp)}</span>
                    </div>
                    
                    <div className="sm:w-1/3 mt-3 sm:mt-0">
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 text-emerald-700 mr-1" />
                        <span className="font-medium text-emerald-800 mr-2">{toContext.app}</span>
                      </div>
                      <div className="text-sm text-emerald-600 ml-5 truncate" title={toContext.content.title}>
                        {toContext.content.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
