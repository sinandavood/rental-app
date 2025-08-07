import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './env/environment-development';
import { OrderDto } from './models/OrderDto';
//@ts-ignore
import { load } from '@cashfreepayments/cashfree-js';
import { AuthService } from './core/services/auth.service';
import { PaymentHistoryDto } from './models/PaymentHistoryDTO';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiBaseUrl: string = `${environment.apiBaseUrl}/payment`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async startPayment(orderPartial: Partial<OrderDto>): Promise<void> {
    try {
      const user = this.authService.getCurrentUserData();
      if (!user) throw new Error('User not logged in');

      const order: OrderDto = {
        userId: user.nameid,
        email: user.email,
        phone: user.phoneNumber ?? '',
        amount: orderPartial.amount ?? 0,
        bookingId: orderPartial.bookingId ?? 0,
        itemName: orderPartial.itemName ?? '',
        itemImage: orderPartial.itemImage ?? ''
      };

      const response = await this.http.post<any>(`${this.apiBaseUrl}/create-order`, order).toPromise();
      const paymentSessionId = response.paymentSessionId ?? response.payment_session_id;
      const orderId = response.orderId ?? response.order_id;

      if (!paymentSessionId) {
        throw new Error('Payment session ID is missing');
      }

      const cashfree = await load({ mode: 'sandbox' });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
        returnUrl: `http://localhost:4200/payment-success?order_id=${orderId}`
      });

    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  }

  getPaymentStatus(orderId: string) {
    // Fixed: Match the backend controller route pattern
    return this.http.get<any>(`${this.apiBaseUrl}/${orderId}/status`);
  }

  getPaymentHistory(): Observable<PaymentHistoryDto[]> {
    return this.http.get<PaymentHistoryDto[]>(`${this.apiBaseUrl}/history`);
  }
}