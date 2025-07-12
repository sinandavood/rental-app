import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../env/environment';

// Import standalone components
import { CategoryListComponent } from '../categories/category-list/category-list.component';
import { ProductListComponent } from '../products/product-list/product-list.component';

// If you use routerLink in template
import { RouterModule } from '@angular/router';
import { SearchService } from '../core/services/search.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    CategoryListComponent,
    ProductListComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  searchResults:any[]=[];

  constructor(private searchService:SearchService){}

  ngOnInit(): void {
    this.searchService.searchResults$.subscribe(results=>{
      this.searchResults=results;
    })
  }

}
