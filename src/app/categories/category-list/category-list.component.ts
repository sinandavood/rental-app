import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../category.service';
import { CommonModule } from '@angular/common';
import { ProductService } from 'src/app/products/product.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-category-list',
  standalone:true,
  templateUrl: './category-list.component.html',
  imports:[CommonModule],
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  products:Product[]=[];
  constructor(public categoryService: CategoryService,public productservice:ProductService) {}

  ngOnInit(): void {
    this.categoryService.refreshList();
  }
  onCategorySelect(categoryName: string) {
  // Call your product service to filter products
  this.productservice.getFilteredProducts('', categoryName).subscribe(res => {
    this.products = res;
  });
}
}
