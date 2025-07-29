export interface Booking
{
  id: number;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  renterId: string;
  ownerId: string;
  itemName: string;
  itemImage: string;
  renterName: string;
  ownerName: string;
  isPaid: boolean;
  renterProfileImage: string;
  ownerProfileImage: string;
}


