import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Notification } from '../models/Notification';
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

  constructor(
    private notificationService: NotificationService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.getUserIdFromToken();
    if (userId) {
      this.loadNotifications(userId);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadNotifications(userId: string): void {
    fetch(`${environment.apiBaseUrl}/notifications/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      })
      .then(data => {
        console.log('Loaded notifications:', data);
        this.notificationService.loadInitialNotifications(data);
      })
      .catch(err => console.error('Error loading notifications:', err));

    // Subscribe to live updates
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
        console.log('Updated notifications:', this.notifications);
      })
    );
  }

  async markAsRead(notificationId: number, event?: MouseEvent): Promise<void> {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    try {
      const response = await fetch(`${environment.apiBaseUrl}/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        this.notificationService.markNotificationAsRead(notificationId);
        console.log('Marked notification as read:', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['nameid'] || payload['sub'];
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  async goToNotification(notification: Notification, event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Notification clicked:', notification);
    
    // Mark as read if not already
    if (!notification.isRead) {
      await this.markAsRead(notification.id);
    }
    
    // Navigate
    this.navigateToDestination(notification);
  }

  private navigateToDestination(notification: Notification): void {
    console.log('Navigating for notification:', notification);
    console.log('Type:', notification.type, 'Link:', notification.link);
    
    let targetRoute: string[] = [];
    
    switch (notification.type?.toUpperCase()) {
      case 'ITEM_LISTING':
      case 'ITEM':
        targetRoute = ['/my-items'];
        break;
        
      case 'BOOKING':
      case 'BOOKINGS':
        targetRoute = ['/my-bookings'];
        break;
        
      case 'PAYMENT_HISTORY':
      case 'PAYMENT':
        targetRoute = ['/payment-history'];
        break;
        
      default:
        if (notification.link) {
          let cleanLink = notification.link.trim();
          if (!cleanLink.startsWith('/')) {
            cleanLink = '/' + cleanLink;
          }
          targetRoute = [cleanLink];
        } else {
          // Stay on current page if no specific route
          return;
        }
        break;
    }
    
    console.log('Navigating to route:', targetRoute);
    
    this.router.navigate(targetRoute).then(
      (success) => {
        console.log('Navigation successful:', success);
        if (!success) {
          console.error('Navigation failed for route:', targetRoute);
        }
      }
    ).catch(error => {
      console.error('Navigation error:', error);
    });
  }
}
