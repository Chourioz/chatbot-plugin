import { useState, useCallback, useRef } from "react";
import type { ChatMessage, MessageHandler } from "../types";

// Types for the hook
interface ApiKeyValidation {
  isValid: boolean;
  clientId: string | null;
  error: string | null;
}

interface ApiConnection {
  endpoint: string;
  headers: Record<string, string>;
  timeout: number;
}

interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;
}

interface UseChatbotOptions {
  apiKey?: string;
  onMessage?: MessageHandler;
  maxMessages?: number;
  welcomeMessage?: string;
}

interface UseChatbotReturn {
  // State
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;

  // Validation
  apiKeyValidation: ApiKeyValidation;
}

// API Configuration Service (Single Responsibility)
class ApiConfigurationService {
  private static readonly CLIENT_ENDPOINTS: Record<string, string> = {
    client01: "https://api.client1.com/chat",
    client02: "https://api.client2.com/chat",
    test1234: "https://api.test.com/chat",
  };

  private static readonly DEFAULT_ENDPOINT = "https://api.default.com/chat";
  private static readonly DEFAULT_TIMEOUT = 30000;

  static getEndpoint(clientId: string): string {
    return this.CLIENT_ENDPOINTS[clientId] || this.DEFAULT_ENDPOINT;
  }

  static createConnection(apiKey: string): ApiConnection {
    const clientId = this.extractClientId(apiKey);

    return {
      endpoint: this.getEndpoint(clientId),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Client-ID": clientId,
        "X-SaaS-Platform": "react-chatbot-component",
      },
      timeout: this.DEFAULT_TIMEOUT,
    };
  }

  private static extractClientId(apiKey: string): string {
    return apiKey.substring(0, 8);
  }
}

// API Key Validation Service (Single Responsibility)
class ApiKeyValidationService {
  private static readonly MIN_LENGTH = 8;
  private static readonly VALID_PATTERN = /^[a-zA-Z0-9]+$/;

  static validate(apiKey?: string): ApiKeyValidation {
    if (!apiKey) {
      return {
        isValid: false,
        clientId: null,
        error: "API Key is required for message processing",
      };
    }

    if (apiKey.length < this.MIN_LENGTH) {
      return {
        isValid: false,
        clientId: null,
        error: `API Key must be at least ${this.MIN_LENGTH} characters long`,
      };
    }

    if (!this.VALID_PATTERN.test(apiKey)) {
      return {
        isValid: false,
        clientId: null,
        error:
          "API Key contains invalid characters. Only alphanumeric characters are allowed",
      };
    }

    return {
      isValid: true,
      clientId: apiKey.substring(0, 8),
      error: null,
    };
  }
}

// Message Processing Service (Single Responsibility)
class MessageProcessingService {
  static async processMessage(
    message: string,
    apiConnection: ApiConnection,
    apiKey: string
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      apiConnection.timeout
    );

    try {
      const response = await fetch(apiConnection.endpoint, {
        method: "POST",
        headers: apiConnection.headers,
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
          clientId: apiKey.substring(0, 8),
          platform: "react-chatbot-component",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.response || data.message || "No response received from agent";
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout. Please try again.");
        }
        throw error;
      }
      throw new Error(
        "Failed to communicate with agent. Please check your API key and try again."
      );
    }
  }
}

// Error Handling Service (Single Responsibility)
class ErrorHandlingService {
  static createErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  }

  static logError(context: string, error: unknown): void {
    console.error(`🚨 ${context}:`, error);
  }
}

// Main Custom Hook (Dependency Inversion + Interface Segregation)
export const useChatbot = ({
  apiKey,
  onMessage,
  maxMessages = 100,
  welcomeMessage,
}: UseChatbotOptions = {}): UseChatbotReturn => {
  // State Management
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isTyping: false,
    isConnected: false,
    error: null,
  });

  // Refs for stable references
  const apiConnectionRef = useRef<ApiConnection | null>(null);
  const messageIdCounterRef = useRef(0);

  // Validation (computed on every render - lightweight operation)
  const apiKeyValidation = ApiKeyValidationService.validate(apiKey);

  // Initialize API connection when apiKey changes
  const initializeConnection = useCallback(() => {
    if (apiKeyValidation.isValid && apiKey) {
      try {
        apiConnectionRef.current =
          ApiConfigurationService.createConnection(apiKey);
        setState((prev) => ({ ...prev, isConnected: true, error: null }));
        console.log(
          "🔑 API connection established for client:",
          apiKeyValidation.clientId
        );
      } catch (error) {
        ErrorHandlingService.logError("Connection initialization", error);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          error: ErrorHandlingService.createErrorMessage(error),
        }));
      }
    } else {
      apiConnectionRef.current = null;
      setState((prev) => ({
        ...prev,
        isConnected: false,
        error: apiKeyValidation.error,
      }));
    }
  }, [
    apiKey,
    apiKeyValidation.isValid,
    apiKeyValidation.clientId,
    apiKeyValidation.error,
  ]);

  // Initialize connection on apiKey change
  useState(() => {
    initializeConnection();
  });

  // Initialize welcome message
  useState(() => {
    if (welcomeMessage && state.messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        text: welcomeMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        messages: [welcomeMsg],
      }));
    }
  });

  // Message ID generator
  const generateMessageId = useCallback(
    (type: "user" | "bot" | "error"): string => {
      messageIdCounterRef.current += 1;
      return `${type}-${Date.now()}-${messageIdCounterRef.current}`;
    },
    []
  );

  // Add message to state
  const addMessage = useCallback(
    (message: ChatMessage) => {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages.slice(-(maxMessages - 1)), message],
      }));
    },
    [maxMessages]
  );

  // Default message handler using API
  const defaultMessageHandler = useCallback(
    async (message: string): Promise<string> => {
      if (!apiKey || !apiConnectionRef.current) {
        throw new Error("API connection not established");
      }

      return MessageProcessingService.processMessage(
        message,
        apiConnectionRef.current,
        apiKey
      );
    },
    [apiKey]
  );

  // Send message function (Open/Closed Principle - extensible via onMessage prop)
  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const userMessage: ChatMessage = {
        id: generateMessageId("user"),
        text: text.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      // Add user message
      addMessage(userMessage);

      // Determine message handler (Dependency Inversion)
      const messageHandler =
        onMessage || (apiKeyValidation.isValid ? defaultMessageHandler : null);

      if (!messageHandler) {
        const errorMessage: ChatMessage = {
          id: generateMessageId("error"),
          text: "Please provide an API Key or custom message handler to enable chat functionality.",
          sender: "bot",
          timestamp: new Date(),
        };
        addMessage(errorMessage);
        return;
      }

      // Set typing state
      setState((prev) => ({ ...prev, isTyping: true, error: null }));

      try {
        // Process message
        const response = await messageHandler(text.trim(), apiKey);

        const botMessage: ChatMessage = {
          id: generateMessageId("bot"),
          text: response,
          sender: "bot",
          timestamp: new Date(),
        };

        addMessage(botMessage);
      } catch (error) {
        ErrorHandlingService.logError("Message processing", error);

        const errorMessage: ChatMessage = {
          id: generateMessageId("error"),
          text: ErrorHandlingService.createErrorMessage(error),
          sender: "bot",
          timestamp: new Date(),
        };

        addMessage(errorMessage);
        setState((prev) => ({
          ...prev,
          error: ErrorHandlingService.createErrorMessage(error),
        }));
      } finally {
        setState((prev) => ({ ...prev, isTyping: false }));
      }
    },
    [
      generateMessageId,
      addMessage,
      onMessage,
      apiKeyValidation.isValid,
      defaultMessageHandler,
      apiKey,
    ]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [] }));
    messageIdCounterRef.current = 0;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    messages: state.messages,
    isTyping: state.isTyping,
    isConnected: state.isConnected,
    error: state.error,

    // Actions
    sendMessage,
    clearMessages,
    clearError,

    // Validation
    apiKeyValidation,
  };
};
