import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; emailOrPhone: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

 login(credentials: {emailOrPhone: string; password: string}): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, credentials);
}


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  saveUserData(token: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
}

