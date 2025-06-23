import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  {path: '', component:  HomeComponent},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) },

  {path:'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule),canActivate: [authGuard]},
  {path:'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),canActivate: [adminGuard]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes),HomeComponent],
  exports: [RouterModule]
})
export class AppRoutingModule { }
