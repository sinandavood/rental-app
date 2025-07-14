import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription,filter } from 'rxjs';
import { SearchBarComponent } from '../search-bar/search-bar.component';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule,SearchBarComponent]
})
export class NavbarComponent implements OnInit, OnDestroy {
  userfullname: string = "";
  profilePic: string | null = null;
  private userSubscription: Subscription | null = null;
  @Input() showSearchBar:boolean=true;

  constructor(
  public authService: AuthService,
  private router: Router
) {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event) => {
      const navEnd = event as NavigationEnd;
      const currentUrl = navEnd.urlAfterRedirects.toLowerCase();

      const hiddenRoutes = [
        // Home & product listing
        '/auth/login',
        '/auth/register',
        '/login',
        '/notifications',
        '/my-wishlist',
        '/add-product',
        '/my-items',
        '/profile',
        '/edit-profile',
        '/my-bookings'
      ];

      const dynamicPrefixes = [
        '/products/' // Will match /products/31, /products/abc, etc.
      ];

      this.showSearchBar =
        !hiddenRoutes.includes(currentUrl) &&
        !dynamicPrefixes.some(prefix => currentUrl.startsWith(prefix));
    });
}
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

  onSearch(query: string) {
  console.log('Search triggered with:', query);
  if (query?.trim()) {
    this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
  }
}

}