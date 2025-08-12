import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Booking } from '../models/booking.model';
import { BookingService } from '../core/services/booking.service';
import { AuthService } from '../core/services/auth.service';
import { PaymentService } from '../payment.service';
import { OrderDto } from '../models/OrderDto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  // State for each category
  bookingRequests: Booking[] = [];
  myRequests: Booking[] = [];
  bookingHistory: Booking[] = [];
  
  userId: string = '';
  
  activeTab: 'bookingRequests' | 'myBookingRequests' | 'bookingHistory' = 'bookingRequests';
  
  // ✅ REFACTOR: Simplified to a single loading state.
  isLoading: boolean = true;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserData();
    if (user?.nameid) {
      this.userId = user.nameid;
      // ✅ REFACTOR: Call the single new data loading method.
      this.loadAllData();
    } else {
      console.error('User not logged in or token invalid');
      this.isLoading = false;
    }
  }

  // ✅ REFACTOR: New single method to fetch and process all data.
  loadAllData(): void {
    this.isLoading = true;
    // Call the new consolidated service method. No status is passed to get ALL bookings.
    this.bookingService.getMyBookings().subscribe({
      next: (allBookings) => {
        // Sort all bookings by creation date once.
        const sortedBookings = allBookings.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Filter the single list into the three categories needed by the template.
        this.bookingRequests = sortedBookings.filter(
          b => b.ownerId === this.userId && b.status === 'Pending'
        );

        this.myRequests = sortedBookings.filter(
          b => b.renterId === this.userId && (b.status === 'Pending' || b.status === 'Approved')
        );

        this.bookingHistory = sortedBookings.filter(
          b => b.status === 'Completed' || b.status === 'Rejected' || b.status === 'Cancelled'
        );
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load bookings data:', err);
        Swal.fire('Error', 'Could not load your booking information.', 'error');
        this.isLoading = false;
      }
    });
  }

  // --- The old loadBookings(), loadMyRequests(), and loadBookingHistory() methods are now removed. ---

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
            // ✅ REFACTOR: Refresh all data consistently.
            this.loadAllData();
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
            // ✅ REFACTOR: Refresh all data consistently.
            this.loadAllData();
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
      text: "You want to cancel this booking request.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookingService.cancelBooking(id).subscribe({
          next: () => {
            Swal.fire('Cancelled!', 'The booking has been cancelled.', 'success');
            // ✅ REFACTOR: Refresh all data consistently.
            this.loadAllData();
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
    if (!booking.renterId || !booking.renterEmail) {
      console.error('CRITICAL: Missing renter ID or Email. Cannot proceed with payment.');
      Swal.fire('Error', 'Could not initiate payment due to missing user details.', 'error');
      return;
    }

    const basePrice = booking.totalPrice;
    const platformFeeRate = 0.05; // 5%
    const taxRate = 0.10;         // 10% TDS (Tax Deducted at Source)
    const platformFee = basePrice * platformFeeRate;
    const taxableAmount = basePrice + platformFee;
    const taxes = taxableAmount * taxRate;
    const finalAmount = basePrice + platformFee + taxes;

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(value);

    const confirmationHtml = `
      <div class="text-left p-2 sm:p-4 space-y-3">
        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-600">Base Price:</span>
          <strong class="text-gray-800">${formatCurrency(basePrice)}</strong>
        </div>
        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-600">Platform Fee (5%):</span>
          <strong class="text-gray-800">+ ${formatCurrency(platformFee)}</strong>
        </div>
        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <span class="text-gray-600">Taxes (TDS @ 10%):</span>
          <strong class="text-gray-800">+ ${formatCurrency(taxes)}</strong>
        </div>
        <div class="flex justify-between items-center text-lg font-bold pt-2">
          <span>Total Payable:</span>
          <span class="text-blue-600">${formatCurrency(finalAmount)}</span>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Payment Summary',
      html: confirmationHtml,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Confirm & Pay`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        const order: OrderDto = {
          amount: Math.round(finalAmount),
          userId: booking.renterId,
          email: booking.renterEmail,
          phone: booking.renterPhoneNumber,
          bookingId: booking.id,
          itemName: booking.itemName,
          itemImage: booking.itemImage
        };
        this.paymentService.startPayment(order);
      }
    });
  }
}