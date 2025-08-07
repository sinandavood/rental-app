import { Injectable } from '@angular/core';
import { environment } from 'src/app/env/environment-development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from 'src/app/models/booking.model';
import { AuthService } from 'src/app/core/services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class BookingService {
  apiUrl: string = `${environment.apiBaseUrl}/booking`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(this.apiUrl, bookingData);
  }

  approveBooking(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectBooking(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, {});
  }

  markAsPaid(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/mark-paid`, {});
  }

  markAsCompleted(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/complete`, {});
  }

  getBookingsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  getBookingById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getPendingBookingsByOwner(ownerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending/owner/${ownerId}`);
  }
  checkExistingBooking(itemId: number, renterId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-existing`, {
      params: {
        itemId: itemId.toString(),
        renterId: renterId
      }
    });
  }

  getMyRequests(): Observable<Booking[]> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('User is not authenticated');
    }

    const renterId = this.authService.getUserIdFromToken(token);
    return this.http.get<Booking[]>(`${this.apiUrl}/my-requests?renterId=${renterId}`);
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancel/${id}`, null);
  }





}
