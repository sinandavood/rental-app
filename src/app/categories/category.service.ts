import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../env/environment-development';
import { Category } from '../models/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl: string = `${environment.apiBaseUrl}/category`;

  constructor(private http: HttpClient) {}

  // Get all categories (no change needed)
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}`);
  }

  // ✅ UPDATED: create method now accepts FormData
  create(formData: FormData): Observable<Category> {
    // When sending FormData, you don't need to set the Content-Type header.
    // The browser will handle it automatically.
    return this.http.post<Category>(`${this.baseUrl}`, formData);
  }

  // ✅ UPDATED: createSubCategory method now accepts FormData
  createSubCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/subcategory`, formData);
  }

  update(id: number, formData: FormData): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, formData);
  }

  // Delete category (no change needed)
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Note: An update method would also need to be changed to accept FormData
  // if you want to allow changing the image.
}
