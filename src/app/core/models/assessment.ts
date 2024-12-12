
  // src/app/core/interfaces/assessment.interface.ts
  export enum AssessmentType {
    IQ = 'IQ',
    PSYCHOLOGICAL = 'PSYCHOLOGICAL',
    LEARNING_DIFFICULTIES = 'LEARNING_DIFFICULTIES'
  }
  
  export enum AssessmentStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED'
  }
  
  export interface AssessmentDTO {
    assessmentId: number;
    caseId: number;
    assessmentType: AssessmentType;
    score?: number;
    assessmentDate: Date;
    nextAssessmentDate?: Date;
    assessorId: number;
    recommendations?: string;
    status: AssessmentStatus;
  }

  export interface AssessmentResponseDTO extends AssessmentDTO {
    caseName: string;
    assessorName: string;
  }