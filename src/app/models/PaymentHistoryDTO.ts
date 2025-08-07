export interface PaymentHistoryDto {
  orderId: string;
  bookingId: number | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string; // Keep as string for simplicity, can be converted to Date
  itemName: string;
  ownerName: string;
}