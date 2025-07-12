export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'User'; // Example roles, adjust as needed
  token?: string; // Optional token for authentication
 joinedAt: string;
 fullName:string;
 isKycVerified:boolean;
 phoneNumber:number;
 photoUrl:string;
 lockoutEnd: string | null;
  // Add other user properties as needed
}
