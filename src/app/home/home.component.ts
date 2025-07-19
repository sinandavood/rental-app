import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../env/environment';

import { CategoryListComponent } from '../categories/category-list/category-list.component';
import { ProductListComponent } from '../products/product-list/product-list.component';
import { SearchService } from '../core/services/search.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    CategoryListComponent,
    ProductListComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  recentlyAddedProducts: any[] = [];
  topRatedProducts: any[] = [];
  searchResults: any[] = [];

  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private searchService: SearchService) {}

  ngOnInit(): void {
    this.loadRecentlyAdded();
    this.loadTopRated();

    this.searchService.searchResults$.subscribe(results => {
      this.searchResults = results;
    });
  }

  loadRecentlyAdded() {
    this.http.get<any[]>(`${this.apiBaseUrl}/item/recent`).subscribe(data => {
      this.recentlyAddedProducts = data;
    });
  }

  loadTopRated() {
    this.http.get<any[]>(`${this.apiBaseUrl}/item/top-rated`).subscribe(data => {
      this.topRatedProducts = data;
    });
  }
}
