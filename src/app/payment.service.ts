import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/env/environment-development';
import { OrderDto } from 'src/app/models/OrderDto';
import { AuthService } from './core/services/auth.service';
import { PaymentHistoryDto } from 'src/app/models/PaymentHistoryDTO';
import { Observable } from 'rxjs';
import { OrderResponseDto } from './models/OrderResponseDTO';
import { PaymentStatusResponse } from './models/paymentStatusResponse';
import { Router } from '@angular/router';

// Razorpay is loaded via a script tag in index.html.
// We declare it here so the TypeScript compiler doesn't complain.
declare var Razorpay: any;

// Define interfaces for strong typing

// ✅ NEW: Interface for the verification payload
export interface RazorpayVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiBaseUrl: string = `${environment.apiBaseUrl}/payment`;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Calls the backend to create a Razorpay order.
   */
  createRazorpayOrder(order: OrderDto): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(`${this.apiBaseUrl}/create-order`, order);
  }

  /**
   * Sends the payment success details to the backend for secure verification.
   */
  verifyPayment(payload: RazorpayVerificationPayload): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiBaseUrl}/verify`, payload);
  }

  /**
   * Launches the native Razorpay checkout UI.
   */
  launchRazorpayCheckout(options: {
    keyId: string;
    orderId: string;
    amount: number;
    userName: string;
    userEmail: string;
    userPhone: string;
  }): void {
      const razorpayOptions = {
          key: options.keyId,
          amount: options.amount * 100,
          name: 'MapleCot',
          order_id: options.orderId,
          description: 'Payment for your rental booking',
          prefill: {
              name: options.userName,
              email: options.userEmail,
              contact: options.userPhone,
              method:'upi',
          },
          
          
          theme: {
            color: '#3399cc'
          },
         handler: (response: any) => {
      // Navigate to the unified payment status page
      this.router.navigate(['/payment-tracker'], { queryParams: { order_id: options.orderId } });
    },
          modal: {
            ondismiss: () => {
              console.log('Payment checkout was closed by the user.');
            }
          }
      };
      
      const rzp = new Razorpay(razorpayOptions);
      rzp.open();
  }

  /**
   * ✅ RESTORED: Polls the backend for the final status of a payment.
   * Your backend will in turn check with Razorpay's servers.
   * @param orderId The Razorpay Order ID.
   * @returns An Observable with the payment status.
   */
 getPaymentStatus(orderId: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${this.apiBaseUrl}/${orderId}/status`);
  }

  /**
   * Fetches the user's payment history.
   */
  getPaymentHistory(): Observable<PaymentHistoryDto[]> {
    return this.http.get<PaymentHistoryDto[]>(`${this.apiBaseUrl}/history`);
  }
}
export { PaymentStatusResponse };

