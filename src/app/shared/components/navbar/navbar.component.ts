import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription, filter } from 'rxjs';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NotificationPopoverComponent } from 'src/app/notification-popover/notification-popover.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBarComponent, NotificationPopoverComponent]
})
export class NavbarComponent implements OnInit, OnDestroy {
  userfullname: string = "";
  profilePic: string | null = null;
  private userSubscription: Subscription | null = null;
  unreadCount = 0;
  isNotificationPopoverOpen = false;

  // --- REFACTORED STATE ---
  // Flag to show/hide any search UI based on route
  showSearchBar: boolean = true;
  // Flag to control the mobile search overlay
  isMobileSearchVisible: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    public notificationService: NotificationService,
    private elementRef: ElementRef
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        const currentUrl = navEnd.urlAfterRedirects.toLowerCase();

        // Routes where the search bar should be hidden entirely
        const hiddenRoutes = [
          '/auth/login', '/auth/register', '/login', '/notifications', '/my-wishlist',
          '/add-product', '/my-items', '/profile', '/edit-profile', '/my-bookings', '/payment-history'
        ];

        const dynamicPrefixes = [
          '/products/', // Will match /products/31, etc.
          '/user-dashboard'
        ];

        // This controls if the DESKTOP search bar OR the MOBILE search icon are visible
        this.showSearchBar =
          !hiddenRoutes.includes(currentUrl) &&
          !dynamicPrefixes.some(prefix => currentUrl.startsWith(prefix));
          
        // Close mobile search on navigation
        if(this.isMobileSearchVisible) {
          this.closeMobileSearch();
        }
      });
  }

  ngOnInit(): void {
    this.initializeUserData();

    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userfullname = user.unique_name || '';
        this.profilePic = this.authService.getUserProfilePic();
      } else {
        this.userfullname = "";
        this.profilePic = null;
      }
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private initializeUserData(): void {
    if (this.authService.isLoggedIn()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.userfullname = currentUser.unique_name || currentUser.FullName || '';
        this.profilePic = this.authService.getUserProfilePic();
      }
    }
  }

  // --- NEW METHODS FOR MOBILE SEARCH ---
  openMobileSearch(): void {
    this.isMobileSearchVisible = true;
  }

  closeMobileSearch(): void {
    this.isMobileSearchVisible = false;
  }
  // ------------------------------------

  handleListItemClick(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/add-product']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const notificationContainer = this.elementRef.nativeElement.querySelector('.notification-container');
    if (this.isNotificationPopoverOpen && !notificationContainer?.contains(event.target)) {
      this.isNotificationPopoverOpen = false;
    }
  }

  toggleNotificationPopover(event: MouseEvent): void {
    event.stopPropagation();
    this.isNotificationPopoverOpen = !this.isNotificationPopoverOpen;
  }

  logout(): void {
    this.authService.logout(); // Use service for logout logic
    this.router.navigate(['/auth/login']);
  }

  onSearch(query: string) {
    console.log('Search triggered from navbar:', query);
    if (query?.trim()) {
      // The search bar component now handles navigation, so this can be simplified or removed
      // if all search logic is self-contained in the search-bar component.
    }
  }
}