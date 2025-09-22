export interface PaymentStatusResponse {
  status: string;
  bookingId: number | null;
  paymentDate: string | null;
}