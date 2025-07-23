import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../env/environment';

import { CategoryListComponent } from '../categories/category-list/category-list.component';
import { ProductListComponent } from '../products/product-list/product-list.component';
import { SearchService } from '../core/services/search.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    CategoryListComponent,
    ProductListComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  recentlyAddedProducts: any[] = [];
  topRatedProducts: any[] = [];
  searchResults: any[] = [];

  isLoadingRecentlyAdded = true;
  isLoadingTopRated = true;

  wishlist: number[] = [];

  private apiBaseUrl = environment.apiBaseUrl + '/item';

  constructor(
    private http: HttpClient,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadRecentlyAdded();
    this.loadTopRated();

    this.searchService.searchResults$.subscribe(results => {
      this.searchResults = results;
    });

    this.loadWishlist(); // If you want wishlist
  }

  loadRecentlyAdded() {
    this.isLoadingRecentlyAdded = true;
    this.http.get<any[]>(`${this.apiBaseUrl}/recently-added`).subscribe({
      next: (data) => {
        this.recentlyAddedProducts = data;
        this.isLoadingRecentlyAdded = false;
      },
      error: () => {
        this.isLoadingRecentlyAdded = false;
      }
    });
  }

  loadTopRated() {
    this.isLoadingTopRated = true;
    this.http.get<any[]>(`${this.apiBaseUrl}/top-rated`).subscribe({
      next: (data) => {
        this.topRatedProducts = data;
        this.isLoadingTopRated = false;
      },
      error: () => {
        this.isLoadingTopRated = false;
      }
    });
  }

  // Optional: Wishlist features
  loadWishlist() {
    this.http.get<number[]>(`${environment.apiBaseUrl}/wishlist`).subscribe({
      next: (ids) => this.wishlist = ids,
      error: () => this.wishlist = []
    });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.includes(productId);
  }

  toggleWishlist(productId: number): void {
    if (this.isInWishlist(productId)) {
      this.http.delete(`${environment.apiBaseUrl}/wishlist/${productId}`).subscribe(() => {
        this.wishlist = this.wishlist.filter(id => id !== productId);
      });
    } else {
      this.http.post(`${environment.apiBaseUrl}/wishlist`, { productId }).subscribe(() => {
        this.wishlist.push(productId);
      });
    }
  }
}

