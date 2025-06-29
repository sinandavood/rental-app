import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';// <- import your AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe(
      (res: any) => {
        // Save token and role returned by your backend
        this.authService.saveUserData(res.token, res.role); 
        // Navigate based on role
        if (res.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-home']);
        }
      },
      (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        console.error('Error logging in:', error);
      }
    );
  }
}

