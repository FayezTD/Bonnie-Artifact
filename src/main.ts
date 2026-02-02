import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ParentPageComponent } from './app/parent-page/parent-page.component';

bootstrapApplication(ParentPageComponent, {
  providers: [
    provideHttpClient(), // Add this line
    // ... any other providers you have
  ]
}).catch(err => console.error(err));