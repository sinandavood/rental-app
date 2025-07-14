import { Component,Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductListComponent } from 'src/app/products/product-list/product-list.component';
import { SearchService } from 'src/app/core/services/search.service';




@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule, ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  

    apibaseurl =environment.apiBaseUrl;

  searchControl = new FormControl('');
  selectedLocation: string = 'All';
  selectedCategoryId: number = 0;

  locations: string[] = [];
  categories: any[] = [];

  searchResults: any[] = [];
  suggestions: string[] = [];
  showSuggestions = false;

  recentSearches: string[] = [];
  loading=false;
 searchText = '';
  constructor(private http: HttpClient,private searchService:SearchService) {}

  ngOnInit(): void {
    this.loadFilters();

    // Load recent from localStorage
    const stored = localStorage.getItem('recentSearches');
    this.recentSearches = stored ? JSON.parse(stored) : [];

    // Only fetch suggestions while typing (not results)
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => this.fetchSuggestions(value || ''));
  }

  loadFilters() {
    this.http.get<string[]>(`${this.apibaseurl}/item/locations`).subscribe(data => this.locations = data);
    this.http.get<any[]>(`${this.apibaseurl}/category`).subscribe(data => this.categories = data);
  }

  fetchFilteredItems() {
    const query = this.searchControl.value?.trim() || '';
    const locParam = this.selectedLocation !== 'All' ? `&location=${encodeURIComponent(this.selectedLocation)}` : '';
    const catParam = this.selectedCategoryId !== 0 ? `&categoryId=${this.selectedCategoryId}` : '';
    this.loading=true;

    this.http.get<any[]>(`${this.apibaseurl}/item/search?q=${encodeURIComponent(query)}${locParam}${catParam}`)
      .subscribe(results => {
        this.searchService.setResults(results);
        this.showSuggestions = false;
        this.loading=false;
      });

    this.saveRecentSearch(query);
  }

  saveRecentSearch(query: string) {
    if (!query) return;
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.recentSearches.unshift(query);
    if (this.recentSearches.length > 5) this.recentSearches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  onSearch(event?:Event) {
    if (event) event.preventDefault();
    console.log('Enter pressed');
    
    const query = this.searchControl.value?.trim();
    if (query) {
      console.log('SearchBarComponent emitting search:', query);
      this.search.emit(query); // 🔥 THIS LINE sends it to Navbar
      this.addToRecentSearches(query);
      this.fetchFilteredItems();
    }
  }

    addToRecentSearches(query: string) {
    const maxItems = 5;
    if (!this.recentSearches.includes(query)) {
      this.recentSearches.unshift(query);
      if (this.recentSearches.length > maxItems) {
        this.recentSearches.pop();
      }
    }
  }
  onFilterChange() {
    this.fetchFilteredItems();
  }

  onClear() {
    this.searchControl.setValue('');
    this.selectedLocation = 'All';
    this.selectedCategoryId = 0;
    this.searchResults = [];
  }

  fetchSuggestions(term: string) {
    if (!term.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    this.http.get<string[]>(`${this.apibaseurl}/item/autocomplete?term=${encodeURIComponent(term)}`)
      .subscribe(data => {
        this.suggestions = data;
        this.showSuggestions = true;
      });
  }

  onSuggestionClick(suggestion: string) {
    this.searchControl.setValue(suggestion);
    this.showSuggestions = false;
  }

  hideSuggestionsWithDelay() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
  clearRecentSearches() {
  this.recentSearches = [];
  localStorage.removeItem('recentSearches');
  this.showSuggestions=false;
}

}
