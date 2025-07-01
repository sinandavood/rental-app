import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CategoryListComponent } from '../categories/category-list/category-list.component';
import { ProductListComponent } from '../products/product-list/product-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryListComponent, ProductListComponent,RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  locations: string[] = [];
  currentLocation = '';
  searchKeyword = '';
  selectedLocation = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getCurrentLocation();
    this.loadIndianCities();
  }

  /** Fetch geolocation and reverse geocode to get current city */
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.reverseGeocode(lat, lon); // Fetch city name
        },
        (error) => {
          console.error('Error getting location:', error);
          // Even if geolocation fails, you already have other locations loaded
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  /** Use OpenStreetMap Nominatim to get the city from lat/lon */
  reverseGeocode(lat: number, lon: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      .then(res => res.json())
      .then((data) => {
        const city = data?.address?.city || data?.address?.town || data?.address?.village || '';
        if (city) {
          this.currentLocation = city;
          this.locations.unshift('Current Location: ' + city); // Add at top of list
        }
      })
      .catch((error) => {
        console.error('Error reverse geocoding:', error);
      });
  }

  /** Populate with Indian cities */
  loadIndianCities(): void {
    const indianCities = [
      'Chennai',
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Kolkata',
      'Pune',
      'Hyderabad',
      'Ahmedabad',
      'Jaipur',
      'Lucknow',
      'Surat',
      'Chandigarh',
      'Kochi',
      'Bhopal',
      'Patna'
    ];
    this.locations.push(...indianCities);
  }

  onSearch(): void {
    this.router.navigate(['/products'], {
      queryParams: {
        keyword: this.searchKeyword,
        location: this.selectedLocation,
      },
    });
  }
}
