import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { number } from 'echarts';

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
  ) { }

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
        this.profilepic = res.ownerProfileImage;
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
        }console.log('Product Response:', res); // Add this here
        console.log('Product Response:', res);
console.log('res.categoryId:', res.categoryId);



        // ✅ Fetch similar products
        if (res.categoryId) {
          const categoryId = Number(res.categoryId); // Optional cast
          this.productService.getSimilarProducts(res.id).subscribe({
            next: (similar) => {
              console.log('Similar Products:', similar);

              this.similarProducts = similar.slice(0, 4); // just to limit if needed
            },
            error: () => {
              console.error('Failed to load similar products');
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
