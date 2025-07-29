import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../models/booking.model';
import { BookingService } from '../core/services/booking.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  myRequests: Booking[] = [];

  ownerId: string = '';
  userId: string = '';
  activeTab: 'bookingRequests' | 'myBookingRequests' = 'bookingRequests';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserData();
    if (user?.nameid) {
      this.ownerId = user.nameid;
      this.userId = user.nameid;

      this.loadBookings();
      this.loadMyRequests();
    } else {
      console.error('User not logged in or token invalid');
    }
  }

  loadBookings(): void {
    this.bookingService.getPendingBookingsByOwner(this.ownerId).subscribe({
      next: (data) => {
        this.bookings = data;
      },
      error: (err) => {
        console.error('Failed to load bookings for owner:', err);
      }
    });
  }

  loadMyRequests(): void {
    this.bookingService.getMyRequests().subscribe({
      next: (res) => {
        this.myRequests = res;
      },
      error: (err) => {
        console.error('Error loading my booking requests', err);
      }
    });
  }

  approve(id: number): void {
    this.bookingService.approveBooking(id).subscribe(() => this.loadBookings());
  }

  reject(id: number): void {
    this.bookingService.rejectBooking(id).subscribe(() => this.loadBookings());
  }
  cancel(id: number): void {
  if (confirm('Are you sure you want to cancel this booking?')) {
    this.bookingService.cancelBooking(id).subscribe({
      next: () => {
        this.loadBookings();
        this.bookingService.getMyRequests().subscribe({
          next: res => this.myRequests = res
        });
      },
      error: err => console.error('Failed to cancel booking:', err)
    });
  }
}

}
