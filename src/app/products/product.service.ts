// src/app/products/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../env/environment-development';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  url: string = `${environment.apiBaseUrl}/item`; // Matches your .NET API route
  list: Product[] = [];

  constructor(private http: HttpClient) {}

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  // Get product by ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  // Get filtered products
 getFilteredProducts(keyword: string, location: string, categoryId: number) {
  let url = `${this.url}/search?q=${encodeURIComponent(keyword)}`;
  if (location) url += `&location=${encodeURIComponent(location)}`;
  if (categoryId) url += `&categoryId=${categoryId}`;
  return this.http.get<Product[]>(url);
}


  // Add a product with image (multipart/form-data)
  addProduct(formData: FormData): Observable<any> {
    return this.http.post(this.url, formData); // ✅ Corrected URL
  }

  getMyItems(): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.url}/my-items`);
}
deleteItem(id: number) {
  return this.http.delete(`${this.url}/${id}`);
}


updateItem(id: number, formData: FormData): Observable<any> {
  return this.http.put(`${this.url}/${id}`, formData);
}


getSimilarProducts(id: number): Observable<Product[]> {
  return this.http.get<Product[]>(`${this.url}/${id}/similar`);
}


}
