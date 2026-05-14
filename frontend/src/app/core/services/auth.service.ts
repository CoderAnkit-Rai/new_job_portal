import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'token';
  private cachedName: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRole(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      return this.decodeToken(token).role || '';
    } catch {
      return '';
    }
  }

  getEmail(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      return this.decodeToken(token).sub || '';
    } catch {
      return '';
    }
  }

  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  logout(): void {
    this.removeToken();
    this.cachedName = null;
    this.router.navigate(['/login']);
  }

  loadDisplayName(): Promise<string> {
    if (this.cachedName !== null) return Promise.resolve(this.cachedName || this.getEmail());
    this.cachedName = '';
    return new Promise(resolve => {
      this.http.get<any>(`${environment.apiUrl}/api/users/me`).subscribe({
        next: (res) => { this.cachedName = res.name || ''; resolve(this.cachedName || this.getEmail()); },
        error: () => resolve(this.getEmail())
      });
    }); 
  }

  redirectByRole(): void {
    const role = this.getRole();
    if (role === 'RECRUITER') {
      this.router.navigate(['/recruiter/dashboard']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/jobs']);
    }
  }
}
