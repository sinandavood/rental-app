import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { FormsModule } from '@angular/forms';
import{ CommonModule } from '@angular/common'; // Importing CommonModule for common directives
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
// Importing CoreModule for shared services and components

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    
  ],
  imports: [
    BrowserModule,
    CoreModule,
    // Importing AppRoutingModule to handle routing in the application
    AppRoutingModule,
    SharedModule,
    FormsModule,
    CategoriesModule,
    AuthModule,
    HttpClientModule,
    HomeComponent,
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
    // Providing AuthInterceptor to handle authentication in HTTP requests
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
