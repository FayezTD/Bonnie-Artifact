# Bonnie AI Chat Assistant

A modern, feature-rich AI chat interface built with Angular 15.2.9, designed for loyalty marketing and customer engagement platforms.

## 🚀 Features

### Core Functionality
- **Real-time AI Chat** - Interactive conversation with Bonnie AI assistant
- **Smart Suggestions** - Context-aware suggestion buttons
- **KPI Metrics Display** - Expandable/collapsible metrics tables with tooltips
- **Export Capabilities** - PDF export with KPIs and chat history

### User Experience
- **Responsive Design** - Mobile-first approach with tablet and desktop optimization
- **Collapsible Interface** - Minimize/maximize chat window
- **Floating Action Button** - Quick access when minimized
- **Typing Indicators** - Visual feedback during AI processing
- **Processing Messages** - Rotating status messages during long operations
- **Scroll to Bottom** - Auto-scroll with manual override button
- **Message Actions** - Copy, read aloud, export, share, and regenerate

## 📋 Prerequisites

- Node.js 16+ and npm
- Angular CLI 15.2.8
- Modern browser with ES2020 support

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd bonnie-chat-assistant

# Install dependencies
npm install

# Start development server
ng serve

# Navigate to http://localhost:4200
```

## 📁 Project Structure

```
src/
├── app/
│   ├── chat/
│   │   ├── chat.component.ts        # Main chat component
│   │   ├── chat.component.html      # Chat template
│   │   └── chat.component.scss      # Chat styles
│   ├── components/
│   │   └── chat-form/               # Dynamic form component
│   ├── interfaces/
│   │   └── chat.interfaces.ts       # TypeScript interfaces
│   ├── services/
│   │   └── chat.service.ts          # Chat service (API & state)
│   └── parent-page/
│       ├── parent-page.component.ts # Parent container
│       ├── parent-page.component.html
│       └── parent-page.component.scss
└── assets/                          # Images and static files
```

## 🔧 Configuration

### API Configuration
Update the API endpoint in `chat.service.ts`:

```typescript
private readonly API_BASE_URL = 'http://your-api-url:port';
```

### Authentication
Set the auth token in `parent-page.component.ts`:

```typescript
authToken = 'your-auth-token-here';
```

### Branding
Update brand assets in `parent-page.component.html`:

```html
<img src="../../assets/your-logo.png" alt="Your Brand">
```

## 💬 Usage

### Basic Chat
```typescript
// Send a message
this.chatService.addMessage(
  'Hello, Bonnie!',
  true,  // isUser
  'OpenAI',  // model
  undefined,  // file
  'Audience Builder',  // agent
  'Admin'  // userRole
);
```

### Start New Chat
```typescript
this.chatService.startNewChat();
```

### Export Chat to PDF
```typescript
this.chatComponent.exportChatToPDF();
```

## 🎨 Customization

### Colors
Primary colors are defined in SCSS variables:

```scss
$primary-orange: #fd7e4f;
$primary-purple: #8b7cd8;
$suggestion-color: #5461C8;
```

### Features
Toggle features via template conditionals:

```html
<!-- Enable/disable PDF export -->
<button *ngIf="enableExport" (click)="exportChatToPDF()">
  Export PDF
</button>
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

## 🧪 Build & Development

```bash
# Run development server
ng serve
# Navigate to http://localhost:4200

# Build for production
ng build

# Build and watch for changes
ng build --watch --configuration development

# Lint the code
ng lint

# Generate documentation
npm run compodoc
```

## 📦 Dependencies

### Core
- **Angular**: 15.2.9
- **RxJS**: 7.8.1
- **TypeScript**: 4.9.5
- **Zone.js**: ~0.11.4

### UI & Styling
- **Angular Material**: 15.2.9
- **Bootstrap**: 4.3.1
- **ngx-bootstrap**: ^10.3.0
- **Sass**: ^1.68.0

### PDF Generation
- **pdfmake**: ^0.2.21
- **@types/pdfmake**: ^0.2.12

### Charts & Visualization
- **chart.js**: ^4.4.1
- **ng2-charts**: ^4.1.1

### Utilities
- **moment**: ^2.29.4
- **date-fns**: ^2.30.0
- **lodash-es**: ^4.17.15


## 🐛 Troubleshooting

### Chat not loading
- Check API endpoint configuration
- Verify CORS settings on backend
- Check browser console for errors

### PDF export failing
- Ensure pdfmake is properly installed: `npm install pdfmake @types/pdfmake`
- Check for large data volumes (>100 messages)
- Verify font configuration in vfs_fonts

### Styles not applying
- Clear browser cache
- Check SCSS compilation
- Verify Angular styles configuration in `angular.json`

<!-- ## 👥 Contributors -->
