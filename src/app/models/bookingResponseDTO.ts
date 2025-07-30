export interface BookingResponseDTO {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  renterId: string;
  ownerId: string;
  itemName: string;
  itemImage: string;
  ownerName: string;
  renterName: string;
  isPaid: boolean;
  
}
