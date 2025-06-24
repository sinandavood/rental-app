
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone:true,
  templateUrl: './register.component.html',
  imports:[CommonModule,ReactiveFormsModule,RouterModule],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      emailOrPhone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      // POST to backend here
      console.log(this.registerForm.value);
      this.router.navigate(['/auth/login']); // navigate after success
    }
  }

  signupWithGoogle(): void {
    // Implement Google OAuth here
    console.log('Google signup clicked');
  }
}
