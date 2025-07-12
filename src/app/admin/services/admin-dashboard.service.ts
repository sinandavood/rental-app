// src/app/admin/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
  totalUsers: number;
  verifiedUsers: number;
  blockedUsers: number;
  totalItems: number;
  pendingItems: number;
  bookingsThisMonth: number;
  revenue: number;
  complaints: Complaint[];
  recentActivities: Activity[];
}

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
  private baseUrl = '/api/admin'; // Adjust base path if needed

  constructor(private http: HttpClient) {}

  /**
   * Gets overall dashboard metrics.
   */
  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard-summary`);
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

  /**
   * Optionally: Get item approval queue
   */
  getPendingItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items/pending`);
  }
}

