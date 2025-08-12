import { Injectable } from '@angular/core';
import { environment } from 'src/app/env/environment-development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from 'src/app/models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl: string = `${environment.apiBaseUrl}/booking`;

  constructor(private http: HttpClient) { }

  /**
   * ✅ UPDATED: Creates a new booking.
   * The payload should now be simpler, as the server handles user IDs.
   * @param bookingData An object like { itemId, startDate, endDate, totalPrice }
   */
  createBooking(bookingData: { itemId: number; startDate: Date; endDate: Date; totalPrice: number }): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, bookingData);
  }

  /**
   * ✅ NEW & REFACTORED: Gets all bookings related to the current user (as renter or owner).
   * This single method replaces getBookingsByUser, getPendingBookingsByOwner, getMyRequests, and getBookingHistory.
   * @param status (Optional) A string to filter bookings by status (e.g., 'Pending', 'Approved', 'Completed').
   * If no status is provided, it returns all bookings.
   */
  getMyBookings(status?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    // The new secure endpoint. No user ID is needed in the URL.
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`, { params });
  }

  // --- The following action methods remain unchanged as their routes are the same ---

  approveBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${id}/reject`, {});
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, null);
  }
  
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  // --- The methods below are now DEPRECATED and have been removed. ---
  // ❌ getBookingsByUser(userId: string) -> Replaced by getMyBookings()
  // ❌ getPendingBookingsByOwner(ownerId: string) -> Replaced by getMyBookings('Pending')
  // ❌ getMyRequests() -> Replaced by getMyBookings() and filtering on the frontend if needed
  // ❌ getBookingHistory() -> Replaced by getMyBookings() and filtering for 'Completed', 'Rejected', etc.
  // ❌ checkExistingBooking(itemId: number, renterId: string) -> This logic is now handled by the backend during createBooking.
}