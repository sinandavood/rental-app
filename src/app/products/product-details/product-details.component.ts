import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/core/services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BookingService } from 'src/app/core/services/booking.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  similarProducts: Product[] = [];
  isLoading = true;
  error = '';
  profilepic = '';

  startDate: Date | null = null;
  endDate: Date | null = null;
  
  minDate: Date;
  totalPrice: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProduct(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.productService.trackView(Number(id)).subscribe();
      }
    });
  }

  fetchProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.profilepic = res.ownerProfileImage;
        this.isLoading = false;

        if (res.ownerId) {
          this.authService.getUserProfilePicById(res.ownerId).subscribe({
            next: (data) => { this.profilepic = data.profileImage; },
            error: () => console.error('Failed to load owner profile image.')
          });
        }

        if (res.categoryId) {
          this.productService.getSimilarProducts(res.id).subscribe({
            next: (similar) => { this.similarProducts = similar.slice(0, 4); },
            error: () => console.error('Failed to load similar products')
          });
        }
      },
      error: () => {
        this.error = 'Error loading product';
        this.isLoading = false;
      }
    });
  }

  selectDate(date: Date | null): void {
    if (!date) return;

    if (!this.startDate || (this.startDate && this.endDate)) {
      this.clearDates();
      this.startDate = date;
    } else if (!this.endDate && date > this.startDate) {
      this.endDate = date;
      this.calculateTotalPrice();
    } else {
      this.clearDates();
      this.startDate = date;
    }
  }
  
  calculateTotalPrice(): void {
    if (this.startDate && this.endDate && this.product) {
      const oneDay = 24 * 60 * 60 * 1000;
      const durationDays = Math.round(Math.abs((this.endDate.getTime() - this.startDate.getTime()) / oneDay)) + 1;
      this.totalPrice = this.product.price * durationDays;
    }
  }

  // ✅ FIX: Updated dateClass function for more specific styling hooks
  dateClass = (d: Date): string => {
    if (this.startDate && d) {
      const date = d.getTime();
      const start = this.startDate.getTime();

      if (this.endDate) {
        const end = this.endDate.getTime();
        if (date === start && date === end) return 'range-start range-end';
        if (date === start) return 'range-start';
        if (date === end) return 'range-end';
        if (date > start && date < end) return 'in-range';
      } else if (date === start) {
        return 'range-start range-end'; // Style a single selected date
      }
    }
    return '';
  };

  requestBooking(): void {
    if (!this.product || !this.startDate || !this.endDate || !this.totalPrice) {
      Swal.fire('Incomplete Selection', 'Please select both a start and end date.', 'warning');
      return;
    }

    const bookingData = {
      itemId: this.product.id,
      startDate: this.startDate,
      endDate: this.endDate,
      totalPrice: this.totalPrice,
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Booking Requested!',
          text: 'Your request has been sent to the owner.',
          confirmButtonColor: '#3085d6',
        });
        this.router.navigate(['/my-bookings']);
      },
      error: (err) => {
        if (err.status === 409) {
          Swal.fire({ icon: 'warning', title: 'Already Booked', text: err.error });
        } else {
          Swal.fire({ icon: 'error', title: 'Oops...', text: 'Booking request failed. Please try again later.' });
        }
      }
    });
  }

  goToOwnerProducts(ownerId: string | undefined): void {
    if (ownerId) {
      this.router.navigate(['/owner', ownerId, 'products']);
    }
  }

  chatWithOwner(event: MouseEvent): void {
    event.stopPropagation();
    console.log("Chat initiated with owner");
  }
  
  clearDates(): void {
    this.startDate = null;
    this.endDate = null;
    this.totalPrice = null;
  }
}
