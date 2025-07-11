import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { jwtDecode } from 'jwt-decode';
import { User } from 'src/app/models/user.model';

export interface JwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  FullName?: string;
  picture?: string;
  role?: string;
  iat?:number;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<JwtPayload | null>(null);
  user$ = this.userSubject.asObservable();
  apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {
    this.initializeUserData();
  }

  private initializeUserData(): void {
    const token = localStorage.getItem('token');
    if (token && this.isTokenValid()) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        this.userSubject.next(decoded);

        if (decoded.picture) {
          localStorage.setItem('profilePic', decoded.picture);
        }
        if (decoded.role) {
          localStorage.setItem('role', decoded.role);
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
        this.clearUserData();
      }
    } else {
      this.clearUserData();
    }
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, data);
  }

  login(credentials: { emailOrPhone: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
  }

  loginWithGoogle(idToken: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/Auth/google-login`, JSON.stringify(idToken), { headers });
  }

  saveUserData(token: string): void {
  localStorage.setItem('token', token);

  try {
    const decoded: JwtPayload = jwtDecode(token);

    // Save role and profile pic
    if (decoded.role) {
      localStorage.setItem('role', decoded.role);
    }

    if (decoded.picture) {
      localStorage.setItem('profilePic', decoded.picture);
    }

    this.userSubject.next(decoded);

    // ✅ Automatically redirect based on role here
    const role = decoded.role;
    if (role === 'Admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/products']);
    }

  } catch (e) {
    console.error('Failed to decode token:', e);
    this.clearUserData();
  }
}


  getCurrentUser(): JwtPayload | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: JwtPayload = jwtDecode(token);
      this.userSubject.next(decoded);
      return decoded;
    } catch (e) {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserProfilePic(): string | null {
    return localStorage.getItem('profilePic');
  }

  getUserProfilePicById(userId: string) {
    return this.http.get<{ profileImage: string }>(`${this.apiUrl}/User/${userId}/profile-image`);
  }

getUserProfile(userId: string): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/User/${userId}`);
}

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && this.isTokenValid();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  logout(): void {
    this.clearUserData();
    this.router.navigate(['/auth/login']);
  }

  private clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('profilePic');
    this.userSubject.next(null);
  }

  getCurrentUserData(): JwtPayload | null {
    return this.userSubject.value;
  }

  verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) throw new Error('No token found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/Auth/verify-token`, { headers });
  }

  refreshToken(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/Auth/refresh-token`, { token });
  }

  getUserFromBackend(): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/User/me`);
}

setUserFromBackend(user: User): void {
  const newPayload: JwtPayload = {
    nameid: user.id,
    email: user.email,
    unique_name: user.fullName, // 👈 full name goes here
    FullName: user.fullName,
    picture: user.photoUrl,
    role: this.getUserRole()?? undefined,
    phoneNumber: user.phoneNumber.toString(),
    iat: Math.floor(Date.now() / 1000)
  };

  this.userSubject.next(newPayload);
  localStorage.setItem('profilePic', user.photoUrl ?? '');
}



}
