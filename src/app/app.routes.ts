import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsModule),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./products/product-details/product-details.component').then(m => m.ProductDetailsComponent),
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AdminGuard],
  },
  {
    path: 'my-wishlist',
    loadComponent: () =>
      import('./mywishlist-list/mywishlist-list.component').then(m => m.MyWishlistComponent),
  },
];
