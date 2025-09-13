// src/app/products/make-offer/make-offer.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../product.service';
import Swal from 'sweetalert2';

interface OfferDialogData {
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-make-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-offer.component.html',
  styleUrls: ['./make-offer.component.css']
})
export class MakeOfferComponent {
  offerPrice!: number;

  constructor(
    private productService: ProductService,
    public dialogRef: MatDialogRef<MakeOfferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OfferDialogData
  ) {}

  submitOffer() {
    if (!this.offerPrice || this.offerPrice <= 0) {
      Swal.fire('Invalid Price', 'Please enter a valid amount', 'warning');
      return;
    }

    this.productService.makeOffer(this.data.productId, this.offerPrice).subscribe({
      next: () => {
        Swal.fire('Offer Submitted', 'Your offer has been sent to the owner!', 'success');
        this.dialogRef.close(true);
      },
      error: () => {
        Swal.fire('Error', 'Something went wrong while submitting your offer.', 'error');
      }
    });
  }
}
