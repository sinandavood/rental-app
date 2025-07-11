import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  userfullname: string = "";
  profilePic: string | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Initialize with current user data if available
    this.initializeUserData();

    // ✅ Subscribe to user changes
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userfullname = user.unique_name , '';
        this.profilePic = this.authService.getUserProfilePic();
        console.log('User updated:', { userfullname: this.userfullname, profilePic: this.profilePic });
      } else {
        this.userfullname = "";
        this.profilePic = null;
      }
    });
  }

  ngOnDestroy(): void {
    // ✅ Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // ✅ Initialize user data on component load
  private initializeUserData(): void {
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.userfullname = currentUser.unique_name || currentUser.FullName || '';
        this.profilePic = this.authService.getUserProfilePic();
      }
    }
  }

  handleListItemClick(): void {
  if (this.authService.isLoggedIn()) {
    this.router.navigate(['/add-product']);
  } else {
    this.router.navigate(['/auth/login']);
  }
}

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('profilePic');
    localStorage.removeItem('role');
    this.userfullname = "";
    this.profilePic = null;
    this.router.navigate(['/auth/login']);
  }
}