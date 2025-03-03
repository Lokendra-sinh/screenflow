export const extractDailyPulseData = (parsedData) => {
    if (!parsedData) return null;
  
    // Extract exactly as shown in the console structure
    return {
      // Direct top-level properties
      contextGroups: parsedData.contextGroups || [],
      contextSwitches: parsedData.contextSwitches || [],
      flowStates: parsedData.flowStates || [],
      frequentTransitions: parsedData.frequentTransitions || [],
      
      // Insights section
      insights: {
        topActivities: parsedData.insights?.topActivities || [],
        interestCategories: parsedData.insights?.interestCategories || [],
        behavioralPatterns: parsedData.insights?.behavioralPatterns || [],
        knowledgeAreas: parsedData.insights?.knowledgeAreas || []
      },
      
      // Knowledge collection
      knowledgeCollection: {
        keyInsights: parsedData.knowledgeCollection?.keyInsights || [],
        actionableItems: parsedData.knowledgeCollection?.actionableItems || [],
        learningMoments: parsedData.knowledgeCollection?.learningMoments || []
      },
      
      // Productivity analysis
      productivityAnalysis: {
        productiveTimePercentage: parsedData.productivityAnalysis?.productiveTimePercentage || 0,
        lowProductivityPeriods: parsedData.productivityAnalysis?.lowProductivityPeriods || [],
        highProductivityPeriods: parsedData.productivityAnalysis?.highProductivityPeriods || [],
        switchingFrequency: parsedData.productivityAnalysis?.switchingFrequency || 0,
        longestFocusDuration: parsedData.productivityAnalysis?.longestFocusDuration || null
      },
      
      // Session data
      session: {
        id: parsedData.session?.id || null,
        startTime: parsedData.session?.startTime || null,
        endTime: parsedData.session?.endTime || null,
        duration: parsedData.session?.duration || 0,
        frameCount: parsedData.session?.frameCount || 0
      },
      
      // Time distribution
      timeDistribution: {
        byApp: parsedData.timeDistribution?.byApp || [],
        byType: parsedData.timeDistribution?.byType || [],
        byDomain: parsedData.timeDistribution?.byDomain || []
      },
      
      // Timeline data
      timeline: {
        timePoints: parsedData.timeline?.timePoints || [],
        intensityCurve: parsedData.timeline?.intensityCurve || [],
        activityHeatmap: parsedData.timeline?.activityHeatmap || []
      }
    };
  };