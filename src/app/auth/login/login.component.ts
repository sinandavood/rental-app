import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { environment } from 'src/app/env/environment-development';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,

} from 'firebase/auth';
declare const google: any;

declare global {
  interface Window {
    onGoogleLibraryLoad: () => void;
  }
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isSubmitted = false;
  userInfo: User | null = null;
  isSubmitting: boolean = false;
  isGoogleLoading: boolean = false;
  profilePic: string | null = null;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private _ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      EmailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.checkCurrentUser();
    this.checkExistingAuth();

    window.onGoogleLibraryLoad = () => {
      google.accounts.id.initialize({
        client_id: environment.google.googlid,
        callback: this.handleCreditialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        { theme: "outline", size: "large", width: 350 }
      );
      google.accounts.id.prompt((notification: PromptMomentNotification) => { });

    }
  }

  handleCreditialResponse(response: CredentialResponse): void {
    this.isGoogleLoading = true;

    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (x: any) => {
        this.authService.saveUserData(x.token, x.role); // Includes profile pic now

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back!',
          timer: 1500,
          showConfirmButton: false
        });

        this._ngZone.run(() => {
          // ✅ Safe navigation and profilePic update inside Angular zone
          this.router.navigate(['/products']).then(() => {
            this.profilePic = this.authService.getUserProfilePic();
          });
        });
      },
      error: (error: any) => {
        console.error("Google login error:", error);

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Something went wrong with Google login.',
        });

        this.isGoogleLoading = false;
      }
    });
  }



  // ✅ Check if user is already authenticated with valid JWT
  checkExistingAuth(): void {
    if (this.authService.isAuthenticated() && this.authService.isTokenValid()) {
      const userRole = this.authService.getUserRole();
      this.redirectBasedOnRole(userRole);
    }
  }

  onLogin(): void {
    this.isSubmitted = true;
    if (this.loginForm.invalid) return;
    this.isSubmitting = true;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        // ✅ Save JWT token and user data
        this.authService.saveUserData(res.token, res.role);
        this.showAlert('Login successful!', 'success');
        this.redirectBasedOnRole(res.role);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showAlert(
          error?.error?.message || 'Login failed. Please try again.',
          'error'
        );
        console.error('Login error:', error);
      },
    });
  }

  // ✅ Role-based redirection
  redirectBasedOnRole(role: string | null): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'user':
        this.router.navigate(['/products']);
        break;
      default:
        this.router.navigate(['/products']);
    }
  }

  showAlert(message: string, icon: 'success' | 'error' | 'warning' | 'info') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  hasDisplayError(controlName: string): boolean {
    const control: AbstractControl | null = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty || this.isSubmitted);
  }

  checkCurrentUser() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userInfo = user;
      }
    });
  }

  // ✅ Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}