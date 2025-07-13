import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from 'src/app/categories/category.service';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  newCategory = { name: '', description: '', icon: '' };
  loading = false;
  page = 1;
  pageSize = 7;
  searchTerm = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.loading = false;
      }
    });
  }

  createCategory() {
    if (!this.newCategory.name.trim()) {
      alert("Name is required");
      return;
    }

    this.categoryService.create(this.newCategory).subscribe({
      next: (created) => {
        this.categories.unshift(created);
        this.applyFilters();
        this.newCategory = { name: '', description: '', icon: '' };
      },
      error: (err) => {
        console.error('Create failed:', err);
        alert('Category creation failed.');
      }
    });
  }

  deleteCategory(id: number) {
    const confirmed = confirm("Are you sure you want to delete this category?");
    if (!confirmed) return;

    this.categoryService.delete(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== id);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete category.');
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  nextPage() {
    if ((this.page * this.pageSize) < this.filteredCategories.length) this.page++;
  }
}
