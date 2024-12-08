  // src/app/core/interfaces/case.interface.ts
  export enum CaseStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }
  
  export interface CaseDTO {
    caseId: number;
    name: string;
    age: number;
    guardianName: string;
    contactNumber: string;
    specialNeeds?: string;
    admissionDate: Date;
    status: CaseStatus;
    emergencyContact: string;
    medicalHistory?: string;
    currentMedications?: string;
    allergies?: string;
    schoolName?: string;
    gradeLevel?: string;
    primaryDiagnosis?: string;
    secondaryDiagnosis?: string;
    insuranceInfo?: string;
  }