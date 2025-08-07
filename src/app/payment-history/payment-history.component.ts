import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../payment.service';
import { PaymentHistoryDto } from '../models/PaymentHistoryDTO';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-payment-history',
  standalone: true, // Use standalone component for modern Angular
  imports: [CommonModule], // Import CommonModule here for ngIf/ngFor
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  // Use the dollar sign ($) to indicate that this is an Observable
  public paymentHistory$!: Observable<PaymentHistoryDto[]>;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    // Call the service to get the data stream
    this.paymentHistory$ = this.paymentService.getPaymentHistory();
  }
}