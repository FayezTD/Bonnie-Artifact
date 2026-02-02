import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// Import the Kobie Loyalty Chatbot Module
import { KobieLoyaltyChatbotModule } from 'kobie-loyalty-chatbot';

import { AppComponent } from './app.component';

/**
 * Example App Module showing how to integrate
 * the Kobie Loyalty Chatbot library
 * 
 * STEPS TO INTEGRATE:
 * 
 * 1. Install the package:
 *    npm install /path/to/kobie-loyalty-chatbot-1.0.0.tgz
 * 
 * 2. Import KobieLoyaltyChatbotModule in your module (shown below)
 * 
 * 3. Add <klc-chat> component to your template
 * 
 * That's it! The chatbot is ready to use.
 */

@NgModule({
  declarations: [
    AppComponent
    // Your other components
  ],
  imports: [
    BrowserModule,
    
    // Required: HttpClientModule for API calls
    HttpClientModule,
    
    // Add the Kobie Loyalty Chatbot Module
    KobieLoyaltyChatbotModule,
    
    // Your other modules...
  ],
  providers: [
    // The ChatService is automatically provided by the library
    // No need to add it here
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

/**
 * ALTERNATIVE: Using Standalone Components (Angular 14+)
 * 
 * If your app uses standalone components, you can import directly:
 * 
 * import { Component } from '@angular/core';
 * import { ChatComponent } from 'kobie-loyalty-chatbot';
 * 
 * @Component({
 *   selector: 'app-root',
 *   standalone: true,
 *   imports: [ChatComponent],
 *   template: `<klc-chat [userid]="'user123'"></klc-chat>`
 * })
 * export class AppComponent { }
 */
