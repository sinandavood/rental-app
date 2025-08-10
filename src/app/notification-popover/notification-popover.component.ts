import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Subscription } from 'rxjs';
import { Notification } from '../models/Notification';

@Component({
  selector: 'app-notification-popover',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-popover.component.html',
  styleUrls: ['./notification-popover.component.css']
})
export class NotificationPopoverComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  isLoading = true;
  private subscription = new Subscription();

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to the shared list of notifications from the service
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
        this.isLoading = false; // Assume loading is done once we get an emission
      })
    );

    // Initial load is handled globally by the service, but you could trigger it here if needed
    // this.notificationService.loadInitialNotifications();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  markAsRead(notificationId: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent dropdown from closing
    this.notificationService.markNotificationAsRead(notificationId);
  }

  trackById(index: number, item: Notification): number {
    return item.id;
  }
}