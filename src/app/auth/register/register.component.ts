import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service'; // <-- make sure to adjust the path!

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      emailOrPhone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    this.errorMessage = '';
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.authService.register(this.registerForm.value).subscribe(
        (response) => {
          console.log('Registration successful:', response);
          this.isSubmitting = false;
          // Navigate to login after success
          this.router.navigate(['/auth/login']);
        },
        (error) => {
          this.isSubmitting = false;
          this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
          console.error('Error during registration:', error);
        }
      );
    }
  }

  signupWithGoogle(): void {
    // Implement your Google OAuth flow here
    console.log('Google signup clicked');
    // e.g. this.authService.signInWithGoogle() or navigate to a Google OAuth page
  }
}
