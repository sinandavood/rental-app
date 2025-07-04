import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { jwtDecode } from 'jwt-decode';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface JwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  FullName?: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<JwtPayload | null>(null);
  user$ = this.userSubject.asObservable();

  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {
    // ✅ Initialize user data on service creation
    this.initializeUserData();
  }

  // ✅ Initialize user data from stored token
  private initializeUserData(): void {
    const token = localStorage.getItem('token');
    if (token && this.isTokenValid()) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        this.userSubject.next(decoded);
        
        // Ensure profile pic is stored if available
        if (decoded.picture) {
          localStorage.setItem('profilePic', decoded.picture);
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
        this.clearUserData();
      }
    } else {
      this.clearUserData();
    }
  }

  getCurrentUser(): JwtPayload | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: JwtPayload = jwtDecode(token);
      this.userSubject.next(decoded);

      // Store picture from token into localStorage
      if (decoded.picture) {
        localStorage.setItem('profilePic', decoded.picture);
      }

      return decoded;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, data);
  }

  login(credentials: {emailOrPhone: string; password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && this.isTokenValid();
  }

  loginWithGoogle(credentials: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-type', 'application/json');
    return this.http.post(`${this.apiUrl}/Auth/google-login`, JSON.stringify(credentials), { headers });
  }

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

  refreshToken(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/Auth/refresh-token`, { token });
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  logout(): void {
   localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('profilePic'); // ✅ clear image
  this.router.navigate(['/auth/login']);
  }

  // ✅ Clear all user data
  private clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('profilePic');
    this.userSubject.next(null);
  }

  // ✅ Enhanced saveUserData method
  saveUserData(token: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

    try {
      const decoded: JwtPayload = jwtDecode(token);
      
      // Store profile picture if available
      if (decoded.picture) {
        localStorage.setItem('profilePic', decoded.picture);
      } else {
        localStorage.removeItem('profilePic');
      }

      // Update user subject
      this.userSubject.next(decoded);
    } catch (e) {
      console.error('Failed to decode token:', e);
      this.clearUserData();
    }
  }

getUserProfilePicById(userId: string) {
  return this.http.get<{ profileImage: string }>(`${environment.apiBaseUrl}/User/${userId}/profile-image`);
}


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  getUserProfilePic(): string | null {
    return localStorage.getItem('profilePic');
  }

  // ✅ Get current user data synchronously
  getCurrentUserData(): JwtPayload | null {
    return this.userSubject.value;
  }
}