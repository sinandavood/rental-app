import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-list',
  standalone:true,
  templateUrl: './category-list.component.html',
  imports: [CommonModule],
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent {
   categories = [
    { name: 'Electronics', image: 'assets/images/books.jpg' },
    { name: 'Furniture', image: 'assets/images/books.jpg' },
    { name: 'Books', image: 'assets/images/books.jpg' },
    { name: 'Furniture', image: 'assets/images/books.jpg' },
    { name: 'Books', image: 'assets/images/books.jpg' },
    { name: 'Sports', image: 'assets/images/books.jpg' }
  ];

  constructor(private router: Router) {}

  goToCategory(name: string) {
    // navigate to product list with this category as a query parameter
    this.router.navigate(['/products'], { queryParams: { category: name } });
  }

}
