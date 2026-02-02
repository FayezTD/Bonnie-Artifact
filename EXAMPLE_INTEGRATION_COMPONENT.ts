import { Component, OnInit } from '@angular/core';
import { ChatService, ChatRequestModel } from 'kobie-loyalty-chatbot';

/**
 * Example Angular Component showing how to integrate
 * the Kobie Loyalty Chatbot library
 * 
 * This is a complete working example that can be used
 * in any Angular application.
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  // ===========================================================================
  // PROPERTIES
  // ===========================================================================
  
  title = 'Kobie Website';
  
  // Chatbot Configuration
  chatTitle = 'Bonnie';
  authToken = 'your-auth-token-here';
  userRole: 'Admin' | 'Regular' = 'Admin';
  userid = 'demo-user-12345';  // Unique user identifier
  username = 'Demo User';
  selectedModel: 'OpenAI' | 'Gemini' = 'OpenAI';
  chatDisabled = false;

  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================
  
  constructor(private chatService: ChatService) {}

  // ===========================================================================
  // LIFECYCLE HOOKS
  // ===========================================================================
  
  ngOnInit(): void {
    this.configureChatService();
  }

  // ===========================================================================
  // CONFIGURATION METHODS
  // ===========================================================================
  
  /**
   * Configure the chat service with your API settings
   */
  private configureChatService(): void {
    // Set your API endpoint
    // Replace with your actual API URL
    this.chatService.updateApiUrl('http://34.203.230.190:8001');
    
    // Optional: Update authentication token
    this.chatService.updateAuthToken(`Bearer ${this.authToken}`);
    
    console.log('✅ Chat service configured successfully');
  }

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================
  
  /**
   * Handle messages sent from the chatbot
   * You can use this to track analytics, log events, etc.
   */
  onMessageEvent(request: ChatRequestModel): void {
    console.group('📨 Message Event');
    console.log('User Message:', request.userMessage);
    console.log('User Role:', request.userRole);
    console.log('Agent:', request.agent);
    console.log('Model:', request.model);
    console.groupEnd();

    // Example: Send analytics event
    this.trackChatAnalytics(request);
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================
  
  /**
   * Example: Track chat analytics
   */
  private trackChatAnalytics(request: ChatRequestModel): void {
    // You can integrate with your analytics platform here
    // Example: Google Analytics, Mixpanel, etc.
    
    // window.gtag('event', 'chat_message', {
    //   'event_category': 'engagement',
    //   'event_label': request.agent || 'general',
    //   'value': 1
    // });
  }

  /**
   * Example: Programmatically clear the chat
   */
  clearChat(): void {
    this.chatService.startNewChat();
    console.log('🧹 Chat cleared');
  }

  /**
   * Example: Get current chat messages
   */
  getMessages(): void {
    const messages = this.chatService.getCurrentMessages();
    console.log('📝 Current messages:', messages);
  }

  /**
   * Example: Toggle chat on/off
   */
  toggleChat(): void {
    this.chatDisabled = !this.chatDisabled;
    console.log(`💬 Chat ${this.chatDisabled ? 'disabled' : 'enabled'}`);
  }
}
