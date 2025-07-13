// src/app/models/user.model.ts
export interface User_admin {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  isKycVerified: boolean;
  joinedAt: string;
  isBlocked: boolean;
}
