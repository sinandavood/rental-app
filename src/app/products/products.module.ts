import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';


@NgModule({
  declarations: [
    
    ProductDetailsComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule
  ],
   exports: [
    ProductDetailsComponent
    ]
})
export class ProductsModule { }
