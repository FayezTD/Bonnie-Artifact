// src/app/interfaces/chat.interfaces.ts

// ============================================================================
// ATTACHMENT INTERFACES
// ============================================================================

export interface ChatAttachment {
    name: string;
    type: 'file' | 'csv' | 'excel';
    url?: string;
    icon?: string;
    size?: string;
}

// ============================================================================
// FORM INTERFACES
// ============================================================================

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
    required?: boolean;
    placeholder?: string;
    options?: { value: any; label: string }[];
    validation?: any;
}

export interface ChatFormData {
    formId: string;
    title: string;
    description?: string;
    fields: FormField[];
    submitLabel?: string;
    cancelLabel?: string;
}

export interface FormSubmissionResult {
    formId: string;
    data: any;
    isValid: boolean;
}

// ============================================================================
// MESSAGE INTERFACES
// ============================================================================

export interface ChatMessage {
    id: string;
    message?: string;
    isUser: boolean;
    timestamp: Date;
    metricsQuery?: any[] | Record<string, any>; // Support both array and object formats
    tableData?: TableData;
    fileLink?: string;
    suggestions?: string[];
    hasForm?: boolean;
    formData?: any;
    attachments?: any[];
    hasGraph?: boolean;
    graphData?: any;
}

// ============================================================================
// TABLE INTERFACES
// ============================================================================

export interface TableData {
    headers: string[];
    rows: any[][];
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface ChatRequest {
    userMessage: string;
    userRole: 'Admin' | 'Regular';
    file?: File;
    agent?: string;
    userid?: string;
    model?: 'OpenAI' | 'Gemini';
}

export interface ChatRequestModel {
    userMessage: string;
    userRole: 'Admin' | 'Regular';
    file?: File;
    agent?: 'Audience Builder' | 'Loyalty Builder' | 'Rewards Builder';
    userid?: number;
    model?: 'OpenAI' | 'Gemini';
    formSubmission?: FormSubmissionResult;
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

export interface ChatResponse {
    message: string;
    rowsReturned?: number;
    metricsQuery: Object[];
    timestamp: Date;
    tableData?: {
        headers: string[];
        rows: string[][];
    };
    fileLink?: string;
    hasTableActions?: boolean;
    suggestions?: string[];
    matricsQuery?: Object[];
    hasForm?: boolean;
    formData?: ChatFormData;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface ChatApiHeaders {
    authorization: string;
}

// ============================================================================
// EXPORT INTERFACES
// ============================================================================

export interface ChatExportData {
    chatTitle: string;
    exportDate: string;
    messages: {
        sender: string;
        message: string;
        timestamp: string;
        attachments?: string[];
        tableData?: TableData;
        formData?: ChatFormData;
    }[];
}