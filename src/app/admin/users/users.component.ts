import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User_admin } from '../Admin_models/Users_Admin.model';
import { DashboardService } from '../services/admin-dashboard.service';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/app/env/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  allUsers: User_admin[] = [];
  filteredUsers: User_admin[] = [];

  searchTerm = '';
  loading = true;

  // Pagination
  page = 1;
  pageSize = 50;
  apiBaseUrl=environment.apiBaseUrl;

  // Sorting
  sortColumn: keyof User_admin = 'fullName';
  sortAsc = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
     this.loading = true;
    this.dashboardService.getAllUsers().subscribe({
      next: (res) => {
        this.allUsers = res;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers
      .filter(u =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
        return this.sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }

  toggleSort(column: keyof User_admin) {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
    this.applyFilters();
  }

 

  goToNextPage() {
  this.page++;
  this.applyFilters();
}

goToPreviousPage() {
  this.page--;
  this.applyFilters();
}

blockUnblockUser(user: User_admin) {
  const updatedStatus = !user.isBlocked;
  const url = updatedStatus
    ? `${this.apiBaseUrl}/admin/block-user/${user.id}`
    : `${this.apiBaseUrl}/admin/unblock-user/${user.id}`;

  this.dashboardService.toggleUserBlock(url).subscribe({
    next: () => {
      user.isBlocked = updatedStatus;
    },
    error: (err) => {
      console.error('Failed to update block status', err);
    }
  });
}
deleteUser(user: User_admin) {
  const confirmed = confirm(`Are you sure you want to delete ${user.fullName}?`);
  if (!confirmed) return;

  this.dashboardService.deleteUser(user.id).subscribe({
    next: () => {
      // Remove from both arrays if used
      this.allUsers = this.allUsers.filter(u => u.id !== user.id);
      if (this.filteredUsers) {
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
      }
      // Or trigger filter logic again
      this.applyFilters?.();
    },
    error: err => {
      console.error('Delete failed:', err);
      alert('Failed to delete user.');
    }
  });
}



}
