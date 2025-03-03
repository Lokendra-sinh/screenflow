

export interface JobExtractorResponse {
    sessionSummary: SessionSummary;
    jobPostings: JobPosting[];
  }
  
  export interface SessionSummary {
    platforms: string[];
    totalJobsFound: number;
    browsingDuration: string;
    primaryJobTypes: string[];
    salaryRange: string | null;
    remoteJobs: number;
    onSiteJobs: number;
  }
  
  export interface JobPosting {
    id: string;
    sourceInfo: SourceInfo;
    basicInfo: BasicInfo;
    roleDetails: RoleDetails;
    applicationInfo: ApplicationInfo;
    companyInsights: CompanyInsights;
  }
  
  export interface SourceInfo {
    platform: string;
    url: string;
    company: Company;
    originalTimestamp: string;
  }
  
  export interface Company {
    name: string;
    batchInfo: string | null;
    size: string | null;
    funding: string | null;
    description: string | null;
    location: string | null;
    industry: string | null;
  }
  
  export interface BasicInfo {
    title: string;
    employmentType: string | null;
    workplaceType: string | null;
    location: string | null;
    compensation: Compensation;
    experienceRequired: string | null;
    visaSponsorship: string | null;
    postedDate: string | null;
    applicationStatus: string | null;
  }
  
  export interface Compensation {
    salary: string | null;
    equity: string | null;
    benefits: string[] | null;
  }
  
  export interface RoleDetails {
    requiredSkills: string[];
    description: string | null;
    responsibilities: string[] | null;
    techStack: string[] | null;
    teamStructure: string | null;
  }
  
  export interface ApplicationInfo {
    applyLink: string | null;
    applicationProcess: string | null;
    deadline: string | null;
    contactInfo: string | null;
    referralOption: string | null;
  }
  
  export interface CompanyInsights {
    culturalNotes: string | null;
    growthStage: string | null;
    redFlags: string[] | null;
  }