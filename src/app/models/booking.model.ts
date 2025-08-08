export interface Booking {
  id: number;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  createdAt: string;

  // Item Details
  itemName: string;
  itemImage: string;

  // Owner Details
  ownerId: string;
  ownerName: string;
  ownerProfileImage: string;
  ownerEmail: string;
  ownerPhoneNumber: string;

  // Renter Details
  renterId: string;
  renterName: string;
  renterProfileImage: string;
  renterEmail: string;
  renterPhoneNumber: string;
}


