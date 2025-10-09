import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { WishListService } from 'src/app/core/services/wishlist.service';
import { SearchService } from 'src/app/core/services/search.service';
import { environment } from 'src/app/env/environment-development';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  @Input() products: Product[] = [];

  isLoading = true;
  errorMessage = '';
  wishlist: Set<number> = new Set();
  imageurl = environment.imageurl;

  // Pagination
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private wishlistService: WishListService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchService.searchResults$.subscribe((data) => {
      this.products = data;
      this.isLoading = false;
      this.updatePagination();
    });

    this.searchService.loading$.subscribe((state) => {
      this.isLoading = state;
    });

    this.route.queryParams.subscribe((params) => {
      const keyword = params['q'] || '';
      const location = params['location'] || '';
      const categoryId = +params['categoryId'] || 0;
      this.fetchFilteredProducts(keyword, location, categoryId);
    });

    this.loadWishlist();
  }

  fetchFilteredProducts(keyword: string, location: string, categoryId: number) {
    this.isLoading = true;
    this.productService.getFilteredProducts(keyword, location, categoryId).subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error fetching products';
        this.isLoading = false;
      },
    });
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (data: any[]) => {
        const itemIds = data.map((item) => item.itemId);
        this.wishlist = new Set(itemIds);
      },
    });
  }

  toggleWishlist(productId: number, event: Event) {
    event.stopPropagation();
    if (this.wishlist.has(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe(() => {
        this.wishlist.delete(productId);
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe(() => {
        this.wishlist.add(productId);
      });
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.has(productId);
  }

  goToProduct(productId: number, event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/products', productId]);
  }

  // Pagination helpers
  updatePagination() {
    this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // smooth scroll back to top
    }
  }
}
