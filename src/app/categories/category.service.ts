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

  // Get all categories
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}`);
  }

  // Get category by ID
  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  // Create category
  create(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}`, category);
  }

  // Update category
  update(id: number, category: Partial<Category>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, category);
  }

  // Delete category
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
