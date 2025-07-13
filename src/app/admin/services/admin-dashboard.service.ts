// src/app/admin/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from 'src/app/models/Dashboard-summary.model';
import { environment } from 'src/app/env/environment-development';
import { User_admin } from '../Admin_models/Users_Admin.model';
import { ListedItemAdmin } from '../Admin_models/ListedItemAdmin.model';

// export interface DashboardSummary {
//   totalUsers: number;
//   verifiedUsers: number;
//   blockedUsers: number;
//   totalItems: number;
//   pendingItems: number;
//   bookingsThisMonth: number;
//   revenue: number;
//   complaints: Complaint[];
//   recentActivities: Activity[];
// }

export interface Complaint {
  id: string;
  user: string;
  message: string;
  date: string;
}

export interface Activity {
  user: string;
  action: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiBaseUrl;// Adjust base path if needed

  constructor(private http: HttpClient) {}

  /**
   * Gets overall dashboard metrics.
   */
  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/admin/dashboard-summary`);
  }

  /**
   * Optionally: Get recent complaints separately
   */
  getRecentComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.baseUrl}/complaints/recent`);
  }

  /**
   * Optionally: Get latest activities (user actions, item updates etc.)
   */
  getRecentActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/activities/recent`);
  }

  /**
   * Optionally: Get recent registered users
   */
  getRecentUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/recent`);
  }

  getAllUsers():Observable<User_admin[]>{
    return this.http.get<User_admin[]>(`${this.baseUrl}/admin/users`);
  }

  /**
   * Optionally: Get item approval queue
   */
  getPendingItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items/pending`);
  }

  updateBlockStatus(userId: string, isBlocked: boolean): Observable<any> {
  return this.http.post(`${this.baseUrl}/admin/block-user/${userId}`, { isBlocked });
}

toggleUserBlock(url: string): Observable<any> {
  return this.http.post(url, null); // sending no body
}

deleteUser(userId: string): Observable<any> {
  return this.http.delete(`${this.baseUrl}/admin/delete-user/${userId}`);
}

getAllItems(): Observable<ListedItemAdmin[]> {
  return this.http.get<ListedItemAdmin[]>(`${this.baseUrl}/admin/GetAllitems`);
}



}

