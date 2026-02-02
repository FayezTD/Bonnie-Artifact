# Kobie Loyalty Chatbot

<div align="center">
  <img src="./src/lib/assets/bonnie-avatar.png" alt="Bonnie AI Assistant" width="150"/>
  <h3>AI-Powered Customer Support for Loyalty Marketing</h3>
  <p>A comprehensive Angular library featuring the Bonnie AI Assistant chatbot</p>
</div>

---

## 🌟 Features

- **Real-time Chat Interface** - Beautiful, responsive chat UI with typing indicators
- **KPI Metrics Display** - Interactive tables with exportable metrics
- **PDF Export** - Export complete chat transcripts with metrics
- **CSV Export** - Download metrics and data in CSV format
- **Form Handling** - Dynamic forms with validation
- **Suggestions** - Smart action suggestions for users
- **Read Aloud** - Text-to-speech functionality
- **Animations** - Smooth animations and transitions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Customizable** - Easy to configure and style

---

## 📦 Installation

### NPM
```bash
npm install kobie-loyalty-chatbot
```

### Yarn
```bash
yarn add kobie-loyalty-chatbot
```

---

## 🚀 Quick Start

### 1. Import the Module

In your Angular application's `app.module.ts` or component:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

// Import the Kobie Loyalty Chatbot Module
import { KobieLoyaltyChatbotModule } from 'kobie-loyalty-chatbot';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,  // Required for API calls
    KobieLoyaltyChatbotModule  // Import the chatbot module
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Add the Component

In your template file (e.g., `app.component.html`):

```html
<klc-chat
  [title]="'Bonnie'"
  [authToken]="authToken"
  [userRole]="'Admin'"
  [userid]="'user123'"
  [username]="'John Doe'"
  [selectedModel]="'OpenAI'"
  (messageEvent)="onMessageEvent($event)">
</klc-chat>
```

### 3. Configure in Component

In your component file (e.g., `app.component.ts`):

```typescript
import { Component } from '@angular/core';
import { ChatRequestModel } from 'kobie-loyalty-chatbot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  authToken = 'your-auth-token';

  onMessageEvent(request: ChatRequestModel) {
    console.log('Message sent:', request);
  }
}
```

---

## 🎨 Component API

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `'Bonnie'` | Chatbot title displayed in header |
| `authToken` | `string` | `''` | Authentication token for API calls |
| `userRole` | `'Admin' \| 'Regular'` | `'Regular'` | User role for permissions |
| `disabled` | `boolean` | `false` | Disable chat input |
| `userid` | `string` | `''` | Unique user identifier |
| `selectedModel` | `'OpenAI' \| 'Gemini'` | `undefined` | AI model selection |
| `username` | `string` | `undefined` | Display name for user |

### Output Events

| Event | Type | Description |
|-------|------|-------------|
| `messageEvent` | `EventEmitter<ChatRequestModel>` | Emitted when user sends a message |

---

## 🔧 Configuration

### API Configuration

Configure the API endpoint using the `ChatService`:

```typescript
import { Component, OnInit } from '@angular/core';
import { ChatService } from 'kobie-loyalty-chatbot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // Update API base URL
    this.chatService.updateApiUrl('https://your-api-endpoint.com');
    
    // Update auth token
    this.chatService.updateAuthToken('Bearer your-token-here');
  }
}
```

---

## 🎨 Styling

The chatbot comes with complete styling. If you need to customize:

### Override CSS Variables

```css
:root {
  --chatbot-primary-color: #fd7e4f;
  --chatbot-secondary-color: #5461C8;
  --chatbot-background: #ffffff;
}
```

### Custom Styles

You can override specific components by targeting the library classes:

```scss
// In your global styles.scss
klc-chat {
  .chat-container {
    border-radius: 16px;
  }
  
  .chat-header {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
  }
}
```

---

## 📚 Advanced Usage

### Using Standalone Component

If you prefer standalone components (Angular 14+):

```typescript
import { Component } from '@angular/core';
import { ChatComponent } from 'kobie-loyalty-chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent],
  template: `<klc-chat [userid]="'user123'"></klc-chat>`
})
export class AppComponent { }
```

### Handling Chat Events

```typescript
import { Component } from '@angular/core';
import { ChatRequestModel } from 'kobie-loyalty-chatbot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  
  onMessageEvent(request: ChatRequestModel) {
    console.log('User message:', request.userMessage);
    console.log('User role:', request.userRole);
    console.log('Selected agent:', request.agent);
    console.log('Model:', request.model);
    
    // You can process the request here
    // Send analytics, log to your system, etc.
  }
}
```

### Accessing Chat Service

```typescript
import { Component } from '@angular/core';
import { ChatService } from 'kobie-loyalty-chatbot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  
  constructor(private chatService: ChatService) {}

  clearChat() {
    this.chatService.startNewChat();
  }

  getCurrentMessages() {
    return this.chatService.getCurrentMessages();
  }
}
```

---

## 📱 Features in Detail

### PDF Export
Users can export the entire chat conversation including:
- Message history
- KPI metrics in formatted tables
- Timestamps
- User and bot messages

### KPI Metrics
- Display key performance indicators
- Interactive expandable tables
- Hover tooltips with metric definitions
- Export to CSV

### Form Handling
- Dynamic form generation
- Built-in validation
- Error messages
- Form submission handling

### Suggestions
- Smart contextual suggestions
- Click to send
- Animated appearance

---

## 🔒 Requirements

- **Angular**: ^15.0.0
- **TypeScript**: ^4.9.0
- **RxJS**: ^7.0.0
- **pdfMake**: ^0.2.0 (for PDF export)

---

## 🐛 Troubleshooting

### Assets not loading

If images don't appear, ensure you've configured your angular.json to include library assets:

```json
{
  "assets": [
    "src/favicon.ico",
    "src/assets",
    {
      "glob": "**/*",
      "input": "./node_modules/kobie-loyalty-chatbot/assets",
      "output": "/assets/"
    }
  ]
}
```

### CORS Issues

Ensure your API server allows requests from your domain:

```typescript
// Configure API URL
this.chatService.updateApiUrl('https://your-cors-enabled-api.com');
```

---

## 📄 License

MIT License - feel free to use in your projects

---

## 🤝 Support

For issues, questions, or contributions, please contact the Kobie development team.

---

## 📸 Screenshots

<div align="center">
  <img src="./docs/screenshots/chat-interface.png" alt="Chat Interface" width="600"/>
  <p><em>Beautiful chat interface with Bonnie AI Assistant</em></p>
</div>

---

## 🎯 Version History

### 1.0.0 (Current)
- Initial release
- Complete chat interface
- KPI metrics display and export
- PDF export functionality
- Form handling
- Responsive design
- TypeScript support

---

**Made with ❤️ by Kobie**
