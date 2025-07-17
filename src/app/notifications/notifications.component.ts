import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/services/notification.service';
import { environment } from 'src/app/env/environment-development';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const userId = this.getUserIdFromToken();
    if (userId) {
      // 🟡 Load past notifications
      fetch(`${environment.apiBaseUrl}/notifications/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('RAW notification objects:', data);
          this.notificationService.addInitialNotifications(data);
        });

      // 🔁 Subscribe to live updates
      this.subscription.add(
        this.notificationService.notifications$.subscribe(notifs => {
          this.notifications = notifs;
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  markAsRead(notificationId: number) {
    fetch(`${environment.apiBaseUrl}/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(() => {
      // 🔄 Update notification service state instead of local state
      this.notificationService.markNotificationAsRead(notificationId);
    });
  }

  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['nameid']; // or 'sub' if your JWT uses that
  }
}