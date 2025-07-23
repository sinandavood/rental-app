import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/env/environment-development';

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {

  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  broadcastPromotional(dto: { title: string; message: string; description: string }) {
    return this.http.post(`${this.apiBaseUrl}/notifications/broadcast/promotional`, dto);
  }
}
