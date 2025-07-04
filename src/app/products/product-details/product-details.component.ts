import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/core/services/auth.service';

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
  profilepic = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchProduct(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  fetchProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.profilepic=res.ownerProfileImage;
        this.isLoading = false;

        // ✅ Fetch owner's profile image
        if (res.ownerId) {
          this.authService.getUserProfilePicById(res.ownerId).subscribe({
            next: (data) => {
              this.profilepic = data.profileImage;
            },
            error: () => {
              console.error('Failed to load owner profile image.');
            }
          });
        }

        // ✅ Fetch similar products
        if (res.categoryName) {
          this.productService.getFilteredProducts('', res.categoryName).subscribe({
            next: (similar) => {
              this.similarProducts = similar
                .filter(p => p.id !== res.id)
                .slice(0, 4);
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
