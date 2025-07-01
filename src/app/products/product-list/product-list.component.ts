import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  @Input() limit?: number;

  products: Product[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const keyword = params['keyword'] || '';
      const location = params['location'] || '';
      this.fetchFilteredProducts(keyword, location);
    });
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

