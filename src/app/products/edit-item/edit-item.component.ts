import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { CommonModule } from '@angular/common';
import { CategoryService } from 'src/app/categories/category.service';

@Component({
  selector: 'app-edit-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css']
})
export class EditItemComponent implements OnInit {
  productForm!: FormGroup;
  categories: any[] = [];
  itemId!: number;
  selectedImage!: File;
  imagePreview: string | ArrayBuffer | null = null;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private categoryservice:CategoryService
  ) {}

  ngOnInit(): void {
    this.itemId = +this.route.snapshot.params['id'];
    this.initForm();
    this.fetchCategories();
    this.loadItem();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      categoryId: ['', Validators.required],
      availability: [true]
    });
  }

 fetchCategories() {
    this.categoryservice.getAll().subscribe({
      next: (res:any) => this.categories = res,
      error: (err:any) => console.error('Failed to load categories', err)
    });
  }

  loadItem() {
    this.productService.getProductById(this.itemId.toString()).subscribe(item => {
      this.productForm.patchValue({
        name: item.name,
        description: item.description,
        price: item.displayPrice,
        location: item.location,
        categoryId: item.categoryName,
        availability: item.availability
      });
      this.imagePreview = item.image ? item.image : null;
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
    if (this.productForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value.toString());
    formData.append('location', this.productForm.get('location')?.value);
   formData.append('categoryId', this.productForm.get('categoryId')?.value.toString());
formData.append('availability', this.productForm.get('availability')?.value.toString());
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.isSubmitting = true;
    this.productService.updateItem(this.itemId, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/my-items']);
      },
      error: err => {
        console.error('Update error:', err);
        this.isSubmitting = false;
      }
    });
  }
}
