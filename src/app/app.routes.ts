import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { AddProductComponent } from './products/add-product/add-product.component';
import { ProductListComponent } from './products/product-list/product-list.component';

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
        canActivate: [AuthGuard],
    },
    {
        path: 'add-product', component: AddProductComponent
    },
    {
        path: 'my-items',
        loadComponent: () => import('./products/my-items/my-items.component').then(m => m.MyItemsComponent)
    },

    {
        path:'notifications',
        loadComponent:()=> import('./notifications/notifications.component').then(m=>m.NotificationsComponent),
        canActivate:[AuthGuard],

    },

     {
        path:'my-bookings',
        loadComponent:()=> import('./my-bookings/my-bookings.component').then(m=>m.MyBookingsComponent),
        canActivate:[AuthGuard],

    },


    {
        path: 'edit-item/:id',
        loadComponent: () => import('./products/edit-item/edit-item.component').then(m => m.EditItemComponent)
    },

    {
        path:'profile',
        loadComponent:()=>import('./user/profile/profile.component').then(m=>m.ProfileComponent)


    },

    {
        path:'search',
        component:ProductListComponent
    },
    {
        path:'edit-profile',
        loadComponent:()=>import('./user/edit-profile/edit-profile.component').then(m=>m.EditProfileComponent)
    },

    // {
    //     path:'pending-items',
    //     loadComponent:()=>import('./admin/pending-items/pending-items.component').then(m=>m.PendingItemsComponent)

    // },


    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },


];
