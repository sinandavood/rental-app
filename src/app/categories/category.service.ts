import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../env/environment-development';
import { Category } from '../models/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private url: string = `${environment.apiBaseUrl}/Category`;

  constructor(private http: HttpClient) {}

  // Get all categories
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url);
  }
}
