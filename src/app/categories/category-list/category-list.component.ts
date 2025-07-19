import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../category.service';
import { Category } from 'src/app/models/category.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: true,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  imports: [CommonModule]
})
export class CategoryListComponent implements OnInit {
  categories$!: Observable<Category[]>;

  constructor(public categoryService: CategoryService, private router: Router) {}

  ngOnInit(): void {
    this.categories$ = this.categoryService.getAll();
  }

  onCategoryClick(category: Category) {
  this.router.navigate(['/category', category.id]);
}

}
