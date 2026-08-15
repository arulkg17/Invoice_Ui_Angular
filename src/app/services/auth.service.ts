import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/loginrequest';
import { LoginResponse } from '../models/loginresponse';

import { environment } from '../../environments/environment';

interface JwtPayload {
  unique_name?: string;
  displayName?: string;
  given_name?: string;
  family_name?: string;
  nameid?: string;
  exp?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly EXP_KEY = 'token_exp';

  private readonly http = inject(HttpClient);

  private readonly tokenUrl = `${environment.apiUrl}/v1/login`;

  // Logged-in user name available throughout the application
  private readonly _currentUserName = signal<string | null>(
    this.getUserNameFromToken(),
  );

  readonly currentUserName = this._currentUserName.asReadonly();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.tokenUrl, credentials);
  }

  setSession(token: string, expiration: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);

    localStorage.setItem(this.EXP_KEY, expiration);

    // Update logged-in user immediately
    this._currentUserName.set(this.getUserNameFromToken());
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getExpiration(): string | null {
    return localStorage.getItem(this.EXP_KEY);
  }

  isTokenExpired(): boolean {
    const expiration = this.getExpiration();

    if (!expiration) {
      return true;
    }

    return new Date(expiration) < new Date();
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  getUserNameFromToken(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);

      // Prefer displayName
      if (payload.displayName) {
        return payload.displayName;
      }

      // Otherwise use first + last name
      if (payload.given_name || payload.family_name) {
        return `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim();
      }

      // Finally use login/user name
      return payload.unique_name ?? null;
    } catch (error) {
      console.error('Unable to decode JWT token', error);

      return null;
    }
  }

  private decodeToken(token: string): JwtPayload {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    const base64Url = parts[1];

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);

    localStorage.removeItem(this.EXP_KEY);

    this._currentUserName.set(null);
  }
}
