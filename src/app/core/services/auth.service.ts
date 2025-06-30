import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  getCurrentUser(): any {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.nameid,
      email: decoded.email,
      FullName: decoded.unique_name || decoded.name || '', // adjust key as per your token
      role: decoded.role
    };
  } catch (e) {
    return null;
  }
}

  register(data:any)
  {
    return this.http.post(`${this.apiUrl}/Auth/register`, data);
  }

 login(credentials: {emailOrPhone: string; password: string}): Observable<any> {
  return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
}
isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
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

