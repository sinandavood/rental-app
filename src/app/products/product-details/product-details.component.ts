import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { BookingService } from 'src/app/core/services/booking.service';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Swal from  'sweetalert2';

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
  hasRequested = false;

  startDate: Date | null = null;
  endDate: Date | null = null;
  selectingStart = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private bookingService: BookingService,

  ) {}

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
            next: (data) => {
              this.profilepic = data.profileImage;
            },
            error: () => console.error('Failed to load owner profile image.')
          });
        }

        if (res.categoryId) {
          this.productService.getSimilarProducts(res.id).subscribe({
            next: (similar) => {
              this.similarProducts = similar.slice(0, 4);
            },
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
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.endDate = null;
      this.selectingStart = false;
    } else if (!this.endDate && date && date > this.startDate) {
      this.endDate = date;
      this.selectingStart = true;
    } else {
      // Invalid selection: reset
      this.startDate = date;
      this.endDate = null;
      this.selectingStart = false;
    }
  }

  isInRange(date: Date): boolean {
    if (this.startDate && this.endDate) {
      return date > this.startDate && date < this.endDate;
    }
    return false;
  }

  isSelected(date: Date): boolean {
    return !!(
      (this.startDate && date.toDateString() === this.startDate.toDateString()) ||
      (this.endDate && date.toDateString() === this.endDate.toDateString())
    );
  };
  dateClass = (date: Date): string => {
    if (this.isSelected(date)) return 'mat-calendar-body-selected';
    if (this.isInRange(date)) return 'range-date';
    return '';
  };

    requestBooking(): void {
    if (!this.product) return;

    const BookingData = {
      itemId: this.product.id,
      renterId: this.authService.getCurrentUserData()?.nameid,
      ownerId: this.product.ownerId,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      totalPrice: this.product.price * 2,
    };

    this.bookingService.createBooking(BookingData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Booking Requested!',
          text: 'Your booking request has been sent to the owner.',
          confirmButtonColor: '#3085d6',
        });
        this.hasRequested = true;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Booking request failed. Please try again.',
          confirmButtonColor: '#d33',
        });
      }
    });
  }
}
