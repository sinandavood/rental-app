import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/admin-dashboard.service';
import { ListedItemAdmin } from '../Admin_models/ListedItemAdmin.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/env/environment-development';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pending-items',
  templateUrl: './pending-items.component.html',
  standalone:true,
  imports:[CommonModule,FormsModule]
})
export class PendingItemsComponent implements OnInit {

  baseUrl:string=environment.apiBaseUrl;
  pendingItems: ListedItemAdmin[] = [];

  constructor(private dashboardService: DashboardService, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPendingItems();
  }

  fetchPendingItems(): void {
    this.dashboardService.getPendingItems().subscribe({
      next: data => this.pendingItems = data,
      error: err => console.error(err)
    });
  }

 approveItem(id: string) {
  this.http.put(`${this.baseUrl}/admin/${id}/status?status=Active`, {})
    .subscribe({
      next: () => {
        this.pendingItems = this.pendingItems.filter(item => item.id !== id);
      },
      error: (err) => {
        console.error('Error approving item', err);
      }
    });
}

}
