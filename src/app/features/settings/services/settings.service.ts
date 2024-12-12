import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface CenterSettings {
  centerInfo: {
    centerName: string;
    address: string;
    phone: string;
    email: string;
    taxNumber?: string;
    website?: string;
    description?: string;
    logo?: File | null;
  };
  workingHours: {
    workingDays: {
      [key: string]: boolean;
    };
    startTime: string;
    endTime: string;
    sessionDuration: number;
    breakTime: number;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: File | null;
  preferences: {
    notifications: boolean;
    language: string;
    theme: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private endpoint = 'settings';

  constructor(private apiService: ApiService) {}

  // Center Settings Methods
  getCenterSettings(): Observable<CenterSettings> {
    return this.apiService.get<CenterSettings>(`${this.endpoint}/center`);
  }

  updateCenterSettings(settings: CenterSettings): Observable<CenterSettings> {
    // Handle file upload if logo is present
    if (settings.centerInfo.logo instanceof File) {
      const formData = new FormData();
      formData.append('logo', settings.centerInfo.logo);
      formData.append('settings', JSON.stringify({
        ...settings,
        centerInfo: { ...settings.centerInfo, logo: undefined }
      }));

      return this.apiService.put<CenterSettings>(
        `${this.endpoint}/center`,
        formData,
      );
    }

    return this.apiService.put<CenterSettings>(`${this.endpoint}/center`, settings);
  }

  // User Profile Methods
  getUserProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`${this.endpoint}/user/profile`);
  }

  updateUserProfile(profile: UserProfile): Observable<UserProfile> {
    // Handle avatar upload if present
    if (profile.avatar instanceof File) {
      const formData = new FormData();
      formData.append('avatar', profile.avatar);
      formData.append('profile', JSON.stringify({
        ...profile,
        avatar: undefined
      }));

      return this.apiService.put<UserProfile>(
        `${this.endpoint}/user/profile`,
        formData,
      );
    }

    return this.apiService.put<UserProfile>(`${this.endpoint}/user/profile`, profile);
  }

  // Password Management
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/user/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Working Hours Management
  getWorkingHours(): Observable<any> {
    return this.apiService.get(`${this.endpoint}/working-hours`);
  }

  updateWorkingHours(workingHours: any): Observable<any> {
    return this.apiService.put(`${this.endpoint}/working-hours`, workingHours);
  }

  // Theme Management
  updateTheme(theme: string): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/user/theme`, { theme });
  }

  // Language Management
  updateLanguage(language: string): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/user/language`, { language });
  }

  // Notification Preferences
  updateNotificationPreferences(preferences: {
    notifications: boolean;
  }): Observable<void> {
    return this.apiService.put<void>(
      `${this.endpoint}/user/notifications`,
      preferences
    );
  }

  // Service Prices Management
  getServicePrices(): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/services/prices`);
  }

  updateServicePrices(prices: any[]): Observable<any[]> {
    return this.apiService.put<any[]>(`${this.endpoint}/services/prices`, prices);
  }

  // Backup Management
  createBackup(): Observable<any> {
    return this.apiService.post(`${this.endpoint}/backup/create`, {});
  }

  restoreBackup(backupFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup', backupFile);

    return this.apiService.post(
      `${this.endpoint}/backup/restore`,
      formData,
    );
  }

  // System Settings
  getSystemSettings(): Observable<any> {
    return this.apiService.get(`${this.endpoint}/system`);
  }

  updateSystemSettings(settings: any): Observable<any> {
    return this.apiService.put(`${this.endpoint}/system`, settings);
  }

  // Export Settings
  exportSettings(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    
    return this.apiService.get(`${this.endpoint}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Import Settings
  importSettings(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('settings', file);

    return this.apiService.post(
      `${this.endpoint}/import`,
      formData,
    );
  }
}