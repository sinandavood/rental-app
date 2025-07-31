import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../env/environment-development';
//@ts-ignore
import {load} from '@cashfreepayments/cashfree-js'


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  constructor(private http: HttpClient) {}

  apiBaseUrl:string=`${environment.apiBaseUrl}/payment`;

  ngOnInit(): void {
    // Optional: You can trigger createOrderAndLaunch() here if you want auto start
  }

  createOrderAndLaunch() {
    const payload = {
      amount: 100,                       // Set dynamically based on your app logic
      userId: '64efe610-6500-4323-bb18-1a780174974a',               // Replace with actual user ID
      email: 'user@example.com',        // Replace with logged-in user email
      phone: '9876543210',
      bookingId:21     // Replace with actual user phone
    };

    this.http.post<any>(`${this.apiBaseUrl}/create-order`, payload)
      .subscribe(res => {
        const sessionId = res.paymentSessionId;
        this.launchCashfree(sessionId);
      });
  }

async launchCashfree(sessionId: string) {
  const cashfree = await load({
    mode: 'sandbox' // use 'production' when going live
  });

  cashfree.checkout({
    paymentSessionId: sessionId,
    redirectTarget: '_self',
    returnUrl: 'http://localhost:4200/payment-success'
  });
}

  
}
