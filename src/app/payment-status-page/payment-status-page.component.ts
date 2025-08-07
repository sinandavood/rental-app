import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from 'src/app/core/services/booking.service';
import { PaymentService } from '../payment.service';
import { Booking } from 'src/app/models/booking.model';

@Component({
  selector: 'app-payment-status-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-status-page.component.html',
  styleUrls: ['./payment-status-page.component.css']
})
export class PaymentStatusPageComponent implements OnInit {
  // allow undefined here so we can see if we ever actually set it
  status?: string | null;
  bookingId?: number | null;
  orderId?: string | null;

  booking?: Booking | null;
  paymentStatus?: string | null;
  paymentTime?: string | null;
  
  // Add debugging properties
  debugInfo: any = {};

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Debug: Log all query parameters
    const allParams = this.route.snapshot.queryParamMap;
    console.log('All query parameters:', allParams.keys.map(key => ({ [key]: allParams.get(key) })));
    
    // read queryParams _once_ - check for both possible parameter names
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') ?? 
                   this.route.snapshot.queryParamMap.get('order_id') ?? null;
    this.bookingId = this.route.snapshot.queryParamMap.get('bookingId')
                       ? +this.route.snapshot.queryParamMap.get('bookingId')!
                       : null;

    // Store debug info
    this.debugInfo = {
      orderId: this.orderId,
      bookingId: this.bookingId,
      allQueryParams: Object.fromEntries(allParams.keys.map(key => [key, allParams.get(key)]))
    };

    if (this.orderId) {
     
      this.fetchPaymentStatus(this.orderId);
    } else {
      // Set a fallback status to stop the loading
      this.status = 'failed';
    }
    // Remove the separate bookingId check - we'll get it from payment status response
  }

  fetchBookingDetails(id: number): void {
 
    this.bookingService.getBookingById(id).subscribe({
      next: (data) => {
        this.booking = data;
      },
      error: (err) => {
        console.error('Failed to fetch booking details', err);
      }
    });
  }
  fetchPaymentStatus(orderId: string): void {
  
    this.paymentService.getPaymentStatus(orderId).subscribe({
      next: (res) => {
       
        // map exactly the fields your backend returns:
        this.paymentStatus = res.status ?? null;
        this.paymentTime = res.paymentDate ?? null;
        
        // Get bookingId from the response if not already set
        if (res.bookingId && !this.bookingId) {
          this.bookingId = res.bookingId;
          this.fetchBookingDetails(res.bookingId);
        }
        
        // now derive the template-only field
        this.status = this.paymentStatus?.toLowerCase() ?? null;
       
      },
      error: (err) => {
        this.paymentStatus = null;
        this.status = 'failed';
      }
    });
  }
   retryPayment() {
    // Implement retry payment logic here
    console.log('Retrying payment...');
  }
}