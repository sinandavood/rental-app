import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/app/env/environment-development';
import { Notification } from 'src/app/models/Notification';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private hubConnection?: signalR.HubConnection;
  private isLoading = false;

  // State management using BehaviorSubject for real-time updates
  private readonly _notifications = new BehaviorSubject<Notification[]>([]);
  private readonly _unreadCount = new BehaviorSubject<number>(0);

  // Public observables that components can subscribe to
  public readonly notifications$: Observable<Notification[]> = this._notifications.asObservable();
  public readonly unreadCount$: Observable<number> = this._unreadCount.asObservable();

  constructor(private authService: AuthService) {
    // Listen for user login/logout to manage the connection
    this.authService.user$.subscribe(user => {
      if (user && user.nameid) {
        this.startConnection(user.nameid);
        this.loadInitialNotifications(user.nameid);
      } else {
        this.stopConnection();
        this._notifications.next([]);
        this._unreadCount.next(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }

  /**
   * Starts the SignalR hub connection.
   * @param userId The ID of the currently logged-in user.
   */
  private startConnection(userId: string): void {
    if (this.hubConnection) {
      return; // Connection already active
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl.replace('/api', '')}/Hubs/Notification`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR Connected'))
      .catch(err => console.error('❌ SignalR connection error:', err));

    // Listen for real-time notifications from the server
    this.hubConnection.on('ReceiveNotification', (rawNotification: any) => {
      console.log('📩 Live Notification received:', rawNotification);
      this.addRealtimeNotification(rawNotification);
    });
  }

  /**
   * Stops the SignalR hub connection.
   */
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('🔌 SignalR Disconnected'));
      this.hubConnection = undefined;
    }
  }

  /**
   * Fetches all notifications for the current user from the API.
   * @param userId The ID of the user whose notifications to load.
   */
  public loadInitialNotifications(userId: string): void {
    if (this.isLoading) return;
    this.isLoading = true;

    fetch(`${environment.apiBaseUrl}/notifications/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then((data: any[]) => {
      const mappedNotifications = data.map(this.mapToNotification).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      this._notifications.next(mappedNotifications);
      this.updateUnreadCount();
    })
    .catch(err => console.error('Failed to load initial notifications:', err))
    .finally(() => this.isLoading = false);
  }

  /**
   * Marks a single notification as read.
   * @param notificationId The ID of the notification to mark as read.
   */
  public markNotificationAsRead(notificationId: number): void {
    // Optimistically update the UI first for a better user experience
    const currentNotifications = this._notifications.getValue();
    const updatedNotifications = currentNotifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
    );
    this._notifications.next(updatedNotifications);
    this.updateUnreadCount();

    // Then, send the request to the server
    fetch(`${environment.apiBaseUrl}/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).catch(err => {
      console.error("Failed to mark notification as read on server:", err);
      // Optional: Revert the UI change if the API call fails
      this._notifications.next(currentNotifications);
      this.updateUnreadCount();
    });
  }
  
  /**
   * Marks all unread notifications as read.
   */
  public markAllAsRead(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    fetch(`${environment.apiBaseUrl}/notifications/user/${userId}/mark-all-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (res.ok) {
        const updatedNotifications = this._notifications.getValue().map(n => ({ ...n, isRead: true }));
        this._notifications.next(updatedNotifications);
        this.updateUnreadCount();
      }
    }).catch(err => console.error("Failed to mark all as read", err));
  }

  /**
   * Adds a new notification received in real-time (e.g., from SignalR).
   * @param rawNotification The raw notification object from the server.
   */
  private addRealtimeNotification(rawNotification: any): void {
    const newNotification = this.mapToNotification(rawNotification);
    const currentNotifications = this._notifications.getValue();
    this._notifications.next([newNotification, ...currentNotifications]);
    this.updateUnreadCount();
  }

  /**
   * Recalculates the number of unread notifications and updates the unreadCount observable.
   */
  private updateUnreadCount(): void {
    const count = this._notifications.getValue().filter(n => !n.isRead).length;
    this._unreadCount.next(count);
  }

  /**
   * Maps a raw data object from the API to the structured Notification model.
   * @param data The raw object.
   * @returns A strongly-typed Notification object.
   */
  private mapToNotification(data: any): Notification {
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      description: data.description,
      isRead: !!data.isRead, // Ensures it's a boolean
      createdAt: new Date(data.createdAt), // Convert string to Date object
      type: data.type,
      userId: data.userId,
      link: data.link
    };
  }
}