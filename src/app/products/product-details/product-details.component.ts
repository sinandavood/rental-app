import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service'; // your existing service
import { Product } from 'src/app/models/product.model'; // optional interface

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product?: Product;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProduct(id);
    }
  }

  fetchProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error loading product';
        this.isLoading = false;
      }
    });
  }
}

