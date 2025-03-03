
export type ScreenpipeRecord = {
    type: string; 
    content: {
      frameId: number;
      text: string;
      timestamp: string;
      filePath: string;
      offsetIndex: number;
      appName: string;
      windowName: string;
      browserUrl: string | null;
      tags: string[];
    }
  };
  

  export interface SessionInfo {
    id: string;
    startTime: string;
    endTime: string;
    duration: number; 
    frameCount: number;
  }
  
  export interface ContextGroupMetrics {
    textDensity: number;
    frameRate: number;
    contentChangeRate: number;
    interactionIntensity: number; // 0-100
    focusScore: number; // 0-100
    activityType: string; // e.g., "active-reading", "passive-browsing", "content-creation"
  }
  
  /**
   * Context group content
   */
  export interface ContextGroupContent {
    title: string;
    summary: string;
    keyTerms: string[];
    topSentences: string[];
    knowledgePoints: string[];
  }
  
  /**
   * Context Group
   */
  export interface ContextGroup {
    id: string;
    type: string; // e.g., "social-media", "technical-documentation", "job-search"
    app: string;
    url: string | null;
    windowName: string;
    startTime: string;
    endTime: string;
    duration: number; // in milliseconds
    metrics: ContextGroupMetrics;
    content: ContextGroupContent;
  }
  
  /**
   * Context Switch
   */
  export interface ContextSwitch {
    id: string;
    fromContextId: string;
    toContextId: string;
    timestamp: string;
    transitionType: string; // e.g., "topic-change", "app-switch", "related-content"
    reason: string; // Inferred reason for the switch, e.g., "information seeking", "distraction"
  }
  
  /**
   * Frequent Transition
   */
  export interface FrequentTransition {
    fromType: string;
    toType: string;
    count: number;
    pattern: string; // E.g., "Documentation to Code Editor", "Email to Social Media"
  }
  
  /**
   * Flow State
   */
  export interface FlowState {
    id: string;
    startTime: string;
    endTime: string;
    duration: number; // in milliseconds
    contextGroupIds: string[]; // which context groups were part of this flow state
    intensity: number; // 0-100
    activityDescription: string;
    productivityScore: number; // 0-100, assessment of productivity during this flow state
    distractionResistance: number; // 0-100, how resistant the user was to distractions
  }
  
  /**
   * Time Distribution by App
   */
  export interface TimeDistributionApp {
    app: string;
    percentage: number;
    totalDuration: number; // in milliseconds
  }
  
  /**
   * Time Distribution by Type
   */
  export interface TimeDistributionType {
    type: string;
    percentage: number;
    totalDuration: number; // in milliseconds
  }
  
  /**
   * Time Distribution by Domain
   */
  export interface TimeDistributionDomain {
    domain: string;
    percentage: number;
    totalDuration: number; // in milliseconds
  }
  
  /**
   * Time Distribution
   */
  export interface TimeDistribution {
    byApp: TimeDistributionApp[];
    byType: TimeDistributionType[];
    byDomain: TimeDistributionDomain[];
  }
  
  /**
   * Low Productivity Period
   */
  export interface LowProductivityPeriod {
    startTime: string;
    endTime: string;
    duration: number; // in milliseconds
    possibleCause: string; // e.g., "frequent context switching", "low engagement content"
  }
  
  /**
   * High Productivity Period
   */
  export interface HighProductivityPeriod {
    startTime: string;
    endTime: string;
    duration: number; // in milliseconds
    contributingFactors: string[]; // e.g., ["sustained focus", "deep content engagement"]
  }
  
  /**
   * Longest Focus Duration
   */
  export interface LongestFocusDuration {
    duration: number; // in milliseconds
    contextGroupId: string;
    description: string;
  }
  
  /**
   * Productivity Analysis
   */
  export interface ProductivityAnalysis {
    productiveTimePercentage: number; // estimated % of time spent productively
    lowProductivityPeriods: LowProductivityPeriod[];
    highProductivityPeriods: HighProductivityPeriod[];
    switchingFrequency: number; // avg number of context switches per hour
    longestFocusDuration: LongestFocusDuration;
  }
  
  /**
   * Top Activity
   */
  export interface TopActivity {
    type: string;
    durationPercentage: number;
    description: string;
  }
  
  /**
   * Interest Category
   */
  export interface InterestCategory {
    name: string;
    relevanceScore: number; // 0-100
    examples: string[];
  }
  
  /**
   * Behavioral Pattern
   */
  export interface BehavioralPattern {
    pattern: string;
    confidence: number; // 0-100
    evidence: string;
    impact: string; // e.g., "positive for focus", "may reduce productivity"
  }
  
  /**
   * Knowledge Area
   */
  export interface KnowledgeArea {
    area: string;
    terms: string[];
    relevance: number; // 0-100
  }
  
  /**
   * Insights
   */
  export interface Insights {
    topActivities: TopActivity[];
    interestCategories: InterestCategory[];
    behavioralPatterns: BehavioralPattern[];
    knowledgeAreas: KnowledgeArea[];
  }
  
  /**
   * Key Insight
   */
  export interface KeyInsight {
    text: string;
    source: string; // contextGroup where this was found
    relevance: number; // 0-100
    category: string; // e.g., "technical", "business", "personal development"
  }
  
  /**
   * Actionable Item
   */
  export interface ActionableItem {
    text: string;
    source: string;
    priority: number; // 0-100
  }
  
  /**
   * Learning Moment
   */
  export interface LearningMoment {
    concept: string;
    explanation: string;
    source: string;
  }
  
  /**
   * Knowledge Collection
   */
  export interface KnowledgeCollection {
    keyInsights: KeyInsight[];
    actionableItems: ActionableItem[];
    learningMoments: LearningMoment[];
  }
  
  /**
   * Time Point
   */
  export interface TimePoint {
    timestamp: string;
    contextGroupId: string;
    intensity: number; // 0-100
    eventType: string | null; // e.g., "context-switch", "flow-start", "flow-end", null for regular points
    productivityScore: number; // 0-100
  }
  
  /**
   * Intensity Curve Point
   */
  export interface IntensityCurvePoint {
    x: number; // time offset in milliseconds from start
    y: number; // intensity value 0-100
    contextGroupId: string;
    productivityScore: number; // 0-100
  }
  
  /**
   * Activity Heatmap Entry
   */
  export interface ActivityHeatmapEntry {
    timeSlot: string; // e.g., "09:00-09:30"
    intensity: number; // 0-100
    dominantActivity: string;
    switchFrequency: number; // number of switches in this time slot
  }
  
  /**
   * Timeline
   */
  export interface Timeline {
    timePoints: TimePoint[];
    intensityCurve: IntensityCurvePoint[];
    activityHeatmap: ActivityHeatmapEntry[];
  }
  
  /**
   * Daily Pulse Response
   * Main interface for the complete Daily Pulse data
   */
  export interface DailyPulseResponse {
    session: SessionInfo;
    contextGroups: ContextGroup[];
    contextSwitches: ContextSwitch[];
    frequentTransitions: FrequentTransition[];
    flowStates: FlowState[];
    timeDistribution: TimeDistribution;
    productivityAnalysis: ProductivityAnalysis;
    insights: Insights;
    knowledgeCollection: KnowledgeCollection;
    timeline: Timeline;
  }
  
  /**
   * A utility type for extracted Daily Pulse data with optional properties
   * to handle cases where some data might be missing
   */
  export interface ExtractedDailyPulseData {
    session?: SessionInfo;
    contextGroups?: ContextGroup[];
    contextSwitches?: ContextSwitch[];
    frequentTransitions?: FrequentTransition[];
    flowStates?: FlowState[];
    timeDistribution?: TimeDistribution;
    productivityAnalysis?: ProductivityAnalysis;
    insights?: Insights;
    knowledgeCollection?: KnowledgeCollection;
    timeline?: Timeline;
  }
  
  /**
   * Type guard functions to check if data exists and is properly formatted
   */
  
  export function isValidTimeDistribution(data: any): data is TimeDistribution {
    return data && 
           Array.isArray(data.byApp) && 
           Array.isArray(data.byType) && 
           Array.isArray(data.byDomain);
  }
  
  export function isValidProductivityAnalysis(data: any): data is ProductivityAnalysis {
    return data && 
           typeof data.productiveTimePercentage === 'number' &&
           Array.isArray(data.lowProductivityPeriods) &&
           Array.isArray(data.highProductivityPeriods) &&
           typeof data.switchingFrequency === 'number' &&
           data.longestFocusDuration !== undefined;
  }
  
  export function isValidContextData(data: any): boolean {
    return data && 
           Array.isArray(data.contextGroups) && 
           Array.isArray(data.contextSwitches);
  }
  
  /**
   * Default/empty objects for use when data is missing
   */
  
  export const emptyTimeDistribution: TimeDistribution = {
    byApp: [],
    byType: [],
    byDomain: []
  };
  
  export const emptyProductivityAnalysis: ProductivityAnalysis = {
    productiveTimePercentage: 0,
    lowProductivityPeriods: [],
    highProductivityPeriods: [],
    switchingFrequency: 0,
    longestFocusDuration: {
      duration: 0,
      contextGroupId: '',
      description: 'No focus periods detected'
    }
  };
  
  export const emptyContextData = {
    contextGroups: [],
    contextSwitches: []
  };
  
  export const emptyTimeline: Timeline = {
    timePoints: [],
    intensityCurve: [],
    activityHeatmap: []
  };