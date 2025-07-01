import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../env/environment-development';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  url:string=environment.apiBaseUrl+'/Category';
  list:Category[]=[]

  constructor(private http:HttpClient) { }

  
  refreshList(){
    this.http.get(this.url).subscribe({
      next:res=>{
        this.list=res as Category[]
      },
      error:err=>{console.log(err)}
    })

  }
  getAll() {
  return this.http.get<Category[]>(`${this.url}/categories`);
}


  
}
