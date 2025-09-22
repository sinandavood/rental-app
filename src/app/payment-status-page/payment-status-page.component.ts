import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService, PaymentStatusResponse } from '../payment.service';
import { Subscription, timer } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';
import { BookingService } from 'src/app/core/services/booking.service';
import { Booking } from 'src/app/models/booking.model';
import * as confetti from 'canvas-confetti';

@Component({
  selector: 'app-payment-status-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-status-page.component.html',
  styleUrls: ['./payment-status-page.component.css']
})
export class PaymentStatusPageComponent implements OnInit, OnDestroy {
  status: 'verifying' | 'success' | 'failed' = 'verifying';
  orderId: string | null = null;
  errorMessage: string | null = null;
  private pollingSubscription?: Subscription;

  booking: Booking | null = null;
  paymentTime: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('order_id');

    if (this.orderId) {
      this.startPolling(this.orderId);
    } else {
      this.status = 'failed';
      this.errorMessage = 'Order ID not found in the URL.';
    }
  }

  startPolling(orderId: string): void {
    this.pollingSubscription = timer(0, 3000)
      .pipe(
        switchMap(() => this.paymentService.getPaymentStatus(orderId)),
        tap((response: PaymentStatusResponse) => this.handlePaymentStatus(response)),
        takeWhile(response => response.status?.toLowerCase() === 'pending', true)
      )
      .subscribe({
        error: err => {
          console.error('Error while polling for payment status:', err);
          this.status = 'failed';
          this.errorMessage = 'Could not verify payment. Please check your bookings for the final status.';
        }
      });
  }

  private handlePaymentStatus(response: PaymentStatusResponse): void {
    const backendStatus = response.status?.toLowerCase();
    
    if (backendStatus === 'success') {
      this.status = 'success';
      this.launchConfetti();
      if (response.bookingId) this.fetchBookingDetails(response.bookingId);
      this.paymentTime = response.paymentDate;
    } else if (backendStatus === 'failed' || backendStatus === 'usercancelled') {
      this.status = 'failed';
      this.errorMessage = 'Payment failed or was cancelled.';
    }
    // Pending or unknown statuses keep status as 'verifying'
  }

  fetchBookingDetails(bookingId: number): void {
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (data) => this.booking = data,
      error: (err) => console.error('Failed to fetch booking details:', err)
    });
  }

  retryPayment(): void {
    this.router.navigate(['/my-bookings']);
  }

  launchConfetti(): void {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (canvas) {
      const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
      myConfetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
    }
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}
