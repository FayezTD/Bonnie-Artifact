import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// Import the Kobie Loyalty Chatbot Library
import { KobieLoyaltyChatbotModule } from 'kobie-loyalty-chatbot';

import { AppComponent } from './app/app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    KobieLoyaltyChatbotModule  // Import the chatbot library
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
