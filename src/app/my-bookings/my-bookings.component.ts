import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../models/booking.model';
import { BookingService } from '../core/services/booking.service';
import { AuthService } from '../core/services/auth.service';
import { PaymentService } from '../payment.service';
import { OrderDto } from '../models/OrderDto';

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
    private authService: AuthService,
    private paymentService: PaymentService
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
        // Sort bookings by createdAt in descending order (latest first)
        this.bookings = data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err) => {
        console.error('Failed to load bookings for owner:', err);
      }
    });
  }

  loadMyRequests(): void {
    this.bookingService.getMyRequests().subscribe({
      next: (res) => {
        // Sort myRequests by createdAt in descending order (latest first)
        this.myRequests = res.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err) => {
        console.error('Error loading my booking requests', err);
      }
    });
  }

  approve(id: number): void {
    this.bookingService.approveBooking(id).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.error('Failed to approve booking:', err)
    });
  }

  reject(id: number): void {
    this.bookingService.rejectBooking(id).subscribe({
      next: () => this.loadBookings(),
      error: (err) => console.error('Failed to reject booking:', err)
    });
  }

  cancel(id: number): void {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.loadBookings();
          this.loadMyRequests();
        },
        error: (err) => console.error('Failed to cancel booking:', err)
      });
    }
  }

  payNow(booking: Booking): void {
    if (!booking.renterId || !booking.renterEmail || !booking.renterPhoneNumber) {
      console.error('Missing booking user details');
      return;
    }

    const order: OrderDto = {
      amount: booking.totalPrice,
      userId: booking.renterId,
      email: booking.renterEmail,
      phone: booking.renterPhoneNumber,
      bookingId: booking.id,
      itemName: booking.itemName,
      itemImage: booking.itemImage
    };

    this.paymentService.startPayment(order);
  }
}