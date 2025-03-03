export const extractDailyPulseData = (parsedData) => {

    if (!parsedData) return null;
  

    return {

      contextGroups: parsedData.contextGroups || [],
      contextSwitches: parsedData.contextSwitches || [],
      flowStates: parsedData.flowStates || [],
      frequentTransitions: parsedData.frequentTransitions || [],
      

      insights: {
        topActivities: parsedData.insights?.topActivities || [],
        interestCategories: parsedData.insights?.interestCategories || [],
        behavioralPatterns: parsedData.insights?.behavioralPatterns || [],
        knowledgeAreas: parsedData.insights?.knowledgeAreas || []
      },
      

      knowledgeCollection: {
        keyInsights: parsedData.knowledgeCollection?.keyInsights || [],
        actionableItems: parsedData.knowledgeCollection?.actionableItems || [],
        learningMoments: parsedData.knowledgeCollection?.learningMoments || []
      },
      

      productivityAnalysis: {
        productiveTimePercentage: parsedData.productivityAnalysis?.productiveTimePercentage || 0,
        lowProductivityPeriods: parsedData.productivityAnalysis?.lowProductivityPeriods || [],
        highProductivityPeriods: parsedData.productivityAnalysis?.highProductivityPeriods || [],
        switchingFrequency: parsedData.productivityAnalysis?.switchingFrequency || 0,
        longestFocusDuration: parsedData.productivityAnalysis?.longestFocusDuration || null
      },
      

      session: {
        id: parsedData.session?.id || null,
        startTime: parsedData.session?.startTime || null,
        endTime: parsedData.session?.endTime || null,
        duration: parsedData.session?.duration || 0,
        frameCount: parsedData.session?.frameCount || 0
      },
      

      timeDistribution: {
        byApp: parsedData.timeDistribution?.byApp || [],
        byType: parsedData.timeDistribution?.byType || [],
        byDomain: parsedData.timeDistribution?.byDomain || []
      },
      

      timeline: {
        timePoints: parsedData.timeline?.timePoints || [],
        intensityCurve: parsedData.timeline?.intensityCurve || [],
        activityHeatmap: parsedData.timeline?.activityHeatmap || []
      }
    };
  };