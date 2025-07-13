export interface DashboardSummary {
  totalUsers: number;
  totalItems: number;
  totalCategories: number;
  totalRentals: number;
  totalWishlistItems: number;
  totalRevenue: number;
  lastUpdated: string;
  activeUsers: number;
  inactiveUsers: number;
  activeItems: number;
  inactiveItems: number;
  bookingsThisMonth: number;
  totalVerifiedUsers: number;
  pendingItems: number;
  complaints: { user: string; reason: string }[];
  recentActivities: { message: string; time: string }[];
}
