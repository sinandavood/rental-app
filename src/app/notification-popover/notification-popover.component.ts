import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Notification } from '../models/Notification';

@Component({
  selector: 'app-notification-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-popover.component.html',
  styleUrls: ['./notification-popover.component.css']
})
export class NotificationPopoverComponent implements OnInit, OnDestroy {
  @Output() closePopover = new EventEmitter<void>();
  
  notifications: Notification[] = [];
  isLoading = true;
  private subscription = new Subscription();

  constructor(
    public notificationService: NotificationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
        this.isLoading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async goToNotification(notification: Notification, event: MouseEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Clicked notification:', notification);
    console.log('Notification type:', notification.type);
    console.log('Notification link:', notification.link);
    
    // Close the popover first
    this.closePopover.emit();
    
    // Mark as read
    try {
      await this.notificationService.markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    
    // Navigate after a short delay
    setTimeout(() => {
      this.navigateToDestination(notification);
    }, 200);
  }

  private navigateToDestination(notification: Notification): void {
    console.log('Starting navigation for type:', notification.type);
    
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
          // Clean the link and ensure it starts with /
          let cleanLink = notification.link.trim();
          if (!cleanLink.startsWith('/')) {
            cleanLink = '/' + cleanLink;
          }
          targetRoute = [cleanLink];
        } else {
          targetRoute = ['/notifications'];
        }
        break;
    }
    
    console.log('Navigating to:', targetRoute);
    
    this.router.navigate(targetRoute).then(
      (success) => {
        console.log('Navigation result:', success);
        if (!success) {
          console.error('Navigation failed, falling back to notifications page');
          this.router.navigate(['/notifications']);
        }
      }
    ).catch(error => {
      console.error('Navigation error:', error);
      // Fallback to notifications page
      this.router.navigate(['/notifications']);
    });
  }

  trackById(index: number, item: Notification): number {
    return item.id;
  }
}