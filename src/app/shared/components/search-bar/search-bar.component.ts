// src/app/shared/components/search-bar/search-bar.component.ts
// *NO MAJOR CHANGES TO LOGIC* - Just added Input/Output for mobile overlay control

import { Component, Output, EventEmitter, OnInit, HostListener, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from 'src/app/env/environment-development';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService } from 'src/app/core/services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'] // We'll clear this file
})
export class SearchBarComponent implements OnInit {
  // --- NEW ---
  @Input() isMobileSearchActive = false; // Input to activate mobile view
  @Output() closeMobileSearch = new EventEmitter<void>(); // Output to close it
  // -----------

  @Output() search = new EventEmitter<string>();

  apibaseurl = environment.apiBaseUrl;

  // Form & Filter State
  searchControl = new FormControl('');
  selectedLocation: string = 'All Locations'; // Changed for better display text
  selectedCategoryId: number = 0;

  // Data for Filters
  locations: string[] = [];
  categories: any[] = [];

  // Suggestions & Recent
  suggestions: string[] = [];
  showSuggestions = false;
  recentSearches: string[] = [];
  isSearching: boolean = false;
  selectedSuggestionIndex: number = -1;

  // Custom Dropdowns
  openDropdown: 'location' | 'category' | null = null;

  // Error Handling
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private searchService: SearchService,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close custom dropdowns if clicked outside
    if (this.openDropdown && !this.elementRef.nativeElement.querySelector('.dropdown-container')?.contains(event.target)) {
      this.openDropdown = null;
    }
  }

  ngOnInit(): void {
    this.loadFilters();
    const stored = localStorage.getItem('recentSearches');
    this.recentSearches = stored ? JSON.parse(stored) : [];

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe({
        next: (value) => this.fetchSuggestions(value || ''),
        error: () => {
          this.errorMessage = 'Failed to fetch suggestions. Please try again.';
          this.suggestions = [];
          this.showSuggestions = this.recentSearches.length > 0;
        }
      });
  }

  loadFilters(): void {
    this.http.get<string[]>(`${this.apibaseurl}/item/locations`).subscribe({
      next: (data) => (this.locations = data), // Removed 'All' from here, handled in template
      error: () => (this.errorMessage = 'Failed to load locations.')
    });
    this.http.get<any[]>(`${this.apibaseurl}/category`).subscribe({
      next: (data) => (this.categories = data), // Removed 'All' from here, handled in template
      error: () => (this.errorMessage = 'Failed to load categories.')
    });
  }

  fetchFilteredItems(): void {
    const query = this.searchControl.value?.trim() || '';
    const locParam = this.selectedLocation !== 'All Locations' ? `&location=${encodeURIComponent(this.selectedLocation)}` : '';
    const catParam = this.selectedCategoryId !== 0 ? `&categoryId=${this.selectedCategoryId}` : '';
    this.isSearching = true;
    this.errorMessage = null;
    this.searchService.setLoading(true);

    // Close mobile search on submit
    if (this.isMobileSearchActive) {
      this.closeMobileSearch.emit();
    }

    this.http.get<any[]>(`${this.apibaseurl}/item/search?q=${encodeURIComponent(query)}${locParam}${catParam}`)
      .subscribe({
        next: (results) => {
          this.searchService.setResults(results);
          this.showSuggestions = false;
          this.isSearching = false;
          if (results.length === 0) {
            this.errorMessage = 'No results found for your search.';
          }
        },
        error: () => {
          this.isSearching = false;
          this.searchService.setLoading(false);
          this.errorMessage = 'An error occurred while searching. Please try again.';
        }
      });

    this.saveRecentSearch(query);
  }

  saveRecentSearch(query: string): void {
    if (!query) return;
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.recentSearches.unshift(query);
    if (this.recentSearches.length > 5) this.recentSearches.pop();
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  onSearch(event?: Event): void {
    if (event) event.preventDefault();
    this.fetchFilteredItems();
  }

  onClear(): void {
    this.searchControl.setValue('');
    this.selectedLocation = 'All Locations';
    this.selectedCategoryId = 0;
    this.showSuggestions = false;
    this.errorMessage = null;
    this.openDropdown = null;
    this.fetchFilteredItems();
  }

  fetchSuggestions(term: string): void {
    if (!term.trim()) {
      this.suggestions = [];
      this.showSuggestions = this.recentSearches.length > 0;
      return;
    }
    this.isSearching = true;
    // Your existing fetch suggestions logic...
     this.http.get<string[]>(`${this.apibaseurl}/item/autocomplete?term=${encodeURIComponent(term)}`)
      .subscribe({
        next: (data) => {
          this.suggestions = data;
          this.showSuggestions = true;
          this.isSearching = false;
        },
        error: () => {
          this.errorMessage = 'Failed to fetch suggestions.';
          this.suggestions = [];
          this.showSuggestions = this.recentSearches.length > 0;
          this.isSearching = false;
        }
      });
  }

  onSuggestionClick(suggestion: string): void {
    this.searchControl.setValue(suggestion);
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.fetchFilteredItems();
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    }, 200);
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
    this.showSuggestions = false;
  }

  getCategoryName(categoryId: number): string {
    if (!categoryId || categoryId === 0) return 'All Categories';
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'All Categories';
  }

  // --- REFACTORED for custom dropdowns ---
  toggleDropdown(type: 'location' | 'category', event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  selectLocation(location: string): void {
    this.selectedLocation = location;
    this.openDropdown = null;
    if(!this.isMobileSearchActive) this.fetchFilteredItems(); // Search immediately on desktop
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.openDropdown = null;
    if(!this.isMobileSearchActive) this.fetchFilteredItems(); // Search immediately on desktop
  }

  // Your existing onKeyDown method... (no changes needed)
   onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions) return;

    const allSuggestions = this.suggestions.length > 0 ? this.suggestions : this.recentSearches;
    if (allSuggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % allSuggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + allSuggestions.length) % allSuggestions.length;
    } else if (event.key === 'Enter' && this.selectedSuggestionIndex > -1) {
      event.preventDefault();
      this.onSuggestionClick(allSuggestions[this.selectedSuggestionIndex]);
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    }
  }
    get showClearButton(): boolean {
    // The !! converts a truthy/falsy value (like a string) to a true boolean
    return !!this.searchControl.value || this.selectedLocation !== 'All Locations' || this.selectedCategoryId !== 0;
  }
}