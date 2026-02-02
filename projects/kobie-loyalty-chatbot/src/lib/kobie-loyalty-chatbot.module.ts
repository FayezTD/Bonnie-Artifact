// Kobie Loyalty Chatbot Library Module
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Components
import { ChatComponent } from './components/chat/chat.component';
import { ChatFormComponent } from './components/chat-form/chat-form.component';

// Services
import { ChatService } from './services/chat.services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // Import standalone components
    ChatComponent,
    ChatFormComponent
  ],
  exports: [
    // Export components for use in host applications
    ChatComponent,
    ChatFormComponent
  ],
  providers: [
    // Provide services at library level
    ChatService
  ]
})
export class KobieLoyaltyChatbotModule { }
