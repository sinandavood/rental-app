// src/app/admin/components/all-bookings/all-bookings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DashboardService } from '../services/admin-dashboard.service';
import { BookingsDTO } from '../Admin_models/BookingsDTO';

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.css']
})
export class AllBookingsComponent implements OnInit {
  // Data and State
  bookings: BookingsDTO[] = [];
  filteredBookings: BookingsDTO[] = [];
  loading = true;
  error: string | null = null;

  // Filtering, Sorting, and Pagination
  searchTerm = '';
  page = 1;
  pageSize = 10;
  sortColumn: keyof BookingsDTO | '' = 'createdAt'; // Default sort
  sortDirection: 'asc' | 'desc' = 'desc'; // Default direction

  // Expose Math for template usage
  Math = Math;

  // Column definitions for dynamic table headers
  columns: { key: keyof BookingsDTO; label: string }[] = [
    { key: 'id', label: 'Booking ID' },
    { key: 'itemName', label: 'Item' },
    { key: 'renterName', label: 'Renter' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'totalPrice', label: 'Price' },
    { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'createdAt', label: 'Created' },
    { key: 'isPaid', label: 'Paid Status' }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  private fetchBookings(): void {
    this.loading = true;
    this.dashboardService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data ?? [];
        this.applyFiltersAndSort(); // Apply initial filter and sort
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load bookings', err);
        this.error = 'Could not load bookings. Please try again later.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.page = 1; // Reset to the first page on a new search
    this.applyFiltersAndSort();
  }

  sortBy(column: keyof BookingsDTO): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // No need to reset page here, sorting should apply to the current view
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    const query = (this.searchTerm || '').trim().toLowerCase();

    // 1. Filter
    let filtered = this.bookings.filter(b =>
      query === '' ||
      Object.values(b).some(val =>
        val != null && String(val).toLowerCase().includes(query)
      )
    );

    // 2. Sort
    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;

      filtered.sort((a, b) => {
        const va = a[col] as any;
        const vb = b[col] as any;

        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
        }

        const da = this.tryParseDate(va);
        const db = this.tryParseDate(vb);
        if (da && db) {
          return (da.getTime() - db.getTime()) * dir;
        }

        const sa = va == null ? '' : String(va).toLowerCase();
        const sb = vb == null ? '' : String(vb).toLowerCase();
        return sa.localeCompare(sb) * dir;
      });
    }

    this.filteredBookings = filtered;
  }

  private tryParseDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const t = Date.parse(String(value));
    return isNaN(t) ? null : new Date(t);
  }

  // --- UI Helper and Performance Functions ---

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-300 text-white';
      case 'completed': return 'bg-green-100 text-white-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  trackByBookingId(index: number, item: BookingsDTO): number | string {
    // Assuming your BookingsDTO has an 'id' property. If not, use another unique key or index.
    return item?.id ?? index;
  }
}