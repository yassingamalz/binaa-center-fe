// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ApiService } from './api.service';
import { UserDTO } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtHelper: JwtHelperService
  ) {
    this.loadStoredUser();
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.post<{token: string}>('auth/login', { username, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const decodedToken = this.jwtHelper.decodeToken(response.token);
        this.currentUserSubject.next(decodedToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.currentUserSubject.next(decodedToken);
    }
  }
}