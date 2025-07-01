import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    RouterLink,
  ],
})
export class RegisterComponent {
  form: FormGroup;
  isSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // ✅ Validator: Password must match
  passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  // ✅ Check if confirm password mismatch
  hasPasswordMismatch(): boolean {
    return (
      this.form.hasError('passwordMismatch') &&
      (this.form.get('confirmPassword')?.touched ||
        this.form.get('confirmPassword')?.dirty ||
        this.isSubmitted)
    );
  }

  // ✅ Show toast
  showAlert(
    message: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) {
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

  // ✅ Submit
  onSubmit(): void {
    this.isSubmitted = true;

    if (this.form.valid) {
      const { fullName, email, phone, password, confirmPassword } =
        this.form.value;

      const payload = {
        FullName: fullName,
        EmailAddress: email,
        PhoneNumber: phone,
        Password: password,
        PasswordConfirmation: confirmPassword,
      };

      this.service.register(payload).subscribe({
        next: () => {
          this.showAlert('Successfully registered', 'success');
          this.form.reset();
          this.isSubmitted = false;
          this.router.navigate(['/auth/login']);
        },
        error: (err: any) => {
          const errorObj = err?.error?.errors;
          if (errorObj) {
            for (const key in errorObj) {
              if (errorObj.hasOwnProperty(key)) {
                const messages: string[] = errorObj[key];
                messages.forEach((msg) => this.showAlert(msg, 'error'));
              }
            }
          } else {
            this.showAlert('Something went wrong. Try again.', 'error');
          }
        },
      });
    } else {
      this.showAlert('Please fix the errors in the form', 'warning');
    }
  }

  // ✅ Show error UI
  hasDisplayError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return (
      Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
    );
  }

  // ✅ Google Signup Placeholder
  signupWithGoogle(): void {
    this.showAlert('Google signup not yet implemented.', 'info');
  }
}
