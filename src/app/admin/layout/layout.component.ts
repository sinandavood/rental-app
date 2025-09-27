import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service'; // adjust path

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [RouterModule]
})
export class LayoutComponent {
  sidebarOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout(); // Implement this in your auth service
    this.router.navigate(['/login']);
  }

  // Close sidebar when clicking outside on mobile
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.mobile-toggle');
    
    if (window.innerWidth <= 768) {
      if (sidebar && toggleBtn && 
          !sidebar.contains(target) && 
          !toggleBtn.contains(target) && 
          this.sidebarOpen) {
        this.sidebarOpen = false;
      }
    }
  }
}