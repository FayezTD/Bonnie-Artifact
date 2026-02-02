// src/app/parent-page/parent-page.component.ts

import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../chat/chat.component';
import { ChatRequestModel } from '../interfaces/chat.interfaces';
import { ChatService } from '../services/chat.services';

// ============================================================================
// INTERFACES
// ============================================================================

interface Model {
    id: string;
    name: string;
    description: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

@Component({
    selector: 'app-parent-page',
    standalone: true,
    imports: [CommonModule, ChatComponent, FormsModule],
    templateUrl: './parent-page.component.html',
    styleUrls: ['./parent-page.component.scss']
})
export class ParentPageComponent {
    // ============================================================================
    // BRAND INFORMATION
    // ============================================================================
    readonly brandInfo = {
        companyName: 'Kobie Alchemy',
        productName: 'Loyalty Cloud',
        version: '25.1.6.0',
        logoPath: 'assets/kobie-logo.png'
    };

    // ============================================================================
    // PROPERTIES
    // ============================================================================
    pageTitle = 'Customer Support Dashboard';
    chatTitle = 'Bonnie';

    // Authentication and User Role
    authToken = 'your-hardcoded-token-here';
    userRole: 'Admin' | 'Regular' = 'Admin';

    // Model Selection
    availableModels: Model[] = [
        {
            id: 'openai',
            name: 'OpenAI',
            description: 'GPT-powered AI model'
        },
        {
            id: 'gemini',
            name: 'Gemini',
            description: 'Google\'s advanced AI model'
        }
    ];

    selectedModel: Model | null = this.availableModels[0]; // Default to first model
    showModelDropdown: boolean = false;

    // ============================================================================
    // VIEW CHILD REFERENCES
    // ============================================================================
    @ViewChild(ChatComponent) chatComponent!: ChatComponent;

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(private chatService: ChatService) {
        // Component initialization
    }

    // ============================================================================
    // MODEL SELECTION METHODS
    // ============================================================================

    /**
     * Select a model from the dropdown
     */
    selectModel(model: Model): void {
        this.selectedModel = model;
        this.showModelDropdown = false;
        console.log('Model selected:', model);
    }

    /**
     * Reset model selection to default
     */
    resetModelSelection(): void {
        this.selectedModel = null;
        this.showModelDropdown = false;
        console.log('Model selection reset');
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Handle document clicks to close dropdowns
     */
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;

        // Close model dropdown if clicking outside
        if (!target.closest('.model-dropdown-container')) {
            this.showModelDropdown = false;
        }
    }

    /**
     * Handle new chat messages and enhance with model information
     */
    handleNewChatMessage(requestModel: ChatRequestModel): void {
        const enhancedRequestModel = {
            ...requestModel,
            model: this.selectedModel
        };

        console.log('Enhanced chat request:', enhancedRequestModel);
    }

    // ============================================================================
    // DASHBOARD HELPER METHODS
    // ============================================================================

    /**
     * Refresh dashboard data
     */
    refreshDashboard(): void {
        console.log('Dashboard refreshed');
    }

    /**
     * View all support tickets
     */
    viewAllTickets(): void {
        console.log('Viewing all tickets');
    }

    /**
     * Open application settings
     */
    openSettings(): void {
        console.log('Settings opened');
    }
}