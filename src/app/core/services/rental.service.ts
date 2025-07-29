import { Injectable } from '@angular/core';
import { environment } from 'src/app/env/environment-development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RentalService {
  apiBaseUrl:string=`${environment.apiBaseUrl}/rental`;


 constructor(private http:HttpClient) 
 { }


  
}
