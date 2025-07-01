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

  userfullname:string=""

  ngOnInit():void{
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser(); // You need to implement this
      this.userfullname = user?.FullName || '';
    }
  }
  constructor(
    public authService: AuthService, // make public to use in template
    private router: Router
  ) {}

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
