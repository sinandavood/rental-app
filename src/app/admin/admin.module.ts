// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module'; // ✅ this one



@NgModule({
  declarations: [

   
  ],
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule // ✅ this must be here
  ]
})
export class AdminModule {}

