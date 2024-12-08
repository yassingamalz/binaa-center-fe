// src/app/core/interfaces/document.interface.ts
  export enum DocumentType {
    MEDICAL = 'MEDICAL',
    ASSESSMENT = 'ASSESSMENT',
    PROGRESS_REPORT = 'PROGRESS_REPORT'
  }
  
  export interface DocumentDTO {
    documentId: number;
    caseId: number;
    type: DocumentType;
    filePath: string;
    uploadDate: Date;
    uploadedBy: number;
  }