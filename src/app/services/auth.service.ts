
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/loginrequest';
import { LoginResponse } from '../models/loginresponse';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'token';
  private readonly EXP_KEY = 'token_exp';

  private readonly http = inject(HttpClient);

  private readonly tokenUrl =
    `${environment.apiUrl}/v1/login`;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.tokenUrl,
      credentials
    );
  }

  setSession(
    token: string,
    expiration: string
  ): void {

    localStorage.setItem(
      this.TOKEN_KEY,
      token
    );

    localStorage.setItem(
      this.EXP_KEY,
      expiration
    );
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }

  getExpiration(): string | null {
    return localStorage.getItem(
      this.EXP_KEY
    );
  }

  isTokenExpired(): boolean {

    const expiration =
      this.getExpiration();

    if (!expiration) {
      return true;
    }

    return new Date(expiration) < new Date();
  }

  logout(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      this.EXP_KEY
    );
  }

  isLoggedIn(): boolean {

    return !!this.getToken()
      && !this.isTokenExpired();
  }
}

