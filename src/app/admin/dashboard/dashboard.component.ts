import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/admin-dashboard.service';
import { environment } from 'src/app/env/environment';
import { DashboardSummary } from 'src/app/models/Dashboard-summary.model';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  summary!: DashboardSummary;
  loading = true;
  apiBaseUrl = environment.apiBaseUrl;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: (res: DashboardSummary) => {
        this.summary = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load dashboard data', err);
        // Optionally show a toast notification
      },
    });
  }
}