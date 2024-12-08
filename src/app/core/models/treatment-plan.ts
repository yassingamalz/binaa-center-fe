export interface TreatmentPlanDTO {
    planId: number;
    caseId: number;
    goals: string;
    startDate: Date;
    endDate?: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'ON-HOLD';
    progressNotes?: string;
    specialistId: number;
}