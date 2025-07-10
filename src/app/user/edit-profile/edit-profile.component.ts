import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  removeExistingImage = false;
  profilePic: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[\+]?[0-9\s\-()]{10,15}$/)]],
      photoUrl: ['']
    });
    this.profilePic = this.authService.getUserProfilePic();

    const user = this.authService.getCurrentUserData();
    if (user) {
      this.profileForm.patchValue({
        fullName: user.unique_name ?? '',
        email: user.email ?? '',
        phoneNumber: user.phoneNumber ?? '',
        photoUrl: user.picture ?? ''
      });
      this.imagePreview = user.picture ?? null;
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    const controls = this.profileForm.controls;
    formData.append('fullName', controls['fullName'].value?.trim());
    formData.append('email', controls['email'].value?.trim());
    formData.append('phoneNumber', controls['phoneNumber'].value?.trim());

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    } else if (this.removeExistingImage) {
      formData.append('removePhoto', 'true');
    } else if (controls['photoUrl'].value) {
      formData.append('photoUrl', controls['photoUrl'].value);
    }

    this.userService.updateProfile(formData).subscribe({
      next: () => {
        this.authService.getUserFromBackend().subscribe({
          next: user => {
            this.authService.setUserFromBackend(user);
            this.successMessage = 'Profile updated!';
            this.finish();
          },
          error: () => {
            this.successMessage = 'Profile updated!';
            this.finish();
          }
        });
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = this.getErrorMessage(err.status);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Invalid image format.';
      return;
    }

    if (file.size > maxSize) {
      this.errorMessage = 'Image too large. Max 5MB.';
      return;
    }

    this.selectedFile = file;
    this.removeExistingImage = false;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.removeExistingImage = true;
    this.profileForm.patchValue({ photoUrl: '' });
  }

  isFieldInvalid(fieldName: string): boolean {
  const control = this.profileForm.get(fieldName);
  return !!(control && control.invalid && (control.dirty || control.touched));
}


  getError(field: string): string {
    const control = this.profileForm.get(field);
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Invalid email';
    if (control.errors['minlength']) return 'Too short';
    if (control.errors['pattern']) return 'Invalid phone number';
    return '';
  }

  getErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Invalid data.';
      case 401: return 'Session expired.';
      case 413: return 'File too large.';
      default: return 'Update failed.';
    }
  }

  private finish(): void {
    this.isSubmitting = false;
    setTimeout(() => this.router.navigate(['/profile']), 1500);
  }
}
