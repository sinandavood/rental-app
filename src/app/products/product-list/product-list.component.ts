// src/app/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../../models/product.model'; // <- optional interface

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {

  products: Product[] = [
    
  ];  // <- empty list initially
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
    this.productService.getFilteredProducts(keyword, location).subscribe(
      (data: Product[]) => {
        this.products = data;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching products';
        this.isLoading = false;
        console.error(error);
      }
    );
  }
}
