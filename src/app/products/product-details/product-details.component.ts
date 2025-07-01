import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  similarProducts: Product[] = [];
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    if (id) {
      this.fetchProduct(id);
      // Scroll to top when navigating
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}



  fetchProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.isLoading = false;

        // Fetch similar products (limit to 4 and exclude current product)
        if (res.categoryName) {
          this.productService.getFilteredProducts('', res.categoryName).subscribe({
            next: (similar) => {
              this.similarProducts = similar
                .filter(p => p.id !== res.id)
                .slice(0, 4); // ✅ Only 4 items
            }
          });
        }
      },
      error: () => {
        this.error = 'Error loading product';
        this.isLoading = false;
      }
    });
  }
}



