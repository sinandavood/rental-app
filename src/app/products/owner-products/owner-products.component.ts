import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from 'src/app/models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-owner-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owner-products.component.html',
  styleUrls: ['./owner-products.component.css']
})
export class OwnerProductsComponent implements OnInit {
  ownerId!: string;
  products: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.ownerId = this.route.snapshot.paramMap.get('id')!;
    this.fetchOwnerProducts(this.ownerId);
  }

  fetchOwnerProducts(ownerId: string): void {
    this.loading = true;
    this.productService.getProductsByOwner(ownerId).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load owner products';
        this.loading = false;
      }
    });
  }
}
