import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
} from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isSubmitted = false;
  userInfo: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      EmailAddress: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  isSubmitting: boolean = false;


  ngOnInit(): void {
    this.checkCurrentUser();
  }

  // ✅ Login handler
  onLogin(): void {
    this.isSubmitted = true;
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        this.authService.saveUserData(res.token, res.role);
        this.showAlert('Login successful!', 'success');
        this.router.navigate(
          res.role === 'admin' ? ['/admin-dashboard'] : ['/products']
        );
      },
      error: (error) => {
        this.showAlert(
          error?.error?.message || 'Login failed. Please try again.',
          'error'
        );
        console.error('Login error:', error);
      },
    });
  }

  // ✅ Google login (Web only)
  async loginWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      this.userInfo = user;
      localStorage.setItem('user', JSON.stringify(user));
      this.showAlert(`Welcome, ${user.displayName}`, 'success');
      this.router.navigate(['/user-home']);
    } catch (error: any) {
      this.showAlert('Google login failed', 'error');
      console.error('Google login error:', error?.message || error);
    }
  }

  // ✅ Toast alert
  showAlert(message: string, icon: 'success' | 'error' | 'warning' | 'info') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  // ✅ Validation error display helper
  hasDisplayError(controlName: string): boolean {
    const control: AbstractControl | null = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty || this.isSubmitted);
  }

  // ✅ Check for already logged-in Google user
  checkCurrentUser() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userInfo = user;
      }
    });
  }
}
