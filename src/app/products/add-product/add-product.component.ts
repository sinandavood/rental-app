import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { CategoryService } from '../../categories/category.service';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule]
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;
  categories: any[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  selectedImage!: File;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchCategories();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  fetchCategories() {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  submitForm() {
    if (this.productForm.invalid || !this.selectedImage) return;

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('location', this.productForm.get('location')?.value);
    formData.append('categoryId', this.productForm.get('categoryId')?.value);
    formData.append('availability', 'true');
    formData.append('image', this.selectedImage); // ✅ Image file

    this.isSubmitting = true;
    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error uploading product', err);
        this.isSubmitting = false;
      }
    });
  }
}
