// src/app/services/chat.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ChatAttachment,
  ChatMessage,
  ChatRequest,
  ChatResponse
} from '../interfaces/chat.interfaces';

// ============================================================================
// SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // ============================================================================
  // PROPERTIES
  // ============================================================================

  // Message State Management
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // API Configuration
  private authToken = 'Bearer mock-jwt-token-123456789';
  private readonly API_BASE_URL = environment.apiBaseUrl;

  // API Endpoints
  private readonly ENDPOINTS = {
    CHAT: `${this.API_BASE_URL}/api/run-cortex-agent`,
    CLEAR_CHAT: `${this.API_BASE_URL}/api/clear_chat`
  };

  // UUID Management
  private readonly UUID_KEY = 'chat_uuid';

  // Default Welcome Suggestions
  private readonly DEFAULT_SUGGESTIONS = [
    'What can you do for me?',
    'Suggest some segmentation strategies',
    'Suggest some audience building strategies',
  ];

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(private http: HttpClient) {
    this.initializeChat();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize chat with welcome message and suggestions
   */
  private initializeChat(): void {
    const initialMessage: ChatMessage = {
      id: '1',
      message: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      suggestions: this.DEFAULT_SUGGESTIONS
    };
    this.messagesSubject.next([initialMessage]);
  }

  // ============================================================================
  // UUID MANAGEMENT
  // ============================================================================

  /**
   * Generate a unique UUID (10-digit format)
   */
  private generateUUID(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(6)); // 48 bits
    let value = 0n;
    for (const b of bytes) {
      value = (value << 8n) + BigInt(b);
    }

    const id = (value % 10_000_000_000n).toString().padStart(10, "0");
    return id;
  }

  /**
   * Get current UUID from sessionStorage, or create if missing
   */
  private getUUID(): string {
    let uuid = sessionStorage.getItem(this.UUID_KEY);
    if (!uuid) {
      uuid = this.generateUUID();
      sessionStorage.setItem(this.UUID_KEY, uuid);
    }
    return uuid;
  }

  /**
   * Reset UUID and create a new one
   */
  private resetUUID(): void {
    const newUuid = this.generateUUID();
    sessionStorage.setItem(this.UUID_KEY, newUuid);
  }

  // ============================================================================
  // CHAT SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start a new chat: clear backend context, reset messages and create fresh UUID
   */
  public startNewChat(): void {
    const currentUuid = this.getUUID();
    this.clearMessages(currentUuid, true);
  }

  /**
   * Clear messages from UI and backend, optionally reset UUID
   */
  clearMessages(userId?: string, shouldResetUuid: boolean = false): void {
    if (userId) {
      this.clearChat(userId).subscribe({
        next: () => this.resetChatState(shouldResetUuid),
        error: (error) => {
          console.error('Failed to clear context via API:', error);
          this.resetChatState(shouldResetUuid);
        }
      });
    } else {
      this.resetChatState(shouldResetUuid);
    }
  }

  /**
   * Reset chat state with welcome message
   */
  private resetChatState(shouldResetUuid: boolean): void {
    // Clear existing messages
    this.messagesSubject.next([]);

    // Reset UUID if requested
    if (shouldResetUuid) {
      this.resetUUID();
    }

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      message: "Hello! I'm your AI assistant, Bonnie. What can I help you with?",
      isUser: false,
      timestamp: new Date(),
      suggestions: this.DEFAULT_SUGGESTIONS
    };

    this.messagesSubject.next([welcomeMessage]);
  }

  // ============================================================================
  // MESSAGE MANAGEMENT
  // ============================================================================

  /**
   * Add a new message to the chat
   */
  addMessage(
    message: string,
    isUser: boolean,
    model: 'OpenAI' | 'Gemini' = 'OpenAI',
    file?: File,
    agent?: string,
    userRole: 'Admin' | 'Regular' = 'Regular'
  ): void {
    const currentMessages = this.messagesSubject.getValue();

    // Create new message with attachments if applicable
    const newMessage: ChatMessage = {
      id: this.generateId(),
      message,
      isUser,
      timestamp: new Date(),
      attachments: this.createAttachments(file, isUser)
    };

    this.messagesSubject.next([...currentMessages, newMessage]);

    // Process user messages with API call
    if (isUser) {
      this.processUserMessage(message, model, file, agent, userRole);
    }
  }

  /**
   * Create attachments array from file
   */
  private createAttachments(file?: File, isUser?: boolean): ChatAttachment[] | undefined {
    if (!file || !isUser) {
      return undefined;
    }

    const attachments: ChatAttachment[] = [{
      name: file.name,
      type: file.name.endsWith('.csv') ? 'csv' : 'excel',
      icon: '📊',
      size: this.formatFileSize(file.size)
    }];

    return attachments.length > 0 ? attachments : undefined;
  }

  /**
   * Process user message and make API call
   */
  private processUserMessage(
    message: string,
    model: 'OpenAI' | 'Gemini',
    file?: File,
    agent?: string,
    userRole: 'Admin' | 'Regular' = 'Regular'
  ): void {
    const uuid = this.getUUID();
    const request: ChatRequest = {
      userMessage: message,
      userRole,
      file: file,
      agent: agent || "Audience Builder",
      userid: uuid,
      model: model
    };

    this.makeApiCall(request).subscribe({
      next: (response) => this.handleApiSuccess(response),
      error: (error) => this.handleApiError(error)
    });
  }

  /**
   * Handle successful API response
   */
  private handleApiSuccess(response: ChatResponse): void {
    const botMessage: ChatMessage = {
      id: this.generateId(),
      message: response.message,
      isUser: false,
      timestamp: new Date(),
      tableData: response.tableData,
      fileLink: response.fileLink,
      suggestions: response.suggestions,
      metricsQuery: response.metricsQuery,
      hasForm: response.hasForm,
      formData: response.formData
    };

    const updatedMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...updatedMessages, botMessage]);
  }

  /**
   * Handle API error
   */
  private handleApiError(error: any): void {
    console.error('API call failed:', error);

    const errorMessage: ChatMessage = {
      id: this.generateId(),
      message: 'Sorry, I encountered an error while processing your request. Please try again.',
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        'Try again',
        'Check connection',
        'Contact support'
      ]
    };

    const updatedMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...updatedMessages, errorMessage]);
  }

  /**
   * Get current messages from state
   */
  getCurrentMessages(): ChatMessage[] {
    return this.messagesSubject.getValue();
  }

  // ============================================================================
  // API METHODS
  // ============================================================================

  /**
   * Make API call to chat endpoint
   */
  private makeApiCall(request: ChatRequest): Observable<ChatResponse> {
    const headers = this.createHeaders();
    const requestBody = this.createRequestBody(request);

    return this.http.post<any>(this.ENDPOINTS.CHAT, requestBody, { headers }).pipe(
      catchError(error => this.handleHttpError(error))
    );
  }

  /**
   * Clear chat context on backend
   */
  private clearChat(userId: string): Observable<any> {
    const headers = this.createHeaders();
    const requestBody = {
      clear: "True",
      userId: userId
    };

    return this.http.post(this.ENDPOINTS.CLEAR_CHAT, requestBody, { headers }).pipe(
      catchError(error => {
        console.error('❌ Error calling clear chat API:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  /**
   * Create HTTP headers
   */
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
      // 'Authorization': this.authToken (add when needed)
    });
  }

  /**
   * Create request body for API call
   */
  private createRequestBody(request: ChatRequest): any {
    return {
      userMessage: request.userMessage,
      userRole: request.userRole,
      file: request.file,
      agent: request.agent,
      userId: request.userid?.toString(),
      model: request.model
    };
  }

  /**
   * Handle HTTP errors with detailed logging
   */
  private handleHttpError(error: any): Observable<never> {
    console.error('❌ HTTP Error occurred:', error);
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      url: error.url
    });

    // Specific error logging
    if (error.status === 0) {
      console.error('🔌 Network error - API server might be down');
    } else if (error.status === 404) {
      console.error('🔍 API endpoint not found');
    } else if (error.status >= 500) {
      console.error('🚨 Server error');
    }

    return throwError(() => error);
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  /**
   * Update authentication token
   */
  updateAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Update API base URL and endpoints
   */
  updateApiUrl(baseUrl: string): void {
    const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Update endpoints dynamically
    Object.defineProperty(this.ENDPOINTS, 'CHAT', {
      value: `${cleanUrl}/api/run-cortex-agent`,
      writable: true,
      configurable: true
    });

    Object.defineProperty(this.ENDPOINTS, 'CLEAR_CHAT', {
      value: `${cleanUrl}/api/clear_chat`,
      writable: true,
      configurable: true
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Format file size to human-readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}