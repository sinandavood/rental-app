import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { Booking } from '../models/booking.model';
import { BookingService } from '../core/services/booking.service';
import { AuthService } from '../core/services/auth.service';
import { PaymentService } from '../payment.service';
import { OrderDto } from '../models/OrderDto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  // Make sure RouterModule is imported if you use routerLink in the template
  imports: [CommonModule, RouterModule], 
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
    this.isLoadingBookings = true;
    this.bookingService.getPendingBookingsByOwner(this.ownerId).subscribe({
      next: (data) => {
        this.bookings = data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Failed to load bookings for owner:', err);
        this.isLoadingBookings = false;
      }
    });
  }

  loadMyRequests(): void {
    this.isLoadingMyRequests = true;
    this.bookingService.getMyRequests().subscribe({
      next: (res) => {
        this.myRequests = res.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoadingMyRequests = false;
      },
      error: (err) => {
        console.error('Error loading my booking requests', err);
        this.isLoadingMyRequests = false;
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
            this.loadMyRequests(); // Also refresh my requests in case status changes are shown there
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

  // --- MODIFIED METHOD ---
  payNow(booking: Booking): void {
    if (!booking.renterId || !booking.renterEmail) {
      console.error('CRITICAL: Missing renter ID or Email. Cannot proceed with payment.');
      Swal.fire('Error', 'Could not initiate payment due to missing user details.', 'error');
      return;
    }

    // 1. Define rates and calculate costs
    const basePrice = booking.totalPrice;
    const platformFeeRate = 0.05; // 5%
    const taxRate = 0.10;         // 18% GST (as a standard example for India)

    const platformFee = basePrice * platformFeeRate;
    const taxableAmount = basePrice + platformFee;
    const taxes = taxableAmount * taxRate;
    const finalAmount = basePrice + platformFee + taxes;

    // Helper to format currency for display
    const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(value);

    // 2. Create the HTML content for the modal
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

    // 3. Show the SweetAlert2 confirmation modal
    Swal.fire({
      title: 'Payment Summary',
      html: confirmationHtml,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: `Confirm & Pay`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a', // A nice green color
      cancelButtonColor: '#d33'
    }).then((result) => {
      // 4. If confirmed, proceed to payment
      if (result.isConfirmed) {
        const order: OrderDto = {
          // IMPORTANT: Use the final calculated amount for the payment
          amount: Math.round(finalAmount), // Send a rounded integer amount to payment gateway
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