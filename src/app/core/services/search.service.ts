// search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private searchResultsSource = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSource.asObservable();

   private loadingSource = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSource.asObservable();

  setResults(results: any[]) {
    this.searchResultsSource.next(results);
  }
  setLoading(isLoading:boolean)
  {
    this.loadingSource.next(isLoading);

  }
}
