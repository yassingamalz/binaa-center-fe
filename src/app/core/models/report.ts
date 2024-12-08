export interface ReportDTO {
    reportId: number;
    caseId: number;
    sessionId?: number;
    reportContent: string;
    createdDate: Date;
}