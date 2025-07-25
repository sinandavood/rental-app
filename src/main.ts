import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import { environment } from './app/env/environment-development';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor'
import { provideEcharts } from 'ngx-echarts';

// ✅ Initialize Firebase
initializeApp(environment.firebaseConfig);

// ✅ Bootstrap application with DI-based interceptor
bootstrapApplication(AppComponent, {
  providers: [
    provideEcharts(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    },
    provideAnimations()
]
}).catch(err => console.error(err));
