  // src/app/core/models/report.ts
  export enum ReportType {
    REGISTRATION = 'REGISTRATION',
    PROGRESS = 'PROGRESS',
    ASSESSMENT = 'ASSESSMENT',
    ATTENDANCE = 'ATTENDANCE'
  }

  export interface ReportGenerationRequest {
    caseId: number;
    reportType: ReportType;
    metadata?: any;
  }
  
  export interface ReportDTO {
    reportId: number;
    caseId: number;
    sessionId?: number;
    type: ReportType;
    reportContent: string;
    createdDate: Date;
  }