import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/app/env/environment-development';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection!: signalR.HubConnection;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  unreadCount$ = this.unreadCountSubject.asObservable();
  notifications$ = this.notificationsSubject.asObservable();

  startConnection(userId: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl.replace('/api', '')}/Hubs/Notification`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR Connected'))
      .catch(err => console.error('❌ SignalR error:', err));

    this.hubConnection.on('ReceiveNotification', (notification) => {
      console.log('📩 Live Notification received:', notification);
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);

      // Only increment unread count if the notification is unread
      if (!notification.isRead) {
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      }
    });
  }

  addInitialNotifications(notifs: any[]) {
    this.notificationsSubject.next([...notifs]);
    
    // Calculate unread count from the notifications
    const unreadCount = notifs.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // New method to handle marking notifications as read
  markNotificationAsRead(notificationId: number) {
    const current = this.notificationsSubject.value;
    const updatedNotifications = current.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    
    this.notificationsSubject.next(updatedNotifications);
    
    // Recalculate unread count
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  setUnreadCount(count: number) {
    this.unreadCountSubject.next(count);
  }

  resetUnreadCount() {
    this.unreadCountSubject.next(0);
  }

  stopConnection() {
    if (this.hubConnection) this.hubConnection.stop();
  }
}