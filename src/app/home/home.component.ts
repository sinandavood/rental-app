import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryListComponent } from '../categories/category-list/category-list.component';
import { ProductListComponent } from '../products/product-list/product-list.component';


@Component({
  selector: 'app-home',
  standalone:true,
  templateUrl: './home.component.html',
  imports: [  CommonModule,
    FormsModule,
    CategoryListComponent, // <- also standalone
    ProductListComponent ],
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
constructor(private router: Router) { }

  locations:string[] = ['Chennai', 'Mumbai', 'Delhi'];

searchKeyword:string = '';
selectedLocation:string = '';


onSearch():void {
  this.router.navigate(['/products'], {
    queryParams: {
      keyword: this.searchKeyword,
      location: this.selectedLocation,
    }
  });
}
}
