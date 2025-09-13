import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,  } from '@angular/router';
import { ProductService } from '../product.service';

import { Product } from '../../models/product.model'; // <- optional interface
import { WishListService } from 'src/app/core/services/wishlist.service';
import { SearchService } from 'src/app/core/services/search.service';
import { environment } from 'src/app/env/environment-development';
import { Router } from '@angular/router';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  @Input() limit?: number;

  @Input() products:any[]=[];

  isLoading = true;
  errorMessage = '';
  wishlist:Set<number>= new Set();
   public imageurl=environment.imageurl;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private wishlistservice:WishListService,
    private searchservice:SearchService,
    private router: Router
  ) {}

 ngOnInit(): void {
  // 🔄 React to live search/filter results from SearchBarComponent
  this.searchservice.searchResults$.subscribe(data => {
    this.products = data;
    this.isLoading=false;
  });

  // ⏳ Sync skeleton animation visibility
  this.searchservice.loading$.subscribe(state => {
    this.isLoading = state;
  });

  // 🌐 Initial load from query params (like /search?q=canon)
  this.route.queryParams.subscribe(params => {
    const keyword = params['q'] || '';
    const location = params['location'] || '';
    const categoryId = +params['categoryId'] || 0;

    this.fetchFilteredProducts(keyword, location, categoryId);
  });

  this.loadwishlist();
}



  loadwishlist()
  {
    this.wishlistservice.getWishlist().subscribe({
      next:(data:any[])=>{
        const itemIds=data.map(item=> item.itemId);
        this.wishlist=new Set(itemIds);
      }
    })
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

isInWishlist(productId: number): boolean {
  return this.wishlist.has(productId);
}

fetchFilteredProducts(keyword: string, location: string, categoryId: number) {
  this.isLoading = true;
  this.productService.getFilteredProducts(keyword, location, categoryId).subscribe({
    next: (data: Product[]) => {
      console.log('Fetched products:', data);
      this.products = data;
      this.isLoading = false;
    },
    error: (err) => {
      this.errorMessage = 'Error fetching products';
      console.error(err);
      this.isLoading = false;
    }
  });
}


  get visibleProducts(): Product[] {
    return this.limit ? this.products.slice(0, this.limit) : this.products;
  }

  goToProduct(productId: number) {
  this.router.navigate(['/products', productId]);
}
}

