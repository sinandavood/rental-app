import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../env/environment';

import { CategoryListComponent } from '../categories/category-list/category-list.component';
import { ProductListComponent } from '../products/product-list/product-list.component';
import { SearchService } from '../core/services/search.service';
import { WishListService } from '../core/services/wishlist.service';

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
  wishlist:Set<number>= new Set();


  private apiBaseUrl = environment.apiBaseUrl + '/item';


  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private wishlistservice:WishListService
  ) {}

  ngOnInit(): void {
    this.loadRecentlyAdded();
    this.loadTopRated();

    this.searchService.searchResults$.subscribe(results => {
      this.searchResults = results;
    });

    this.loadwishlist(); // If you want wishlist
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

  loadwishlist()
  {
    this.wishlistservice.getWishlist().subscribe({
      next:(data:any[])=>{
        const itemIds=data.map(item=> item.itemId);
        this.wishlist=new Set(itemIds);
      }
    })
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.has(productId);
  }

  toggleWishlist(productId: number) {
  if (this.wishlist.has(productId)) {
    this.wishlistservice.removeFromWishlist(productId).subscribe(() => {
      this.wishlist.delete(productId);
    });
  } else {
    this.wishlistservice.addToWishlist(productId).subscribe(() => {
      this.wishlist.add(productId);
    });
  }
}
}

