import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';

import { Product } from '../../models/product.model'; // <- optional interface
import { WishListService } from 'src/app/core/services/wishlist.service';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  @Input() limit?: number;

  @Input() products:any[]=[];

  isLoading = true;
  errorMessage = '';
  wishlist:Set<number>= new Set();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private wishlistservice:WishListService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'] || '';
      const location = params['location'] || '';
      this.fetchFilteredProducts(keyword, location);
      this.loadwishlist();
    });
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

  fetchFilteredProducts(keyword: string, location: string) {
    this.isLoading = true;
    this.productService.getFilteredProducts(keyword, location).subscribe({
      next: (data: Product[]) => {
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
}

