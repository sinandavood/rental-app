export interface Notification {
  id: number;
  title: string;
  description: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type: 'ITEM_LISTING' | 'BOOKING' | 'PAYMENT_HISTORY' | 'GENERIC'; 
  userId: string;
  link?: string; // still optional fallback
}
