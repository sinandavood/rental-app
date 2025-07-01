import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../category.service';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  imports: [CommonModule]
})
export class CategoryListComponent implements OnInit {
  constructor(public categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.refreshList();
  }
  
  onCategoryClick(category: Category): void {
    console.log('Clicked category:', category.name);
    // You can navigate or filter products here
  }
}



