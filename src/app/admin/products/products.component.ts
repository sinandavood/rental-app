import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/admin-dashboard.service';
import { ListedItemAdmin } from '../Admin_models/ListedItemAdmin.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  allItems: ListedItemAdmin[] = [];
  filteredItems: ListedItemAdmin[] = [];
  searchQuery = '';
  page = 1;
  pageSize = 50;
  isloading=false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.isloading=true;
    this.dashboardService.getAllItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.applyFilters();
        this.isloading=false;
      },
      error: (err) => {console.error('Error loading items:', err)
        this.isloading=false;
      }
    });
  }

  applyFilters() {
    this.filteredItems = this.allItems.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      item.ownerName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  nextPage() {
    if ((this.page * this.pageSize) < this.filteredItems.length) {
      this.page++;
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
    }
  }
}
