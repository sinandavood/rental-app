import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WishListService } from 'src/app/core/services/wishlist.service';
import Swal from 'sweetalert2';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-my-wishlist',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './mywishlist-list.component.html',
  styleUrls: ['./mywishlist-list.component.css']
})
export class MyWishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  isLoading = false;
 
  private wishlistservice = inject(WishListService);

  constructor() {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistservice.getWishlist().subscribe({
      next: (res: any) => {
        this.wishlistItems = res;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading wishlist:', err);
        this.isLoading = false;
      }
    });
  }

  removeFromWishlist(itemId: number): void {
    Swal.fire({
      title: 'Remove item?',
      text: 'Do you want to remove this item from your wishlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.wishlistservice.removeFromWishlist(itemId).subscribe({
          next: () => {
            this.wishlistItems = this.wishlistItems.filter(item => item.itemId !== itemId);
            Swal.fire('Removed!', 'Item has been removed from wishlist.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Could not remove item. Try again later.', 'error');
          }
        });
      }
    });
  }
}
