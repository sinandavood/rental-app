import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/env/environment-development';

// Define interfaces for strong typing to ensure your data is consistent
export interface WalletView {
  withdrawableBalance: number;
  pendingBalance: number;
  recentTransactions: WalletTransaction[];
}

export interface WalletTransaction {
  amount: number;
  type: string;
  timestamp: string;
  relatedBookingId: number | null;
}

export interface WithdrawalRequest {
  amount: number;
  withdrawalDetails: string; // e.g., Bank Account, UPI ID
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  // Sets the base URL from your environment file (e.g., 'https://p2prental.runasp.net/api/wallet')
  private readonly apiUrl = `${environment.apiBaseUrl}/wallet`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches the user's complete wallet view.
   * This calls the GET /api/wallet endpoint.
   * @returns An Observable containing the user's balances and recent transactions.
   */
  getWallet(): Observable<WalletView> {
    return this.http.get<WalletView>(this.apiUrl);
  }

  /**
   * Submits a withdrawal request to the backend.
   * This calls the POST /api/wallet/withdraw endpoint.
   * @param request The withdrawal details (amount and bank/UPI info).
   * @returns An Observable with a success message from the server.
   */
  requestWithdrawal(request: WithdrawalRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/withdraw`, request);
  }
}