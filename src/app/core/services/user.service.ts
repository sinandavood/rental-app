import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/env/environment-development';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl=environment.apiBaseUrl;

  constructor(private http:HttpClient) { }

  updateProfile(profileData:any)
  {
    return this.http.post(`${this.apiUrl}/User/update-profile`,profileData);

  }

  getUserDashboardData(userId:string)
  {
    return this.http.get(`${this.apiUrl}/User/dashboard/${userId}`);
  }
}
