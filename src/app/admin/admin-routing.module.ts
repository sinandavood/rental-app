import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PendingItemsComponent } from './pending-items/pending-items.component';
import { BroadcastComponent } from './broadcast-message/broadcast-message.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
      { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },
      { path: 'categories', loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'kyc-requests', loadComponent: () => import('./kyc-requests/kyc-requests.component').then(m => m.KycRequestsComponent) },
      { path: 'pending-items', component:PendingItemsComponent },
      { path: 'broadcast-message', loadComponent: () => import('./broadcast-message/broadcast-message.component').then(m => m.BroadcastComponent) }


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
