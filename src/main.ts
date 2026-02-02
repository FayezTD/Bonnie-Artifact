import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

// Import the Kobie Loyalty Chatbot Library
import { KobieLoyaltyChatbotModule, ChatService, ChatRequestModel } from 'kobie-loyalty-chatbot';

// Demo Component
@Component({
  selector: 'app-root',
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; min-height: 100vh; background: #f8f9fa;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="color: #333; margin-bottom: 10px;">🎉 Kobie Loyalty Chatbot - Demo</h1>
        <p style="color: #666; margin-bottom: 30px;">The chatbot should appear in the bottom-right corner of the screen.</p>
        
        <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #5461C8;">Test Controls</h2>
          <button (click)="clearChat()" style="margin: 5px; padding: 10px 20px; background: #5461C8; color: white; border: none; border-radius: 6px; cursor: pointer;">
            🧹 Clear Chat
          </button>
          <button (click)="getMessages()" style="margin: 5px; padding: 10px 20px; background: #fd7e4f; color: white; border: none; border-radius: 6px; cursor: pointer;">
            📝 Log Messages
          </button>
          <p style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
            <strong>✅ Status:</strong> Chatbot library loaded successfully!
          </p>
        </div>

        <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="margin-top: 0; color: #5461C8;">Instructions</h2>
          <ol style="line-height: 1.8; color: #555;">
            <li>Look for the chatbot icon in the bottom-right corner</li>
            <li>Click the icon to open the chat</li>
            <li>Start chatting with Bonnie!</li>
            <li>Try the KPI metrics, PDF export, and other features</li>
          </ol>
        </div>
      </div>

      <!-- The Chatbot Component -->
      <klc-chat
        [title]="'Bonnie'"
        [userid]="'test-user-123'"
        [username]="'Demo User'"
        [userRole]="'Admin'"
        [selectedModel]="'OpenAI'"
        (messageEvent)="onMessageEvent($event)">
      </klc-chat>
    </div>
  `
})
export class AppComponent implements OnInit {
  
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    console.log('✅ Kobie Chatbot Demo Started');
    console.log('📦 Library loaded from: kobie-loyalty-chatbot');
    // Configure API if needed
    // this.chatService.updateApiUrl('http://your-api-url.com');
  }

  onMessageEvent(request: ChatRequestModel) {
    console.log('📨 Message Event:', request);
  }

  clearChat() {
    this.chatService.startNewChat();
    console.log('🧹 Chat cleared');
  }

  getMessages() {
    const messages = this.chatService.getCurrentMessages();
    console.log('📝 Current messages:', messages);
  }
}

// App Module
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    KobieLoyaltyChatbotModule  // Import the chatbot library
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Bootstrap the application
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error('❌ Bootstrap Error:', err));
