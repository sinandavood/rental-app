import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { AdminNotificationService } from '../services/admin-notification.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

@Component({
  selector: 'app-broadcast',
  templateUrl: 'broadcast-message.component.html',
  standalone: true,
  styleUrls:['./broadcast-message.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class BroadcastComponent {
  form = this.fb.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    description: ['',Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private notificationService: AdminNotificationService
  ) {}

  submit() {
    if (this.form.invalid) return;

    const formData = {
      title: this.form.value.title ?? '',
      message: this.form.value.message ?? '',
      description: this.form.value.description ?? '',
    };

    this.notificationService.broadcastPromotional(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent',
          text: 'Promotional notification was successfully sent!',
          timer: 2000,
          showConfirmButton: false,
        });
        this.form.reset();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Something went wrong while sending the message.',
        });
      },
    });
  }
}
