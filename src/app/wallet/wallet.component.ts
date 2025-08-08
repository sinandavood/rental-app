import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { WalletService, WalletView } from '../core/services/wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // Import for using reactive forms
  ],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  // Observable to hold the stream of wallet data from the API
  wallet$!: Observable<WalletView>;
  isLoading = true;
  
  // --- State for the Withdrawal Modal ---
  isModalOpen = false;
  withdrawalForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private walletService: WalletService,
    private fb: FormBuilder // Inject FormBuilder to create the form
  ) {
    // Initialize the withdrawal form with fields and validation rules
    this.withdrawalForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      withdrawalDetails: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadWalletData();
  }

  /**
   * Fetches wallet data from the service and handles the loading state.
   */
  loadWalletData(): void {
    this.isLoading = true;
    this.wallet$ = this.walletService.getWallet();
    
    // When the data arrives, turn off the main page loader.
    this.wallet$.subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false // Also stop loading on error
    });
  }

  /**
   * Opens the withdrawal modal and resets its state.
   */
  openWithdrawalModal(): void {
    this.isModalOpen = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.isSubmitting = false;
    this.withdrawalForm.reset();
  }

  /**
   * Closes the withdrawal modal.
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Handles the submission of the withdrawal form.
   */
  submitWithdrawal(): void {
    // Mark all fields as touched to show validation errors
    this.withdrawalForm.markAllAsTouched();
    if (this.withdrawalForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.walletService.requestWithdrawal(this.withdrawalForm.value).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.isSubmitting = false;
        
        // After a successful request, close the modal and refresh the wallet data after a short delay.
        setTimeout(() => {
          this.closeModal();
          this.loadWalletData();
        }, 2000);
      },
      error: (err) => {
        // Display the error message from the API response
        this.errorMessage = err.error?.message || 'An unknown error occurred. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
