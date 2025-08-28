import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from 'src/app/categories/category.service';
import { Category } from 'src/app/models/category.model';
import { environment } from 'src/app/env/environment-development';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  public imageurl: string = environment.imageurl;

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  newCategory: Partial<Category> = {
    name: '',
    description: '',
  };
  loading = false;
  page = 1;
  pageSize = 50;
  searchTerm = '';

  subForm: {
  name: string;
  description: string;
  parentCategoryId: number | null; // Explicitly define the type here
} = {
  name: '',
  description: '',
  parentCategoryId: null
};
  
  private selectedFile: File | null = null;
  private selectedSubCategoryFile: File | null = null;

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

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.selectedFile = fileList[0];
    }
  }

  onSubCategoryFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.selectedSubCategoryFile = fileList[0];
    }
  }

  createCategory() {
    if (!this.newCategory.name?.trim()) {
      alert("Name is required");
      return;
    }
    if (!this.selectedFile) {
      alert("An icon image is required.");
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.newCategory.name);
    formData.append('Description', this.newCategory.description || '');
    formData.append('IconFile', this.selectedFile, this.selectedFile.name);

    this.categoryService.create(formData).subscribe({
      next: (created) => {
        this.categories.unshift(created);
        this.applyFilters();
        this.newCategory = { name: '', description: '' };
        this.selectedFile = null;
        // Consider resetting the file input element visually if needed
      },
      error: (err) => {
        console.error('Create failed:', err);
        alert('Category creation failed.');
      }
    });
  }
  
  createSubCategory() {
    if (!this.subForm.name?.trim() || !this.subForm.parentCategoryId) {
      alert("Name and a parent category are required.");
      return;
    }
     if (!this.selectedSubCategoryFile) {
      alert("An icon image is required for the subcategory.");
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.subForm.name);
    formData.append('Description', this.subForm.description ?? '');
    formData.append('ParentCategoryId', this.subForm.parentCategoryId?.toString() ?? '');
    formData.append('IconFile', this.selectedSubCategoryFile, this.selectedSubCategoryFile.name);

    this.categoryService.createSubCategory(formData).subscribe({
      next: () => {
        alert('Subcategory created!');
        this.fetchCategories(); // Refresh the list to see the new subcategory
        this.subForm = { name: '', description: '', parentCategoryId: null };
        this.selectedSubCategoryFile = null;
      },
      error: (err) => {
        console.error('Subcategory creation failed:', err);
        alert('Subcategory creation failed.');
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


}