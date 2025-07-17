import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { jwtDecode } from 'jwt-decode';
import { User } from 'src/app/models/user.model';
import { NotificationService } from './notification.service';

export interface JwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  FullName?: string;
  picture?: string;
  role?: string;
  iat?: number;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<JwtPayload | null>(null);
  user$ = this.userSubject.asObservable();
  apiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private notificationService: NotificationService
  ) {
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

        // ✅ Initialize notifications on app start if user is logged in
        this.initializeNotifications(decoded.nameid);
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
    return this.http.post<{ token: string }>(`${this.apiUrl}/Auth/login`, credentials).pipe(
      tap(response => {
        const token = response.token;
        localStorage.setItem('token', token);

        try {
          const decoded: JwtPayload = jwtDecode(token);
          this.userSubject.next(decoded);

          // Save additional user data
          if (decoded.role) {
            localStorage.setItem('role', decoded.role);
          }
          if (decoded.picture) {
            localStorage.setItem('profilePic', decoded.picture);
          }

          // ✅ Initialize notifications immediately after login
          this.initializeNotifications(decoded.nameid);
        } catch (error) {
          console.error('Error decoding token after login:', error);
        }
      })
    );
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

      // ✅ Initialize notifications
      this.initializeNotifications(decoded.nameid);

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

  // ✅ New method to initialize notifications
  private initializeNotifications(userId: string): void {
    if (!userId) return;

    console.log('🔄 Initializing notifications for user:', userId);
    
    // Start SignalR connection
    this.notificationService.startConnection(userId);
    
    // Load past notifications
    const token = this.getToken();
    if (token) {
      fetch(`${this.apiUrl}/notifications/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('📊 Loading notifications:', data);
          this.notificationService.addInitialNotifications(data);
        })
        .catch(err => {
          console.error('❌ Error loading notifications:', err);
          // Don't break the app if notifications fail to load
        });
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

  getUserIdFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.nameid || ''; // nameid is default for userId in .NET Identity JWT
    } catch (err) {
      return '';
    }
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
    // ✅ Clean up notifications on logout
    this.notificationService.stopConnection();
    this.notificationService.resetUnreadCount();
    
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
      role: this.getUserRole() ?? undefined,
      phoneNumber: user.phoneNumber.toString(),
      iat: Math.floor(Date.now() / 1000)
    };

    this.userSubject.next(newPayload);
    localStorage.setItem('profilePic', user.photoUrl ?? '');
  }
}