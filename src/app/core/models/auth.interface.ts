// src/app/core/interfaces/auth.interface.ts
export interface AuthResponse {
    token: string;
    user: {
      userId: number;
      username: string;
      role: UserRole;
    };
  }
  
  export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF'
  }
  