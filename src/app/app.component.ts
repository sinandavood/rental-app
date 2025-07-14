import { Component } from '@angular/core';
import { Router, RouterOutlet,NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    RouterModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'your-app-name';
 

   constructor(
    private authservice: AuthService,
    public router: Router // ✅ injected Router here
  ) {



  }

  ngOnInit():void{
    this.authservice.getCurrentUser();
  }

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}