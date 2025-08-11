import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // <-- Make sure to install: npm i ngx-pagination
import { DashboardService } from '../services/admin-dashboard.service';
import { PaymentsDTO } from '../Admin_models/PaymentsDTO';

@Component({
  selector: 'app-all-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,        // <-- Required for ngModel
    NgxPaginationModule, // <-- Required for pagination
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './all-payments.component.html',
  styleUrls: ['./all-payments.component.css'] // <-- For custom pagination styles
})
export class AllPaymentsComponent implements OnInit {
  // --- Data and State ---
  allPayments: PaymentsDTO[] = [];
  filteredPayments: PaymentsDTO[] = [];
  loading = true;
  error: string | null = null;

  // --- Filtering, Sorting, and Pagination ---
  searchTerm = '';
  page = 1;
  pageSize = 10;
  sortColumn: keyof PaymentsDTO | '' = 'createdAt'; // Default sort
  sortDirection: 'asc' | 'desc' = 'desc'; // Default direction

  // Expose Math for template usage (e.g., for pagination summary)
  Math = Math;

  // Column definitions for dynamic table headers
  columns: { key: keyof PaymentsDTO; label: string }[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'itemName', label: 'Item' },
    { key: 'renterName', label: 'Renter' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'createdAt', label: 'Created' }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchPayments();
  }

  private fetchPayments(): void {
    this.loading = true;
    this.dashboardService.getAllPayments().subscribe({
      next: (data) => {
        this.allPayments = data ?? [];
        this.applyFiltersAndSort(); // Apply initial filter and sort
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load payments', err);
        this.error = 'Could not load payments. Please try again later.';
        this.loading = false;
      }
    });
  }

  // --- Event Handlers ---

  onSearchChange(): void {
    this.page = 1; // Reset to the first page on a new search
    this.applyFiltersAndSort();
  }

  sortBy(column: keyof PaymentsDTO): void {
    if (this.sortColumn === column) {
      // Toggle direction if the same column is clicked
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Otherwise, set new column and default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  // --- Core Logic ---

  applyFiltersAndSort(): void {
    const query = (this.searchTerm || '').trim().toLowerCase();

    // 1. Filter
    let filtered = this.allPayments.filter(p =>
      query === '' ||
      Object.values(p).some(val =>
        val != null && String(val).toLowerCase().includes(query)
      )
    );

    // 2. Sort
    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;

      filtered.sort((a, b) => {
        const valA = a[col] as any;
        const valB = b[col] as any;

        // Handle different data types for robust sorting
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }

        const dateA = this.tryParseDate(valA);
        const dateB = this.tryParseDate(valB);
        if (dateA && dateB) {
          return (dateA.getTime() - dateB.getTime()) * dir;
        }

        const strA = valA == null ? '' : String(valA).toLowerCase();
        const strB = valB == null ? '' : String(valB).toLowerCase();
        return strA.localeCompare(strB) * dir;
      });
    }

    this.filteredPayments = filtered;
  }

  private tryParseDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const timestamp = Date.parse(String(value));
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  // --- UI Helpers ---

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByPaymentId(index: number, item: PaymentsDTO): string {
    return item?.orderId ?? `${index}`;
  }
}