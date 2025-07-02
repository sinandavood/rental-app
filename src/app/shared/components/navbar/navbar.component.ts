import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone:true,
  imports:[CommonModule,RouterModule]
})
export class NavbarComponent {

  userfullname:string="";
  profilePic: string | null = null;

  ngOnInit(): void {
  this.authService.user$.subscribe(user => {
    this.userfullname = user?.unique_name || '';
    console.log('User from stream:', user);
    this.profilePic = localStorage.getItem('profilePic')
     console.log('Profile Pic URL:', this.profilePic);

  });
}
  constructor(
    public authService: AuthService, // make public to use in template
    private router: Router
  ) {}

  logout(): void {
    localStorage.removeItem('token');
     localStorage.removeItem('profilePic');
    this.router.navigate(['/auth/login']);
  }
 





}
