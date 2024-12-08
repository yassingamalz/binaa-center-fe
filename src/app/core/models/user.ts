// src/app/core/interfaces/user.interface.ts
export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF'
  }
  
  export interface UserDTO {
    userId: number;
    username: string;
    role: UserRole;
  }
  