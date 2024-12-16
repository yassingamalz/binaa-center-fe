// src/app/core/interfaces/session.interface.ts
export enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT'
}

export const getSessionTypeLabel = (type: SessionType): string => {
  const labels = {
    [SessionType.INDIVIDUAL]: 'فردي',
    [SessionType.GROUP]: 'جماعي'
  };
  return labels[type];
};

export const getAttendanceStatusLabel = (status: AttendanceStatus): string => {
  const labels = {
    [AttendanceStatus.PRESENT]: 'حاضر',
    [AttendanceStatus.ABSENT]: 'غائب'
  };
  return labels[status];
};

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