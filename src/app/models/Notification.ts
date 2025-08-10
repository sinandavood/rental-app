export interface Notification {
  id: number;           // Recommended: A unique identifier for each notification.
  title: string;
  description: string;
  message: string;
  isRead: boolean;      // Recommended: Changed to boolean for type safety.
  createdAt: Date;      // Recommended: Changed to Date for easier manipulation.
  type: string;
  userId: string;
  link:string;
}