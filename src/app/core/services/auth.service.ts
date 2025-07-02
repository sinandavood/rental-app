import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { jwtDecode } from 'jwt-decode';
import { HttpHeaders } from '@angular/common/http';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { BehaviorSubject } from 'rxjs';


export interface JwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  FullName?: string; // Optional in case it's missing
  picture?:string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private userSubject = new BehaviorSubject<JwtPayload | null>(null);
  user$ = this.userSubject.asObservable();

  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  getCurrentUser(): JwtPayload | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    this.userSubject.next(decoded);

    // ✅ Store picture from token into localStorage
    if (decoded.picture) {
      localStorage.setItem('profilePic', decoded.picture);
    }

    return decoded;
  } catch (e) {
    return null;
  }
}

  register(data: any) {
    return this.http.post(`${this.apiUrl}/Auth/register`, data);
  }

  login(credentials: {emailOrPhone: string; password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ Google Login with JWT
  loginWithGoogle(credentials:string):Observable<any>{
    const header= new HttpHeaders().set('Content-type','application/json');
    return this.http.post(this.apiUrl+"/Auth/google-login",JSON.stringify(credentials),{headers:header});
  }

  // ✅ Verify JWT Token
  verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/Auth/verify-token`, { headers });
  }

  // ✅ Refresh JWT Token
  refreshToken(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/Auth/refresh-token`, { token });
  }

  // ✅ Enhanced token validation
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
    window.location.reload();
  }

saveUserData(token: string, role: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);

  try {
    const decoded: any = jwtDecode(token);
    if (decoded.picture) {
      localStorage.setItem('profilePic', decoded.picture);
    } else {
      localStorage.removeItem('profilePic'); // fallback
    }

    this.userSubject.next(decoded);
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
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


  getUserProfilePic(): string | null {
  return localStorage.getItem('profilePic');
}

}