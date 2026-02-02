import { Component, OnInit } from '@angular/core';
import { ChatService, ChatRequestModel } from 'kobie-loyalty-chatbot';

@Component({
  selector: 'app-root',
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Kobie Loyalty Chatbot - Demo</h1>
      <p>The chatbot should appear in the bottom-right corner of the screen.</p>
      
      <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h2>Test Controls</h2>
        <button (click)="clearChat()" style="margin: 5px; padding: 10px 20px;">Clear Chat</button>
        <button (click)="getMessages()" style="margin: 5px; padding: 10px 20px;">Log Messages</button>
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
  `,
  styles: [`
    h1 { color: #333; }
    button {
      background: #5461C8;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      background: #fd7e4f;
    }
  `]
})
export class AppComponent implements OnInit {
  
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    console.log('✅ Kobie Chatbot Demo Started');
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
