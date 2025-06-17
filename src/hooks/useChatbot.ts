import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, MessageHandler } from "../types";

// Types for the hook
interface ApiKeyValidation {
  isValid: boolean;
  isActive?: boolean;
  keyId?: string;
  keyName?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  lastUsed?: string;
  usageCount?: number;
  error: string | null;
  isLoading?: boolean;
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
  apiKeyValidation: ApiKeyValidation;
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
  validateApiKey: () => Promise<void>;

  // Validation
  apiKeyValidation: ApiKeyValidation;
}

// API Key Validation Response from server
interface ApiKeyValidationResponse {
  isValid: boolean;
  isActive: boolean;
  keyId: string;
  keyName: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  lastUsed: string;
  usageCount: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: ApiKeyValidationResponse;
}

// Environment Configuration (12-factor app pattern)
interface AppConfig {
  env: "development" | "staging" | "production";
  validationEndpoint: string;
  chatEndpoint: string;
  timeout: number;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.createConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private createConfig(): AppConfig {
    // Determine environment based on common patterns
    const env = this.determineEnvironment();

    switch (env) {
      case "production":
        return {
          env: "production",
          validationEndpoint:
            "https://api.reactchatbot.io/api/v1/api-keys/validate",
          chatEndpoint: "https://api.reactchatbot.io/api/v1/chat",
          timeout: 30000,
        };

      case "staging":
        return {
          env: "staging",
          validationEndpoint:
            "https://api.staging.reactchatbot.io/api/v1/api-keys/validate",
          chatEndpoint: "https://api.staging.reactchatbot.io/api/v1/chat",
          timeout: 30000,
        };

      case "development":
      default:
        return {
          env: "development",
          validationEndpoint: "http://localhost:3000/api/v1/api-keys/validate",
          chatEndpoint: "http://localhost:3000/api/v1/chat",
          timeout: 30000,
        };
    }
  }

  private determineEnvironment(): "development" | "staging" | "production" {
    // Priority order for environment detection

    // 1. Explicit environment variable (if available in the hosting environment)
    if (typeof window !== "undefined") {
      // Client-side: check for injected environment variables
      const injectedEnv = (window as any).__REACT_CHATBOT_ENV__;
      if (injectedEnv) return injectedEnv;
    }

    // 2. URL-based detection (common SaaS pattern)
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;

      if (hostname.includes("staging") || hostname.includes("dev")) {
        return "staging";
      }

      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.")
      ) {
        return "development";
      }

      // Production domains
      return "production";
    }

    // 3. Node.js environment detection (for SSR)
    if (typeof process !== "undefined" && process.env) {
      const nodeEnv = process.env.NODE_ENV;
      const appEnv = process.env.REACT_CHATBOT_ENV;

      if (appEnv) {
        return appEnv as "development" | "staging" | "production";
      }

      if (nodeEnv === "development") return "development";
      if (nodeEnv === "production") return "production";
    }

    // 4. Default fallback
    return "development";
  }

  getConfig(): AppConfig {
    return this.config;
  }

  // Allow manual override for testing/special cases
  setEnvironment(env: "development" | "staging" | "production"): void {
    this.config = this.createConfig();
    console.log(`🔧 React Chatbot environment set to: ${env}`);
  }
}

// API Configuration Service (Single Responsibility)
class ApiConfigurationService {
  private static config = ConfigService.getInstance().getConfig();

  static getValidationEndpoint(): string {
    return this.config.validationEndpoint;
  }

  static getChatEndpoint(): string {
    return this.config.chatEndpoint;
  }

  static createConnection(apiKey: string): ApiConnection {
    return {
      endpoint: this.getChatEndpoint(),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-API-Key": apiKey,
        "X-SaaS-Platform": "react-chatbot-component",
        "X-Environment": this.config.env,
      },
      timeout: this.config.timeout,
    };
  }
}

// API Key Validation Service (Single Responsibility)
class ApiKeyValidationService {
  private static readonly API_KEY_PATTERN = /^sk_[a-f0-9]{64}$/;
  private static readonly VALIDATION_TIMEOUT = 10000;

  static validateFormat(apiKey?: string): {
    isValid: boolean;
    error: string | null;
  } {
    if (!apiKey) {
      return {
        isValid: false,
        error: "API Key is required for message processing",
      };
    }

    if (!this.API_KEY_PATTERN.test(apiKey)) {
      return {
        isValid: false,
        error:
          "Invalid API key format. Expected format: sk_[64 hexadecimal characters]",
      };
    }

    return {
      isValid: true,
      error: null,
    };
  }

  static async validateWithServer(apiKey: string): Promise<ApiKeyValidation> {
    const formatValidation = this.validateFormat(apiKey);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        error: formatValidation.error,
        isLoading: false,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.VALIDATION_TIMEOUT
    );

    try {
      const endpoint = ApiConfigurationService.getValidationEndpoint();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 400) {
          return {
            isValid: false,
            error: "Invalid API key format or missing key",
            isLoading: false,
          };
        }

        if (response.status === 401) {
          const errorData: ApiResponse = await response.json().catch(() => ({
            success: false,
            message: "Invalid or expired API key",
          }));

          return {
            isValid: false,
            error: errorData.message || "Invalid or expired API key",
            isLoading: false,
          };
        }

        throw new Error(
          `Validation failed: ${response.status} ${response.statusText}`
        );
      }

      const responseData: ApiResponse = await response.json();

      if (!responseData.success || !responseData.data) {
        return {
          isValid: false,
          error: responseData.message || "API key validation failed",
          isLoading: false,
        };
      }

      const data = responseData.data;

      return {
        isValid: data.isValid && data.isActive,
        isActive: data.isActive,
        keyId: data.keyId,
        keyName: data.keyName,
        user: data.user,
        lastUsed: data.lastUsed,
        usageCount: data.usageCount,
        error: null,
        isLoading: false,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            isValid: false,
            error: "API key validation timeout. Please try again.",
            isLoading: false,
          };
        }

        return {
          isValid: false,
          error: error.message,
          isLoading: false,
        };
      }

      return {
        isValid: false,
        error:
          "Failed to validate API key. Please check your connection and try again.",
        isLoading: false,
      };
    }
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
          keyId: apiKey.substring(3, 11), // Extract key identifier from sk_ prefix
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

// Debug logging for environment detection
const config = ConfigService.getInstance().getConfig();
console.log(
  `🌍 React Chatbot Component initialized in ${config.env} environment`
);
console.log(`🔗 Validation endpoint: ${config.validationEndpoint}`);

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
    apiKeyValidation: {
      isValid: false,
      error: null,
      isLoading: false,
    },
  });

  // Refs for stable references
  const apiConnectionRef = useRef<ApiConnection | null>(null);
  const messageIdCounterRef = useRef(0);

  // Validate API key function
  const validateApiKey = useCallback(async () => {
    if (!apiKey) {
      setState((prev) => ({
        ...prev,
        apiKeyValidation: {
          isValid: false,
          error: "API Key is required for validation",
          isLoading: false,
        },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      apiKeyValidation: {
        ...prev.apiKeyValidation,
        isLoading: true,
        error: null,
      },
    }));

    try {
      const validationResult = await ApiKeyValidationService.validateWithServer(
        apiKey
      );
      setState((prev) => ({
        ...prev,
        apiKeyValidation: validationResult,
      }));
    } catch (error) {
      ErrorHandlingService.logError("API key validation", error);
      setState((prev) => ({
        ...prev,
        apiKeyValidation: {
          isValid: false,
          error: ErrorHandlingService.createErrorMessage(error),
          isLoading: false,
        },
      }));
    }
  }, [apiKey]);

  // Initialize API connection when validation succeeds
  const initializeConnection = useCallback(() => {
    if (state.apiKeyValidation.isValid && apiKey) {
      try {
        apiConnectionRef.current =
          ApiConfigurationService.createConnection(apiKey);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
        console.log(
          "🔑 API connection established for client:",
          state.apiKeyValidation.keyId
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
        error: state.apiKeyValidation.error,
      }));
    }
  }, [
    apiKey,
    state.apiKeyValidation.isValid,
    state.apiKeyValidation.keyId,
    state.apiKeyValidation.error,
  ]);

  // Validate API key when it changes
  useEffect(() => {
    if (apiKey) {
      validateApiKey();
    } else {
      setState((prev) => ({
        ...prev,
        apiKeyValidation: {
          isValid: false,
          error: "API Key is required for message processing",
          isLoading: false,
        },
        isConnected: false,
      }));
    }
  }, [apiKey, validateApiKey]);

  // Initialize connection when validation state changes
  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  // Initialize welcome message
  useEffect(() => {
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
  }, [welcomeMessage, state.messages.length]);

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
        onMessage ||
        (state.apiKeyValidation.isValid ? defaultMessageHandler : null);

      if (!messageHandler) {
        const errorMessage: ChatMessage = {
          id: generateMessageId("error"),
          text: "Please provide a valid API Key or custom message handler to enable chat functionality.",
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
      state.apiKeyValidation.isValid,
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
    validateApiKey,

    // Validation
    apiKeyValidation: state.apiKeyValidation,
  };
};
