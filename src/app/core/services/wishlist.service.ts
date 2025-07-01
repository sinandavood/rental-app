import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/env/environment-development';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private baseUrl = `${environment.apiBaseUrl}/wishlist`;

  constructor(private http: HttpClient) {}

  // ✅ Get all wishlist items for current user
  getWishlist(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // ✅ Add item to wishlist
  addToWishlist(itemId: number): Observable<any> {
    return this.http.post(this.baseUrl, { itemId });
  }

  // ✅ Remove item from wishlist
  removeFromWishlist(itemId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${itemId}`);
  }
}
