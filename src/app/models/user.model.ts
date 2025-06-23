export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user'; // Example roles, adjust as needed
  token?: string; // Optional token for authentication
  createdAt?: Date; // Optional, for tracking user creation time
  // Add other user properties as needed
}
