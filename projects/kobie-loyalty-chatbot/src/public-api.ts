/*
 * Public API Surface of kobie-loyalty-chatbot
 * 
 * This library provides a comprehensive chatbot component for Kobie's Loyalty Marketing platform.
 * Features include:
 * - Real-time chat interface with AI assistant "Bonnie"
 * - KPI metrics display and export
 * - Form handling and validation
 * - PDF export functionality
 * - Responsive design with animations
 * - Typing indicators and suggestions
 */

// ============================================================================
// MODULE EXPORT
// ============================================================================
export * from './lib/kobie-loyalty-chatbot.module';

// ============================================================================
// COMPONENTS
// ============================================================================
export * from './lib/components/chat/chat.component';
export * from './lib/components/chat-form/chat-form.component';

// ============================================================================
// SERVICES
// ============================================================================
export * from './lib/services/chat.services';

// ============================================================================
// INTERFACES
// ============================================================================
export * from './lib/interfaces/chat.interfaces';
