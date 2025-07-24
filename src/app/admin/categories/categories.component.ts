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
  newCategory: Partial<Category> = {
    name: '',
    description: '',
    icon: '',
    parentCategoryId: null
  };
  loading = false;
  page = 1;
  pageSize = 50;
  searchTerm = '';

  subForm = {
    name: '',
    description: '',
    icon: '',
    parentCategoryId: null
  };
  subcategories: any[] = [];

  constructor(private categoryService: CategoryService) { }

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
    if (!this.newCategory.name?.trim()) {
      alert("Name is required");
      return;
    }

    this.categoryService.create(this.newCategory).subscribe({
      next: (created) => {
        this.categories.unshift(created);
        this.applyFilters();
        // Fixed: Reset newCategory with all required properties
        this.newCategory = {
          name: '',
          description: '',
          icon: '',
          parentCategoryId: null
        };
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
      (c.description && c.description.toLowerCase().includes(term))
    );
  }

  // Fixed: Added proper pagination logic
  get paginatedCategories(): Category[] {
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCategories.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories.length / this.pageSize);
  }

  get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  get hasPrevPage(): boolean {
    return this.page > 1;
  }

  prevPage() {
    if (this.hasPrevPage) {
      this.page--;
    }
  }

  nextPage() {
    if (this.hasNextPage) {
      this.page++;
    }
  }

  // Method to handle search changes and reset pagination
  onSearchChange() {
    this.page = 1; // Reset to first page when searching
    this.applyFilters();
  }

  createSubCategory() {
    const payload = { ...this.subForm };
    this.categoryService.createSubCategory(payload).subscribe(() => {
      alert('Subcategory created!');
      this.subForm = { name: '', description: '', icon: '', parentCategoryId: null }; // Refresh category list if you display them
    });
  }

}