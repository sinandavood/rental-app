export interface OrderResponseDto {
  razorpayKeyId: string;
  razorpayOrderId: string;
  baseAmount: number;
  platformFee: number;
  tds: number;
  totalAmount: number;
}