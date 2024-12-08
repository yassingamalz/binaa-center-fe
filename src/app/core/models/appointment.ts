  // src/app/core/interfaces/appointment.interface.ts
  export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum AppointmentType {
    ASSESSMENT = 'ASSESSMENT',
    THERAPY = 'THERAPY',
    CONSULTATION = 'CONSULTATION'
  }
  
  export interface AppointmentDTO {
    appointmentId: number;
    caseId: number;
    staffId: number;
    dateTime: Date;
    status: AppointmentStatus;
    type: AppointmentType;
    notes?: string;
  }