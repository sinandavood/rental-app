import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private baseUrl = 'https://localhost:7155/api/WishList'; 

  constructor(private http: HttpClient) {}

  // ✅ Get all wishlist items
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
