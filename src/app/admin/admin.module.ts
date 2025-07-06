// admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module'; // ✅ this one
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
     LayoutComponent,DashboardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule // ✅ this must be here
  ]
})
export class AdminModule {}

