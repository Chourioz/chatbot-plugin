import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ChatMessage,
  MessageHandler,
  ServerChatbotConfig,
} from "../types";

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
  chatbotConfig?: ServerChatbotConfig;
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
  updateWelcomeMessage: (newWelcomeMessage: string) => void;

  // Session Management
  clearSession: () => void;
  getSessionInfo: () => {
    sessionId: string;
    deviceFingerprint: string;
    created: string;
  };

  // Getters
  getEffectiveWelcomeMessage: () => string;

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
  chatbotConfig: ServerChatbotConfig;
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

  static createConnection(apiKey: string, agentUrl?: string): ApiConnection {
    return {
      endpoint: agentUrl || this.getChatEndpoint(),
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
        chatbotConfig: data.chatbotConfig,
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

// Session Management Service for Anonymous Users
class SessionManagementService {
  private static readonly SESSION_STORAGE_KEY = "react-chatbot-session";
  private static readonly DEVICE_FINGERPRINT_KEY = "react-chatbot-device-fp";

  // Generate device fingerprint based on browser characteristics
  private static generateDeviceFingerprint(): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 50;

    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint test 🔐", 2, 2);
    }

    const canvasFingerprint = canvas.toDataURL();

    const deviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      canvas: canvasFingerprint.slice(-50), // Last 50 chars to reduce size
    };

    // Create hash from device info
    const deviceString = JSON.stringify(deviceInfo);
    let hash = 0;
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `df_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
  }

  // Generate unique session ID with device fingerprint + timestamp + random
  private static generateSessionId(): string {
    const deviceFp = this.getOrCreateDeviceFingerprint();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const browserType = this.getBrowserType();

    return `${deviceFp}_${browserType}_${timestamp}_${random}`;
  }

  // Get browser type for additional entropy
  private static getBrowserType(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "chr";
    if (userAgent.includes("Firefox")) return "ffx";
    if (userAgent.includes("Safari")) return "sfr";
    if (userAgent.includes("Edge")) return "edg";
    return "unk";
  }

  // Get or create device fingerprint (persists across browser sessions)
  private static getOrCreateDeviceFingerprint(): string {
    try {
      let deviceFp = localStorage.getItem(this.DEVICE_FINGERPRINT_KEY);

      if (!deviceFp) {
        deviceFp = this.generateDeviceFingerprint();
        localStorage.setItem(this.DEVICE_FINGERPRINT_KEY, deviceFp);
        console.log(
          "🔐 New device fingerprint created:",
          deviceFp.substring(0, 20) + "..."
        );
      }

      return deviceFp;
    } catch (error) {
      console.warn(
        "⚠️ Could not access localStorage for device fingerprint:",
        error
      );
      // Fallback to session-only fingerprint
      return this.generateDeviceFingerprint();
    }
  }

  // Get or create session ID (persists during chatbot instance)
  static getOrCreateSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(this.SESSION_STORAGE_KEY);

      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem(this.SESSION_STORAGE_KEY, sessionId);
        console.log("🆔 New session created:", {
          sessionId: sessionId.substring(0, 30) + "...",
          timestamp: new Date().toISOString(),
        });
      }

      return sessionId;
    } catch (error) {
      console.warn(
        "⚠️ Could not access sessionStorage, generating temporary session:",
        error
      );
      // Fallback to in-memory session for current page load
      return this.generateSessionId();
    }
  }

  // Clear session (for logout or reset)
  static clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
      console.log("🧹 Session cleared");
    } catch (error) {
      console.warn("⚠️ Could not clear session from storage:", error);
    }
  }

  // Get session info for debugging
  static getSessionInfo(): {
    sessionId: string;
    deviceFingerprint: string;
    created: string;
  } {
    const sessionId = this.getOrCreateSessionId();
    const deviceFp = this.getOrCreateDeviceFingerprint();

    return {
      sessionId: sessionId.substring(0, 30) + "...",
      deviceFingerprint: deviceFp.substring(0, 20) + "...",
      created: new Date().toISOString(),
    };
  }
}

// Message Processing Service (Updated for real agent communication)
class MessageProcessingService {
  static async processMessage(
    message: string,
    agentUrl: string,
    sessionId: string
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      30000 // 30 second timeout
    );

    try {
      console.log("📤 Sending message to agent:", {
        url: agentUrl,
        sessionId: sessionId.substring(0, 20) + "...",
        messageLength: message.length,
      });

      const response = await fetch(agentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "ReactChatbotComponent/1.0",
        },
        body: JSON.stringify({
          question: message,
          session: sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Agent request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      console.log("📥 Received response from agent:", {
        responseLength: data?.output?.length || 0,
        sessionId: sessionId.substring(0, 20) + "...",
        responseStructure: Object.keys(data || {}),
      });

      // The agent response structure contains 'output' field with the actual response
      if (data.output) {
        return data.output;
      }

      // Fallback to other possible response field names for compatibility
      const fallbackResponse =
        data.answer || data.response || data.message || data.reply;

      if (fallbackResponse) {
        console.warn(
          "⚠️ Agent response using fallback field instead of 'output':",
          Object.keys(data)
        );
        return fallbackResponse;
      }

      // Log the full response structure for debugging
      console.error("🚨 No valid response found in agent response:", data);
      return "No response received from agent. Please check the agent configuration.";
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            "Request timeout. The agent took too long to respond. Please try again."
          );
        }
        console.error("🚨 Agent communication error:", error);
        throw new Error(`Failed to communicate with agent: ${error.message}`);
      }
      throw new Error(
        "Unknown error occurred while communicating with agent. Please try again."
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
  const welcomeMessageRef = useRef<string | undefined>(undefined);

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
        const agentUrl = state.apiKeyValidation.chatbotConfig?.agentUrl;
        apiConnectionRef.current = ApiConfigurationService.createConnection(
          apiKey,
          agentUrl
        );
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
        console.log(
          "🔑 API connection established for client:",
          state.apiKeyValidation.keyId
        );
        if (agentUrl) {
          console.log("🌐 Using custom agent URL:", agentUrl);
        }
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
    state.apiKeyValidation.chatbotConfig?.agentUrl,
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

  // Initialize welcome message - but prioritize API validation config
  useEffect(() => {
    // Determine the effective welcome message to use
    const apiWelcomeMessage =
      state.apiKeyValidation.isValid &&
      state.apiKeyValidation.chatbotConfig?.welcomeText;

    const effectiveWelcomeMessage =
      apiWelcomeMessage ||
      welcomeMessageRef.current ||
      "Hello! How can I help you today?";

    // Always update welcomeMessageRef to the effective message
    if (apiWelcomeMessage) {
      welcomeMessageRef.current = apiWelcomeMessage;
      console.log("🔄 Using welcome message from API validation:", {
        apiMessage: apiWelcomeMessage,
        source: "API chatbot configuration",
      });
    }

    // Initialize or update welcome message in chat
    if (state.messages.length === 0) {
      // No messages yet - create initial welcome message
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        text: effectiveWelcomeMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        messages: [welcomeMsg],
      }));
      console.log(
        "💬 Initial welcome message created:",
        effectiveWelcomeMessage.substring(0, 50) + "..."
      );
    } else {
      // Check if we need to force update the first message when API validation arrives
      const firstMessage = state.messages[0];
      if (
        apiWelcomeMessage &&
        firstMessage.id.startsWith("welcome-") &&
        firstMessage.sender === "bot" &&
        firstMessage.text !== apiWelcomeMessage
      ) {
        setState((prev) => ({
          ...prev,
          messages: [
            {
              ...firstMessage,
              text: apiWelcomeMessage,
              timestamp: new Date(), // Update timestamp to show it's fresh
            },
            ...prev.messages.slice(1), // Keep the rest of the messages
          ],
        }));
        console.log("💬 Welcome message FORCED update from API config:", {
          old: firstMessage.text.substring(0, 30) + "...",
          new: apiWelcomeMessage.substring(0, 30) + "...",
        });
      }
    }
  }, [
    state.apiKeyValidation.isValid,
    state.apiKeyValidation.chatbotConfig?.welcomeText,
    state.messages.length,
  ]);

  // Message ID generator
  const generateMessageId = useCallback(
    (type: "user" | "bot" | "error"): string => {
      messageIdCounterRef.current += 1;
      return `${type}-${Date.now()}-${messageIdCounterRef.current}`;
    },
    []
  );

  // Add message to state
  const addMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  // Default message handler using API
  const defaultMessageHandler = useCallback(
    async (message: string): Promise<string> => {
      if (!apiKey || !apiConnectionRef.current) {
        throw new Error("API connection not established");
      }

      // Use agent URL from API validation if available, otherwise fallback to default endpoint
      const agentUrl =
        state.apiKeyValidation.chatbotConfig?.agentUrl ||
        apiConnectionRef.current.endpoint;
      const sessionId = SessionManagementService.getOrCreateSessionId();

      console.log("🔄 Using agent endpoint:", {
        isCustomAgent: !!state.apiKeyValidation.chatbotConfig?.agentUrl,
        agentUrl: agentUrl.substring(0, 50) + "...",
        sessionId: sessionId.substring(0, 20) + "...",
      });

      return MessageProcessingService.processMessage(
        message,
        agentUrl,
        sessionId
      );
    },
    [apiKey, state.apiKeyValidation.chatbotConfig?.agentUrl]
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
      const messageHandler = state.apiKeyValidation.isValid
        ? defaultMessageHandler
        : null;

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
        const response = await messageHandler(text.trim());

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

  // Update welcome message
  const updateWelcomeMessage = useCallback((newWelcomeMessage: string) => {
    // Update the welcome message reference
    welcomeMessageRef.current = newWelcomeMessage;

    // If there's already a welcome message in the chat, update it
    setState((prev) => {
      if (prev.messages.length > 0) {
        const firstMessage = prev.messages[0];
        if (
          firstMessage.id.startsWith("welcome-") &&
          firstMessage.sender === "bot"
        ) {
          return {
            ...prev,
            messages: [
              {
                ...firstMessage,
                text: newWelcomeMessage,
                timestamp: new Date(), // Update timestamp to show it's fresh
              },
              ...prev.messages.slice(1), // Keep the rest of the messages
            ],
          };
        }
      }
      return prev;
    });

    console.log("💬 Welcome message manually updated:", newWelcomeMessage);
  }, []);

  // Get effective welcome message (API config takes precedence)
  const getEffectiveWelcomeMessage = useCallback((): string => {
    return (
      state.apiKeyValidation.chatbotConfig?.welcomeText ||
      welcomeMessageRef.current ||
      "Hello! How can I help you today?"
    );
  }, [state.apiKeyValidation.chatbotConfig?.welcomeText]);

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
    updateWelcomeMessage,

    // Session Management
    clearSession: SessionManagementService.clearSession,
    getSessionInfo: SessionManagementService.getSessionInfo,

    // Getters
    getEffectiveWelcomeMessage,

    // Validation
    apiKeyValidation: state.apiKeyValidation,
  };
};
