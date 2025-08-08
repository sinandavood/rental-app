import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../models/booking.model';
import { BookingService } from '../core/services/booking.service';
import { AuthService } from '../core/services/auth.service';
import { PaymentService } from '../payment.service';
import { OrderDto } from '../models/OrderDto';
import Swal from 'sweetalert2'; // Import SweetAlert2

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
  isLoadingMyRequests: boolean = true;
  isLoadingBookings: boolean = true;

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
      this.isLoadingBookings = false;
      this.isLoadingMyRequests = false;
    }
  }

  loadBookings(): void {
    this.isLoadingBookings = true; // Start loading
    this.bookingService.getPendingBookingsByOwner(this.ownerId).subscribe({
      next: (data) => {
        this.bookings = data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoadingBookings = false; // Stop loading on success
      },
      error: (err) => {
        console.error('Failed to load bookings for owner:', err);
        this.isLoadingBookings = false; // Stop loading on error
      }
    });
  }

  loadMyRequests(): void {
    this.isLoadingMyRequests = true; // Start loading
    this.bookingService.getMyRequests().subscribe({
      next: (res) => {
        this.myRequests = res.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoadingMyRequests = false; // Stop loading on success
      },
      error: (err) => {
        console.error('Error loading my booking requests', err);
        this.isLoadingMyRequests = false; // Stop loading on error
      }
    });
  }

  approve(id: number): void {
    Swal.fire({
      title: 'Approve this booking?',
      text: "The renter will be notified that their request is approved.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, approve it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.approveBooking(id).subscribe({
          next: () => {
            Swal.fire('Approved!', 'The booking has been approved.', 'success');
            this.loadBookings();
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to approve the booking.', 'error');
            console.error('Failed to approve booking:', err);
          }
        });
      }
    });
  }

  reject(id: number): void {
    Swal.fire({
      title: 'Reject this booking?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reject it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.rejectBooking(id).subscribe({
          next: () => {
            Swal.fire('Rejected!', 'The booking has been rejected.', 'success');
            this.loadBookings();
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to reject the booking.', 'error');
            console.error('Failed to reject booking:', err);
          }
        });
      }
    });
  }

  cancel(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.cancelBooking(id).subscribe({
          next: () => {
            Swal.fire('Cancelled!', 'The booking has been cancelled.', 'success');
            this.loadMyRequests(); // Refresh the list
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to cancel the booking.', 'error');
            console.error('Failed to cancel booking:', err);
          }
        });
      }
    });
  }

   payNow(booking: Booking): void {
    // --- ✅ FINAL FIX: Make the check less strict ---
    // We only absolutely need the renter's ID and Email to process a payment.
    // The phone number can be optional.
    if (!booking.renterId || !booking.renterEmail) {
      console.error('CRITICAL: Missing renter ID or Email. Cannot proceed with payment.');
      Swal.fire('Error', 'Could not initiate payment due to missing user details.', 'error');
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