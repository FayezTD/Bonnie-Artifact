// src/app/chat/chat.component.ts

import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatFormComponent } from '../components/chat-form/chat-form.component';
import {
    ChatApiHeaders,
    ChatMessage,
    ChatRequestModel,
    FormSubmissionResult,
    TableData
} from '../interfaces/chat.interfaces';
import { ChatService } from '../services/chat.services';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, ChatFormComponent],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
    // ============================================================================
    // INPUT PROPERTIES
    // ============================================================================
    @Input() title: string = 'Bonnie';
    @Input() authToken: string = '';
    @Input() userRole: 'Admin' | 'Regular' = 'Regular';
    @Input() disabled: boolean = false;
    @Input() userid: string = 'avhyfvkuy';
    @Input() selectedModel: 'OpenAI' | 'Gemini' | undefined;
    @Input() username: string | undefined;

    // ============================================================================
    // OUTPUT EVENTS
    // ============================================================================
    @Output() messageEvent = new EventEmitter<ChatRequestModel>();

    // ============================================================================
    // VIEW CHILD REFERENCES
    // ============================================================================
    @ViewChild('messagesContainer') private messagesContainerRef!: ElementRef;

    // ============================================================================
    // CORE PROPERTIES
    // ============================================================================
    messages: ChatMessage[] = [];
    newMessage: string = '';
    isTyping: boolean = false;

    // ============================================================================
    // UI STATE
    // ============================================================================
    showToolsDropdown: boolean = false;
    showAttachDropdown: boolean = false;
    isRecording: boolean = false;
    isMaximized: boolean = false;
    isCollapsed: boolean = false;
    hasUnreadMessages: boolean = false;
    unreadCount: number = 0;
    subtitle: string = 'Loyalty Marketing AI Assistant';
    showScrollButton: boolean = false;
    showTypingIndicator: boolean = false;

    // ============================================================================
    // PROCESSING STATE
    // ============================================================================
    private processingTimeout: any;
    showProcessingMessage: boolean = false;
    private processingTimeoutDuration = 5000; // 5 seconds
    private processingMessages: string[] = [
        'Please wait, we are gathering the data',
        'We are calculating the KPIs',
        'Building the audience segments',
        'Analyzing customer patterns',
        'Generating insights and recommendations'
    ];
    currentProcessingMessageIndex: number = 0;
    processingMessageInterval: any;

    // ============================================================================
    // REQUEST MODEL PROPERTIES
    // ============================================================================
    selectedFile: File | undefined;
    selectedAgent: 'Audience Builder' | 'Loyalty Builder' | 'Rewards Builder' | undefined;
    selectedAgentDisplay: string = 'Tools';

    // ============================================================================
    // ACTION PROPERTIES
    // ============================================================================
    showMoreActions: { [key: string]: boolean } = {};
    speechSynthesis: SpeechSynthesis | null = null;
    currentUtterance: SpeechSynthesisUtterance | null = null;
    actionFeedback: { [key: string]: string } = {};
    copiedMessages: Set<string> = new Set();
    showMetrics: { [messageId: string]: boolean } = {};

    // ============================================================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================================================
    private messagesSubscription: Subscription = new Subscription();
    private shouldScroll: boolean = false;
    private scrollTimeout: any;

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(
        private chatService: ChatService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        // Initialize speech synthesis if available
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
        }
    }

    // ============================================================================
    // LIFECYCLE HOOKS
    // ============================================================================
    ngOnInit(): void {
        this.initializeChat();
        this.subscribeToMessages();
        this.setupRefreshHandling();
        this.isCollapsed = true;
        this.hasUnreadMessages = true;
        this.unreadCount = 0;
    }

    ngOnDestroy(): void {
        this.messagesSubscription.unsubscribe();
        this.stopReading();
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        if (this.processingTimeout) {
            clearTimeout(this.processingTimeout);
            this.processingTimeout = null;
        }

        this.stopProcessingMessageRotation();
    }

    ngAfterViewChecked(): void {
        if (this.shouldScroll) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement;
        if (
            !target.closest('.tools-dropdown-container') &&
            !target.closest('.attach-dropdown-container') &&
            !target.closest('.more-actions-container')
        ) {
            this.closeDropdowns();
            this.closeAllMoreActions();
        }
    }

    // ============================================================================
    // TOGGLE METHODS
    // ============================================================================
    toggleCollapsed(): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        this.isCollapsed = !this.isCollapsed;

        if (!this.isCollapsed) {
            this.hasUnreadMessages = false;
            this.unreadCount = 0;

            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        }
    }

    toggleMetrics(id: string): void {
        this.showMetrics[id] = !this.showMetrics[id];
    }

    toggleToolsDropdown(): void {
        this.showToolsDropdown = !this.showToolsDropdown;
        this.showAttachDropdown = false;
    }

    toggleAttachDropdown(): void {
        this.showAttachDropdown = !this.showAttachDropdown;
        this.showToolsDropdown = false;
    }

    toggleMaximized(): void {
        this.isMaximized = !this.isMaximized;
        if (!this.isMaximized) {
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        }
    }

    toggleMoreActions(messageId: string): void {
        Object.keys(this.showMoreActions).forEach(id => {
            if (id !== messageId) {
                this.showMoreActions[id] = false;
            }
        });

        this.showMoreActions[messageId] = !this.showMoreActions[messageId];
        this.closeDropdowns();
    }

    toggleReadAloud(message: ChatMessage): void {
        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.stopReading();
        } else {
            this.readMessageAloud(message);
        }
    }

    // ============================================================================
    // PROCESSING MESSAGE ROTATION
    // ============================================================================
    private startProcessingMessageRotation(): void {
        this.currentProcessingMessageIndex = 0;
        this.processingMessageInterval = setInterval(() => {
            this.currentProcessingMessageIndex =
                (this.currentProcessingMessageIndex + 1) % this.processingMessages.length;
            this.cdr.markForCheck();
        }, 1500);
    }

    private stopProcessingMessageRotation(): void {
        if (this.processingMessageInterval) {
            clearInterval(this.processingMessageInterval);
            this.processingMessageInterval = null;
        }
        this.currentProcessingMessageIndex = 0;
    }

    getCurrentProcessingMessage(): string {
        return this.processingMessages[this.currentProcessingMessageIndex];
    }

    // ============================================================================
    // MESSAGE HANDLING
    // ============================================================================
    sendMessage(): void {
        if (this.disabled) {
            console.warn('Chat is disabled - user must be selected');
            return;
        }

        if (!this.isValidMessage()) return;

        // Remove suggestions from previous messages
        if (this.newMessage.trim()) {
            this.messages.forEach(msg => {
                if (!msg.isUser && msg.suggestions) {
                    msg.suggestions = [];
                }
            });
        }

        const requestModel = this.createRequestModel();

        // Clear any existing timeout before starting new one
        if (this.processingTimeout) {
            clearTimeout(this.processingTimeout);
            this.processingTimeout = null;
        }

        // Stop any existing message rotation
        this.stopProcessingMessageRotation();

        // Show loading indicator immediately
        this.showTypingIndicator = true;
        this.isTyping = true;
        this.showProcessingMessage = false;
        this.currentProcessingMessageIndex = 0;

        // Start processing timeout (show message after 5 seconds)
        this.processingTimeout = setTimeout(() => {
            this.showProcessingMessage = true;
            this.startProcessingMessageRotation();
            this.cdr.markForCheck();
        }, this.processingTimeoutDuration);

        this.resetInputState();
        this.emitMessageEvent(requestModel);
        this.sendToService(requestModel);
    }

    onResponseReceived(response: any): void {
        // Clear processing timeout and message
        if (this.processingTimeout) {
            clearTimeout(this.processingTimeout);
        }
        this.showProcessingMessage = false;
        this.stopProcessingMessageRotation();

        this.showTypingIndicator = false;
        this.isTyping = false;

        // Process response and add to messages
        const newMessage: ChatMessage = {
            id: this.generateMessageId(),
            message: response.text || '',
            isUser: false,
            timestamp: new Date(),
            metricsQuery: response.metrics,
            suggestions: response.suggestions,
            hasGraph: response.hasGraph || false
        };

        this.messages.push(newMessage);

        // Auto-expand if message has graph
        if (newMessage.hasGraph && !this.isMaximized) {
            this.toggleMaximized();
        }

        this.shouldScroll = true;
        this.scrollToBottom();
    }

    markMessagesAsRead(): void {
        this.hasUnreadMessages = false;
        this.unreadCount = 0;
    }

    onNewMessageReceived(): void {
        if (this.isCollapsed) {
            this.hasUnreadMessages = true;
            this.unreadCount++;
        }
        this.shouldScroll = true;
    }

    onSuggestionClick(suggestion: string, messageId?: string): void {
        this.newMessage = suggestion;
        this.sendMessage();
        if (messageId) {
            const message = this.messages.find(m => m.id === messageId);
            if (message) {
                message.suggestions = [];
            }
        }
    }

    // ============================================================================
    // TOOL AND FILE HANDLING
    // ============================================================================
    onToolSelect(tool: string): void {
        this.closeDropdowns();
        this.setSelectedAgent(tool);
        this.handleToolSelection(tool);
    }

    onAttachSelect(type: string): void {
        this.closeDropdowns();
        this.handleFileUpload(type);
    }

    onMicRecord(): void {
        // To be implemented
    }

    onVoiceRecord(): void {
        this.isRecording = !this.isRecording;
    }

    deselectAgent(): void {
        this.selectedAgent = undefined;
        this.selectedAgentDisplay = 'Tools';
    }

    // ============================================================================
    // METRICS HANDLING
    // ============================================================================
    isMetricsObject(metricsQuery: any): boolean {
        return metricsQuery && typeof metricsQuery === 'object' && !Array.isArray(metricsQuery);
    }

    getMetricsObjectEntries(metricsQuery: any): Array<{ key: string; value: string }> {
        if (!this.isMetricsObject(metricsQuery)) {
            return [];
        }
        return Object.entries(metricsQuery).map(([key, value]) => ({
            key,
            value: String(value)
        }));
    }

    formatMetricKey(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    getValidMetricsArray(metricsQuery: any[]): Array<{ key: string; value: any }> {
        if (!metricsQuery || metricsQuery.length === 0) return [];

        const metricsObject = metricsQuery[0];
        return Object.entries(metricsObject)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => ({ key, value }));
    }

    hasValidMetrics(metricsQuery: any[] | undefined): boolean {
        if (!metricsQuery?.length) return false;

        const metrics = metricsQuery[0] || {};
        return Object.values(metrics).some(value => value !== null && value !== undefined);
    }

    getKpiDefinition(key: string): string {
        const normalizeKey = (str: string): string => {
            return str.toLowerCase().replace(/[^a-z0-9]/g, '');
        };

        const definitions = new Map([
            ['totalmembers', 'The total number of enrolled members in your loyalty program'],
            ['totalspend', 'The cumulative amount of money spent by all members across all transactions'],
            ['spendpermember', 'The average amount of money spent per member (Total Spend divided by Total Members)'],
            ['transactionspermember', 'The average number of transactions completed per member'],
            ['averagespendpertransaction', 'The average dollar amount spent in each individual transaction'],
            ['averageredemptionspermember', 'The average number of loyalty point redemptions per member'],
            ['pointsearnedandbalance', 'The net points balance across all members (points earned minus points redeemed)'],
            ['daystofirstredemption', 'The average number of days from member enrollment to their first points redemption'],
            ['dayssincelasttransaction', 'The average number of days since members last made a purchase']
        ]);

        const normalizedKey = normalizeKey(key);
        return definitions.get(normalizedKey) || `Definition not available for this metric: "${key}"`;
    }

    getMetricsArray(metricsObject: any): Array<{ key: string; value: any }> {
        if (!metricsObject) return [];

        return Object.keys(metricsObject).map(key => ({
            key: this.formatMetricLabel(key),
            value: metricsObject[key]
        }));
    }

    formatMetricLabel(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim();
    }

    formatMetricValue(value: any): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }

        if (typeof value === 'number') {
            if (value % 1 !== 0) {
                return value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 20
                });
            } else {
                return value.toLocaleString('en-US');
            }
        }

        if (typeof value === 'string') {
            const currencyRegex = /^([$£€¥₹])\s*([0-9,.-]+)\s*(.*)$/;
            const suffixRegex = /^([0-9,.-]+)\s*([a-zA-Z%]+.*?)$/;

            const currencyMatch = value.match(currencyRegex);
            if (currencyMatch) {
                const [, symbol, numberPart, suffix] = currencyMatch;
                const numericValue = parseFloat(numberPart.replace(/,/g, ''));
                if (!isNaN(numericValue) && isFinite(numericValue)) {
                    const formattedNumber = this.formatMetricValue(numericValue);
                    return `${symbol}${formattedNumber}${suffix ? ' ' + suffix : ''}`;
                }
            }

            const suffixMatch = value.match(suffixRegex);
            if (suffixMatch) {
                const [, numberPart, suffix] = suffixMatch;
                const numericValue = parseFloat(numberPart.replace(/,/g, ''));
                if (!isNaN(numericValue) && isFinite(numericValue)) {
                    const formattedNumber = this.formatMetricValue(numericValue);
                    return `${formattedNumber} ${suffix}`;
                }
            }

            const numericValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(numericValue) && isFinite(numericValue)) {
                return this.formatMetricValue(numericValue);
            }

            return value;
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return String(value);
    }

    // ============================================================================
    // EXPORT FUNCTIONALITY
    // ============================================================================
    exportChatToPDF(): void {
        try {
            const docContent: any[] = [];

            // Add header with brand color
            docContent.push({
                text: 'Chat Transcript - Bonnie AI Assistant',
                fontSize: 20,
                bold: true,
                margin: [0, 0, 0, 10],
                color: '#fd7e4f',
            });

            // Add generation timestamp
            docContent.push({
                text: `Generated on ${new Date().toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                })}`,
                fontSize: 9,
                color: '#666',
                margin: [0, 0, 0, 20],
            });

            // Add separator line
            docContent.push({
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 515,
                        y2: 0,
                        lineWidth: 1,
                        lineColor: '#e5e7eb'
                    }
                ],
                margin: [0, 0, 0, 20]
            });

            // Process each message
            this.messages.forEach((msg, index) => {
                // Add message number
                docContent.push({
                    text: `Message ${index + 1}`,
                    fontSize: 10,
                    bold: true,
                    color: '#666',
                    margin: [0, 10, 0, 5],
                });

                // Add sender label
                const senderLabel = msg.isUser ? (this.username || 'You') : 'Bonnie AI';

                docContent.push({
                    text: senderLabel,
                    fontSize: 11,
                    bold: true,
                    color: msg.isUser ? '#5461C8' : '#fd7e4f',
                    margin: [0, 0, 0, 5],
                });

                // Add message content
                if (msg.message) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = msg.message;
                    const cleanText = tempDiv.textContent || tempDiv.innerText || '';

                    docContent.push({
                        text: cleanText,
                        fontSize: 10,
                        margin: [10, 0, 10, 5],
                        color: '#374151',
                        lineHeight: 1.4,
                    });
                }

                // Add metrics if available (new object format)
                if (msg.metricsQuery && this.isMetricsObject(msg.metricsQuery)) {
                    const entries = this.getMetricsObjectEntries(msg.metricsQuery);

                    if (entries.length > 0) {
                        docContent.push({
                            text: 'Key Performance Indicators',
                            fontSize: 11,
                            bold: true,
                            margin: [10, 10, 10, 5],
                            color: '#fd7e4f',
                        });

                        const tableBody: any[] = [
                            [
                                {
                                    text: 'Metric',
                                    bold: true,
                                    color: '#ffffff',
                                    fillColor: '#fd7e4f',
                                    fontSize: 10
                                },
                                {
                                    text: 'Value',
                                    bold: true,
                                    color: '#ffffff',
                                    fillColor: '#fd7e4f',
                                    fontSize: 10
                                },
                            ],
                        ];

                        entries.forEach((entry) => {
                            tableBody.push([
                                { text: this.formatMetricKey(entry.key), fontSize: 9 },
                                { text: String(entry.value), fontSize: 9 },
                            ]);
                        });

                        docContent.push({
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: tableBody,
                            },
                            layout: {
                                hLineWidth: () => 0.5,
                                vLineWidth: () => 0.5,
                                hLineColor: () => '#e5e7eb',
                                vLineColor: () => '#e5e7eb',
                                paddingLeft: () => 8,
                                paddingRight: () => 8,
                                paddingTop: () => 6,
                                paddingBottom: () => 6,
                            },
                            margin: [10, 0, 10, 10],
                        });
                    }
                }

                // Add old format metrics for backward compatibility
                if (
                    msg.metricsQuery &&
                    Array.isArray(msg.metricsQuery) &&
                    this.hasValidMetrics(msg.metricsQuery)
                ) {
                    const metricsArray = this.getValidMetricsArray(msg.metricsQuery);

                    if (metricsArray.length > 0) {
                        docContent.push({
                            text: 'Key Performance Indicators',
                            fontSize: 11,
                            bold: true,
                            margin: [10, 10, 10, 5],
                            color: '#fd7e4f',
                        });

                        const tableBody: any[] = [
                            [
                                {
                                    text: 'Metric',
                                    bold: true,
                                    color: '#ffffff',
                                    fillColor: '#fd7e4f',
                                    fontSize: 10
                                },
                                {
                                    text: 'Value',
                                    bold: true,
                                    color: '#ffffff',
                                    fillColor: '#fd7e4f',
                                    fontSize: 10
                                },
                            ],
                        ];

                        metricsArray.forEach((metric) => {
                            tableBody.push([
                                { text: this.normalizeString(metric.key), fontSize: 9 },
                                { text: this.formatMetricValue(metric.value), fontSize: 9 },
                            ]);
                        });

                        docContent.push({
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: tableBody,
                            },
                            layout: {
                                hLineWidth: () => 0.5,
                                vLineWidth: () => 0.5,
                                hLineColor: () => '#e5e7eb',
                                vLineColor: () => '#e5e7eb',
                                paddingLeft: () => 8,
                                paddingRight: () => 8,
                                paddingTop: () => 6,
                                paddingBottom: () => 6,
                            },
                            margin: [10, 0, 10, 10],
                        });
                    }
                }

                // Add table data if available
                if (msg.tableData) {
                    let accountIds: string[] = [];

                    if (Array.isArray(msg.tableData)) {
                        accountIds = msg.tableData;
                    } else if (msg.tableData.headers && msg.tableData.rows) {
                        const accountIdIndex = msg.tableData.headers.findIndex(
                            h => h.toLowerCase().includes('account')
                        );
                        if (accountIdIndex !== -1) {
                            accountIds = msg.tableData.rows
                                .map(row => row[accountIdIndex])
                                .filter(Boolean);
                        }
                    }

                    if (accountIds.length > 0) {
                        docContent.push({
                            text: `Account IDs (${accountIds.length} total)`,
                            fontSize: 11,
                            bold: true,
                            margin: [10, 10, 10, 5],
                            color: '#fd7e4f',
                        });

                        const displayIds = accountIds.slice(0, 10);
                        docContent.push({
                            text: displayIds.join('\n') +
                                (accountIds.length > 10 ? `\n... and ${accountIds.length - 10} more` : ''),
                            fontSize: 9,
                            margin: [10, 0, 10, 5],
                            color: '#666',
                        });
                    }
                }

                // Add timestamp
                docContent.push({
                    text: this.formatTime(msg.timestamp),
                    fontSize: 8,
                    color: '#999',
                    margin: [10, 5, 10, 0],
                    italics: true,
                });

                // Add separator between messages
                if (index < this.messages.length - 1) {
                    docContent.push({
                        canvas: [
                            {
                                type: 'line',
                                x1: 0,
                                y1: 0,
                                x2: 515,
                                y2: 0,
                                lineWidth: 0.5,
                                lineColor: '#e5e7eb',
                                dash: { length: 3 }
                            }
                        ],
                        margin: [0, 15, 0, 0]
                    });
                }
            });

            // Add footer
            docContent.push({
                text: '\n\nEnd of Chat Transcript',
                fontSize: 10,
                alignment: 'center',
                color: '#999',
                margin: [0, 20, 0, 0],
            });

            // Create PDF document definition
            const docDefinition: any = {
                content: docContent,
                defaultStyle: {
                    font: 'Roboto'
                },
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                footer: (currentPage: number, pageCount: number) => {
                    return {
                        text: `Page ${currentPage} of ${pageCount}`,
                        alignment: 'center',
                        fontSize: 8,
                        color: '#999',
                        margin: [0, 20, 0, 0]
                    };
                }
            };

            // Generate and download PDF
            const fileName = `bonnie-chat-${new Date().getTime()}.pdf`;
            pdfMake.createPdf(docDefinition).download(fileName);

            console.log('✅ PDF exported successfully:', fileName);
        } catch (error) {
            console.error('❌ Error exporting PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    }

    exportTableData(messageId: string, tableData?: TableData): void {
        if (!tableData) return;

        const csvContent = this.generateCSVContent(tableData);
        this.downloadCSVFile(csvContent, messageId || 'table-export');
        this.showActionFeedback('export', messageId);
    }

    exportAccountIds(accountIds: string[], messageId: string): void {
        if (!accountIds || accountIds.length === 0) {
            console.warn('No account IDs to export');
            return;
        }

        try {
            const csvContent = 'Account_ID\n' + accountIds.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `account_ids_${messageId}_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            this.showActionFeedback('export', messageId);
        } catch (error) {
            console.error('Error exporting account IDs:', error);
        }
    }

    exportMetricsDataFromObject(metricsQuery: any, messageId: string): void {
        if (!this.isMetricsObject(metricsQuery)) {
            console.warn('Invalid metrics format');
            return;
        }

        try {
            const entries = this.getMetricsObjectEntries(metricsQuery);
            const csvContent = 'Metric,Value\n' +
                entries.map(entry => `"${this.formatMetricKey(entry.key)}","${entry.value}"`).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `metrics_${messageId}_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            this.showActionFeedback('export', messageId);
        } catch (error) {
            console.error('Error exporting metrics data:', error);
        }
    }

    exportMetricsData(metricsQuery: any[], messageId: string): void {
        if (!metricsQuery || metricsQuery.length === 0) {
            console.warn('No metrics data to export');
            return;
        }

        try {
            const metricsObject = metricsQuery[0];
            const metricsArray = this.getMetricsArray(metricsObject);

            const csvContent = [
                ['Metric', 'Value'].join(','),
                ...metricsArray.map(item => [
                    `"${item.key}"`,
                    `"${this.formatMetricValue(item.value)}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `metrics_${messageId}_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            this.showActionFeedback('export', messageId);
        } catch (error) {
            console.error('Error exporting metrics data:', error);
        }
    }

    exportChatTranscript(): void {
        const transcript = {
            title: this.title,
            timestamp: new Date().toISOString(),
            messages: this.messages.map(msg => ({
                id: msg.id,
                sender: msg.isUser ? this.username || 'User' : 'Bonnie',
                message: msg.message,
                timestamp: msg.timestamp.toISOString(),
                type: msg.isUser ? 'user' : 'bot',
                metrics: msg.metricsQuery || null,
                attachments: msg.attachments || null
            }))
        };

        const dataStr = JSON.stringify(transcript, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat-transcript-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ============================================================================
    // COPY FUNCTIONALITY
    // ============================================================================
    async copyMessageContent(message: ChatMessage): Promise<void> {
        let textToCopy = '';

        try {
            // Copy main content
            if (message.message) {
                textToCopy = message.message;
            }

            // Handle metrics - support both object and array formats
            if (message.metricsQuery) {
                if (this.isMetricsObject(message.metricsQuery)) {
                    // New object format
                    textToCopy += '\n\nMetrics:\n';
                    const entries = this.getMetricsObjectEntries(message.metricsQuery);
                    entries.forEach(entry => {
                        textToCopy += `${this.formatMetricKey(entry.key)}: ${entry.value}\n`;
                    });
                } else if (Array.isArray(message.metricsQuery) && this.hasValidMetrics(message.metricsQuery)) {
                    // Old array format (backward compatibility)
                    textToCopy += '\n\nMetrics:\n';
                    const metricsArray = this.getValidMetricsArray(message.metricsQuery);
                    metricsArray.forEach(metric => {
                        textToCopy += `${this.normalizeString(metric.key)}: ${this.formatMetricValue(metric.value)}\n`;
                    });
                }
            }

            // Handle TableData (new format or old array)
            if (message.tableData) {
                textToCopy += '\n\nAccount IDs:\n';

                if (Array.isArray(message.tableData)) {
                    // Old array format
                    textToCopy += message.tableData.join('\n');
                } else if (message.tableData.headers && message.tableData.rows) {
                    const accountIdIndex = message.tableData.headers.findIndex(
                        h => h.toLowerCase().includes('account')
                    );

                    if (accountIdIndex !== -1) {
                        // Extract account IDs column
                        const accountIds = message.tableData.rows.map(row => row[accountIdIndex]).filter(Boolean);
                        textToCopy += accountIds.join('\n');
                    } else {
                        // Fallback: copy full table if account ID column not found
                        textToCopy += message.tableData.rows.map(row => row.join(' | ')).join('\n');
                    }
                }
            }

            // Copy file link info
            if (message.fileLink) {
                textToCopy += '\n\nDownload Link: ' + message.fileLink;
            }

            await navigator.clipboard.writeText(textToCopy);
            this.copiedMessages.add(message.id);

            // Clear the copied state after 2 seconds
            setTimeout(() => {
                this.copiedMessages.delete(message.id);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy message:', error);
            this.fallbackCopyToClipboard(textToCopy, message.id);
        }
    }

    // ============================================================================
    // READ ALOUD FUNCTIONALITY
    // ============================================================================
    readMessageAloud(message: ChatMessage): void {
        if (!this.speechSynthesis) {
            console.warn('Speech synthesis not supported in this browser');
            return;
        }

        if (this.currentUtterance) {
            this.speechSynthesis.cancel();
        }

        let textToRead = '';

        // Read main content
        if (message.message) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = message.message;
            textToRead = tempDiv.textContent || tempDiv.innerText || '';
        }

        // Read table data summary (Account IDs)
        if (message.tableData && Array.isArray(message.tableData) && message.tableData.length > 0) {
            textToRead += ` This message contains ${message.tableData.length} account IDs.`;
        }

        // Read metrics data - support both object and array formats
        if (message.metricsQuery) {
            if (this.isMetricsObject(message.metricsQuery)) {
                // New object format
                const entries = this.getMetricsObjectEntries(message.metricsQuery);
                if (entries.length > 0) {
                    textToRead += ` Key metrics include: `;
                    const metricsText = entries.map(entry =>
                        `${this.formatMetricKey(entry.key)} is ${entry.value}`
                    ).join(', ');
                    textToRead += metricsText + '.';
                }
            } else if (Array.isArray(message.metricsQuery) && this.hasValidMetrics(message.metricsQuery)) {
                // Old array format (backward compatibility)
                const metricsArray = this.getValidMetricsArray(message.metricsQuery);
                if (metricsArray.length > 0) {
                    textToRead += ` Key metrics include: `;
                    const metricsText = metricsArray.map(metric =>
                        `${this.normalizeString(metric.key)} is ${this.formatMetricValue(metric.value)}`
                    ).join(', ');
                    textToRead += metricsText + '.';
                }
            }
        }

        // Read file availability
        if (message.fileLink) {
            textToRead += ' A downloadable report is available for this message.';
        }

        if (textToRead.trim()) {
            this.currentUtterance = new SpeechSynthesisUtterance(textToRead);

            this.currentUtterance.rate = 0.9;
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 0.8;

            this.currentUtterance.onend = () => {
                this.currentUtterance = null;
            };

            this.currentUtterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.currentUtterance = null;
            };

            this.speechSynthesis.speak(this.currentUtterance);
        }
    }

    stopReading(): void {
        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            this.currentUtterance = null;
        }
    }

    // ============================================================================
    // MESSAGE ACTIONS
    // ============================================================================
    downloadReport(fileLink: string): void {
        window.open(fileLink, '_blank');
    }

    shareMessage(message: ChatMessage): void {
        if (navigator.share) {
            navigator.share({
                title: 'Shared from Chat',
                text: message.message || 'Shared message from chatbot',
                url: window.location.href
            })
                .then(() => {
                    this.showActionFeedback('share', message.id);
                })
                .catch(() => {
                    this.fallbackShare(message);
                });
        } else {
            this.fallbackShare(message);
        }

        this.closeMoreActions(message.id);
    }

    regenerateResponse(message: ChatMessage): void {
        const messageIndex = this.messages.findIndex(m => m.id === message.id);
        if (messageIndex > 0) {
            const previousMessage = this.messages[messageIndex - 1];
            if (previousMessage.isUser) {
                const requestModel: ChatRequestModel = {
                    userMessage: previousMessage.message || '',
                    userRole: this.userRole,
                    agent: this.selectedAgent,
                    model: this.selectedModel || 'OpenAI',
                };

                this.sendToService(requestModel);
                this.showActionFeedback('regenerate', message.id);
            }
        }

        this.closeMoreActions(message.id);
    }

    clearChatContext(): void {
        if (!this.userid) {
            console.error('❌ User ID is not available. Cannot clear chat context.');
            alert('Please select a user first to clear chat context.');
            return;
        }

        if (confirm('Are you sure you want to clear the chat? This will remove all messages and reset the conversation.')) {
            this.chatService.startNewChat();

            // Reset all local state
            this.selectedAgent = undefined;
            this.selectedAgentDisplay = 'Tools';
            this.selectedFile = undefined;
            this.newMessage = '';
            this.showTypingIndicator = false;
            this.isTyping = false;

            this.showProcessingMessage = false;
            if (this.processingTimeout) {
                clearTimeout(this.processingTimeout);
            }

            this.stopProcessingMessageRotation();
        }
    }

    // ============================================================================
    // FORM HANDLING
    // ============================================================================
    onFormSubmit(formResult: FormSubmissionResult, messageId: string): void {
        if (formResult.isValid) {
            // Create a user message showing what was submitted
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                message: `Form "${formResult.formId}" submitted successfully`,
                isUser: true,
                timestamp: new Date()
            };

            // Add user message to show form was submitted
            this.messages.push(userMessage);

            // Create a request model with form data
            const requestModel: ChatRequestModel = {
                userMessage: `Form submission: ${JSON.stringify(formResult.data)}`,
                userRole: this.userRole,
                agent: this.selectedAgent,
                model: this.selectedModel || 'OpenAI',
                formSubmission: formResult
            };

            // Hide the form from the message
            this.hideFormFromMessage(messageId);

            // Send form data to chat service
            this.sendToService(requestModel);
            this.emitMessageEvent(requestModel);

            // Show success feedback
            this.showActionFeedback('form-submitted', messageId);
        } else {
            console.warn('Form validation failed');
        }
    }

    onFormCancel(formId: string, messageId: string): void {
        // Hide the form from the message
        this.hideFormFromMessage(messageId);

        // Show cancellation feedback
        this.showActionFeedback('form-cancelled', messageId);
    }

    // ============================================================================
    // SCROLL HANDLING
    // ============================================================================
    onMessagesScroll(): void {
        // Clear previous timeout
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        // Run outside Angular's change detection
        this.ngZone.runOutsideAngular(() => {
            const container = this.messagesContainerRef?.nativeElement;
            if (!container) return;

            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const scrolledFromBottom = scrollHeight - scrollTop - clientHeight;
            const shouldShow = scrolledFromBottom > 100;

            // Debounce the UI update
            this.scrollTimeout = setTimeout(() => {
                if (this.showScrollButton !== shouldShow) {
                    // Run change detection only when necessary
                    this.ngZone.run(() => {
                        this.showScrollButton = shouldShow;
                    });
                }
            }, 50);
        });
    }

    scrollToBottom(): void {
        const container = this.messagesContainerRef?.nativeElement;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });

        // Hide button immediately after clicking
        this.showScrollButton = false;
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    trackByMessageId(index: number, message: ChatMessage): string {
        return message.id;
    }

    formatMessageText(content: string): string {
        return content.replace(/(special phrases)/g, '<span class="special-text">$1</span>');
    }

    get inputPlaceholder(): string {
        if (this.messages.length === 1) {
            return 'Message Bonnie...';
        }
        return 'Reply...';
    }

    formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    normalizeString(value: string): string {
        if (!value) return '';

        const normalized = value
            .replace(/[-_]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    getSortedSuggestions(suggestions: string[] | undefined): string[] {
        if (!suggestions || suggestions.length === 0) return [];

        const suggestionsCopy = [...suggestions];

        return suggestionsCopy.sort((a, b) => {
            const lengthDiff = a.length - b.length;
            if (lengthDiff !== 0) return lengthDiff;

            return a.localeCompare(b);
        });
    }

    autoResize(event: any): void {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================
    private initializeChat(): void {
        // Initialize chat - to be implemented with your logic
    }

    private subscribeToMessages(): void {
        this.messagesSubscription = this.chatService.messages$.subscribe(
            (messages: ChatMessage[]) => {
                const previousMessageCount = this.messages.length;
                this.messages = messages;

                if (messages.length > previousMessageCount) {
                    const lastMessage = messages[messages.length - 1];

                    if (!lastMessage.isUser) {
                        // Clear processing timeout when bot message arrives
                        if (this.processingTimeout) {
                            clearTimeout(this.processingTimeout);
                            this.processingTimeout = null;
                        }

                        // Stop processing message rotation
                        this.stopProcessingMessageRotation();

                        // Hide processing message and typing indicator
                        this.showProcessingMessage = false;
                        this.showTypingIndicator = false;
                        this.isTyping = false;

                        // Auto-expand if message has graph
                        if (lastMessage.hasGraph && !this.isMaximized) {
                            this.toggleMaximized();
                        }

                        // Update unread count if collapsed
                        if (this.isCollapsed) {
                            this.hasUnreadMessages = true;
                            this.unreadCount++;
                        }

                        // Scroll to bottom
                        this.shouldScroll = true;
                    }
                }
            }
        );
    }

    private setupRefreshHandling(): void {
        this.detectAndHandleRefresh();
        this.setupBeforeUnloadHandler();
    }

    private detectAndHandleRefresh(): void {
        const perfEntries = performance.getEntriesByType('navigation');
        const navEntry = perfEntries[0] as PerformanceNavigationTiming;
        const isRefresh = navEntry && navEntry.type === 'reload';

        const sessionFlag = sessionStorage.getItem('chatRefreshFlag');

        if ((isRefresh || sessionFlag === 'true') && this.userid) {
            this.chatService.startNewChat();
            sessionStorage.removeItem('chatRefreshFlag');
        }
    }

    private setupBeforeUnloadHandler(): void {
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    private beforeUnloadHandler = (): void => {
        sessionStorage.setItem('chatRefreshFlag', 'true');

        if (this.userid && navigator.sendBeacon) {
            const apiUrl = `your-api-base-url/clear-messages/${this.userid}`;
            navigator.sendBeacon(apiUrl);
        }
    };

    private sendToService(requestModel: ChatRequestModel): void {
        if (!this.userid) {
            console.error('❌ No userid provided, cannot send message');
            return;
        }

        this.chatService.addMessage(
            requestModel.userMessage,
            true,
            requestModel.model || 'OpenAI',
            requestModel.file,
            requestModel.agent,
            requestModel.userRole,
        );
    }

    private generateMessageId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private isValidMessage(): boolean {
        return this.newMessage.trim().length > 0;
    }

    private createRequestModel(): ChatRequestModel {
        return {
            userMessage: this.newMessage,
            userRole: this.userRole,
            agent: this.selectedAgent,
            model: this.selectedModel || 'OpenAI',
            file: this.selectedFile
        };
    }

    private resetInputState(): void {
        this.newMessage = '';
    }

    private emitMessageEvent(requestModel: ChatRequestModel): void {
        this.messageEvent.emit(requestModel);
    }

    private closeDropdowns(): void {
        this.showToolsDropdown = false;
        this.showAttachDropdown = false;
    }

    private closeAllMoreActions(): void {
        Object.keys(this.showMoreActions).forEach(id => {
            this.showMoreActions[id] = false;
        });
    }

    private closeMoreActions(messageId: string): void {
        this.showMoreActions[messageId] = false;
    }

    private setSelectedAgent(tool: string): void {
        this.selectedAgent = tool as 'Audience Builder' | 'Loyalty Builder' | 'Rewards Builder';
        this.selectedAgentDisplay = tool;
    }

    private handleToolSelection(tool: string): void {
        // To be implemented with your tool selection logic
    }

    private handleFileUpload(type: string): void {
        // To be implemented with your file upload logic
    }

    private generateCSVContent(tableData: TableData): string {
        if (!tableData || !tableData.headers) return '';

        const rows = [tableData.headers, ...tableData.rows];
        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    private downloadCSVFile(csvContent: string, filename: string): void {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    private showActionFeedback(action: string, messageId: string): void {
        this.actionFeedback[messageId] = action;
        setTimeout(() => {
            delete this.actionFeedback[messageId];
        }, 3000);
    }

    private hideFormFromMessage(messageId: string): void {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.hasForm = false;
            message.formData = undefined;
        }
    }

    private fallbackCopyToClipboard(text: string, messageId: string): void {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.copiedMessages.add(messageId);

            setTimeout(() => {
                this.copiedMessages.delete(messageId);
            }, 2000);
        } catch (error) {
            console.error('Fallback copy failed:', error);
        } finally {
            document.body.removeChild(textArea);
        }
    }

    private fallbackShare(message: ChatMessage): void {
        this.copyMessageContent(message);
    }
}