// src/app/admin/Admin_models/BookingResponseDTO.model.ts
export interface BookingsDTO {
  id: number;
  itemImage: string;
  itemName: string;
  isPaid: boolean;
  ownerId: string;
  renterId: string;
  ownerName: string;
  renterName: string;
  ownerPhoneNumber: string;
  renterPhoneNumber: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
