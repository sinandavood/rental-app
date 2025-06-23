import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model'; // Adjust the import path as necessary
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:3000/api'; // Adjust the base URL as needed
  constructor(private http: HttpClient) { }

 getFilteredProducts(keyword: string, location: string): Observable<Product[]> {
  let params = new HttpParams();
  if (keyword) params = params.set('keyword', keyword);
  if (location) params = params.set('location', location);


  return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
}
}
