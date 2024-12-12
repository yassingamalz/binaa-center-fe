// src/app/core/interfaces/session.interface.ts
export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT'
}

export interface SessionDTO {
  sessionId: number;
  caseId: number;
  purpose: string;
  sessionDate: Date;
  notes?: string;
  staffId: number;
  sessionType: SessionType;
  attendanceStatus: AttendanceStatus;
  duration: number;
  goalsAchieved?: string;
  nextSessionPlan?: string;
  attachments?: string;
}

export interface SessionResponseDTO extends SessionDTO {
  caseName: string;
  staffName: string;
  sessionTime?: string;
  statusLabel?: string;
  typeLabel?: string;
}