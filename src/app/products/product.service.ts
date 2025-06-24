import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model'; // Adjust path if needed
import { environment } from '../env/environment-development';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  url: string = `${environment.apiBaseUrl}/item`;
  list: Product[] = [];

  constructor(private http: HttpClient) {}

  getFilteredProducts(keyword: string, location: string): Observable<Product[]> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (location) params = params.set('location', location);

    return this.http.get<Product[]>(this.url, { params });
  }
}
