/**
 * Environment Configuration for Kobie Loyalty Chatbot Library
 * 
 * This can be overridden by the host application by calling ChatService.updateApiUrl()
 */

export interface LibraryEnvironment {
    production: boolean;
    apiBaseUrl: string;
}

export const defaultEnvironment: LibraryEnvironment = {
    production: false,
    apiBaseUrl: 'http://34.203.230.190:8001' // Default API URL
};
