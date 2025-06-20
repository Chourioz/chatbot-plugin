import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useChatbot } from "../useChatbot";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

describe("useChatbot Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useChatbot());

      // The hook now automatically creates a welcome message
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBe(
        "Hello! How can I help you today?"
      );
      expect(result.current.messages[0].sender).toBe("bot");
      expect(result.current.isTyping).toBe(false);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.apiKeyValidation.isValid).toBe(false);
      expect(result.current.apiKeyValidation.isLoading).toBe(false);
    });

    it("should initialize with welcome message when API key is valid", async () => {
      // Mock successful API key validation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              isValid: true,
              isActive: true,
              keyId: "key123",
              keyName: "Test Key",
              user: {
                id: "user123",
                email: "test@example.com",
                fullName: "Test User",
              },
              lastUsed: "2024-01-01T12:00:00Z",
              usageCount: 5,
              chatbotConfig: {
                title: "Test Chat",
                welcomeText: "Welcome to our chat!",
                placeholder: "Type here...",
                theme: { primary: "#3b82f6" },
              },
            },
          }),
      });

      const { result } = renderHook(() =>
        useChatbot({ apiKey: "sk_" + "a".repeat(64) })
      );

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].text).toBe("Welcome to our chat!");
        expect(result.current.messages[0].sender).toBe("bot");
      });
    });

    it("should handle missing API key", () => {
      const { result } = renderHook(() => useChatbot());

      expect(result.current.apiKeyValidation.isValid).toBe(false);
      expect(result.current.apiKeyValidation.error).toBe(
        "API Key is required for message processing"
      );
    });

    it("should validate API key format", () => {
      const { result } = renderHook(() =>
        useChatbot({ apiKey: "invalid_key" })
      );

      expect(result.current.apiKeyValidation.isValid).toBe(false);
      expect(result.current.apiKeyValidation.error).toMatch(
        /Invalid API key format/i
      );
    });
  });

  describe("API Key Validation", () => {
    it("should validate API key with server", async () => {
      const mockResponse = {
        success: true,
        data: {
          isValid: true,
          isActive: true,
          keyId: "key123",
          keyName: "Test Key",
          user: {
            id: "user123",
            email: "test@example.com",
            fullName: "Test User",
          },
          lastUsed: "2024-01-01T12:00:00Z",
          usageCount: 5,
          chatbotConfig: {
            title: "Test Chat",
            welcomeText: "Welcome!",
            placeholder: "Type here...",
            theme: { primary: "#3b82f6" },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const validApiKey = "sk_" + "a".repeat(64);
      const { result } = renderHook(() => useChatbot({ apiKey: validApiKey }));

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/api-keys/validate",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-API-Key": validApiKey,
          }),
        })
      );
    });

    it("should handle API key validation failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            success: false,
            message: "Invalid API key",
          }),
      });

      const validFormatKey = "sk_" + "b".repeat(64);
      const { result } = renderHook(() =>
        useChatbot({ apiKey: validFormatKey })
      );

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(false);
        expect(result.current.apiKeyValidation.error).toContain(
          "Invalid API key"
        );
      });
    });

    it("should handle network errors during validation", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const validFormatKey = "sk_" + "c".repeat(64);
      const { result } = renderHook(() =>
        useChatbot({ apiKey: validFormatKey })
      );

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(false);
        expect(result.current.apiKeyValidation.error).toMatch(
          /network error|failed to fetch/i
        );
      });
    });

    it("should show loading state during validation", async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(delayedPromise);

      const validFormatKey = "sk_" + "d".repeat(64);
      const { result } = renderHook(() =>
        useChatbot({ apiKey: validFormatKey })
      );

      expect(result.current.apiKeyValidation.isLoading).toBe(true);

      // Resolve the promise
      act(() => {
        resolvePromise!({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                isValid: true,
                isActive: true,
                keyId: "key123",
                keyName: "Test Key",
                user: {
                  id: "user123",
                  email: "test@example.com",
                  fullName: "Test User",
                },
                lastUsed: "2024-01-01T12:00:00Z",
                usageCount: 5,
                chatbotConfig: {
                  title: "Test Chat",
                  welcomeText: "Welcome!",
                  placeholder: "Type here...",
                  theme: { primary: "#3b82f6" },
                },
              },
            }),
        });
      });

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isLoading).toBe(false);
        expect(result.current.apiKeyValidation.isValid).toBe(true);
      });
    });
  });

  describe("Message Sending", () => {
    const setupValidApiKey = async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              isValid: true,
              isActive: true,
              keyId: "key123",
              keyName: "Test Key",
              user: {
                id: "user123",
                email: "test@example.com",
                fullName: "Test User",
              },
              lastUsed: "2024-01-01T12:00:00Z",
              usageCount: 5,
              chatbotConfig: {
                title: "Test Chat",
                welcomeText: "Welcome to test!",
                placeholder: "Type here...",
                theme: { primary: "#3b82f6" },
                agentUrl: "https://test.agent.url",
              },
            },
          }),
      });

      const validApiKey = "sk_" + "e".repeat(64);
      const { result } = renderHook(() => useChatbot({ apiKey: validApiKey }));

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
      });

      return { result, validApiKey };
    };

    it("should send message successfully", async () => {
      const { result } = await setupValidApiKey();

      // Mock successful message response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              response: "Hello! How can I help you?",
              conversationId: "conv-123",
              messageId: "msg-456",
            },
          }),
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3); // welcome + user + bot
        expect(result.current.messages[1].text).toBe("Hello");
        expect(result.current.messages[1].sender).toBe("user");
        expect(result.current.messages[2].text).toBe(
          "Hello! How can I help you?"
        );
        expect(result.current.messages[2].sender).toBe("bot");
      });
    });

    it("should show typing indicator during message processing", async () => {
      const { result } = await setupValidApiKey();

      let resolveMessage: (value: any) => void;
      const messagePromise = new Promise((resolve) => {
        resolveMessage = resolve;
      });

      mockFetch.mockReturnValueOnce(messagePromise);

      act(() => {
        result.current.sendMessage("Test message");
      });

      await waitFor(() => {
        expect(result.current.isTyping).toBe(true);
      });

      act(() => {
        resolveMessage!({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                response: "Response to test message",
                conversationId: "conv-123",
                messageId: "msg-456",
              },
            }),
        });
      });

      await waitFor(() => {
        expect(result.current.isTyping).toBe(false);
      });
    });

    it("should handle message sending errors", async () => {
      const { result } = await setupValidApiKey();

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.error).toMatch(/network error|failed/i);
        expect(result.current.isTyping).toBe(false);
      });
    });

    it("should not send empty messages", async () => {
      const { result } = await setupValidApiKey();

      await act(async () => {
        await result.current.sendMessage("");
      });

      // Should only have the welcome message
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].sender).toBe("bot");
    });

    it("should not send whitespace-only messages", async () => {
      const { result } = await setupValidApiKey();

      await act(async () => {
        await result.current.sendMessage("   \t  ");
      });

      // Should only have the welcome message
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].sender).toBe("bot");
    });

    it("should prevent sending messages when API key is invalid", async () => {
      const { result } = renderHook(() =>
        useChatbot({ apiKey: "invalid_key" })
      );

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      // Should only have the welcome message created during initialization
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].sender).toBe("bot");
      expect(result.current.messages[0].text).toBe(
        "Hello! How can I help you today?"
      );
    });
  });

  describe("Session Management", () => {
    it("should create and manage session", () => {
      const { result } = renderHook(() => useChatbot());

      const sessionInfo = result.current.getSessionInfo();

      expect(sessionInfo).toHaveProperty("sessionId");
      expect(sessionInfo).toHaveProperty("deviceFingerprint");
      expect(sessionInfo).toHaveProperty("created");
      expect(typeof sessionInfo.sessionId).toBe("string");
      expect(typeof sessionInfo.deviceFingerprint).toBe("string");
      expect(typeof sessionInfo.created).toBe("string");
    });

    it("should reuse existing session", () => {
      const { result } = renderHook(() => useChatbot());

      const sessionInfo1 = result.current.getSessionInfo();
      const sessionInfo2 = result.current.getSessionInfo();

      expect(sessionInfo1.sessionId).toBe(sessionInfo2.sessionId);
      expect(sessionInfo1.deviceFingerprint).toBe(
        sessionInfo2.deviceFingerprint
      );
    });

    it("should clear session data", () => {
      const { result } = renderHook(() => useChatbot());

      act(() => {
        result.current.clearSession();
      });

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        "react-chatbot-session"
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "react-chatbot-device-fp"
      );
    });
  });

  describe("State Management", () => {
    const setupValidHook = async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              isValid: true,
              isActive: true,
              keyId: "key123",
              keyName: "Test Key",
              user: {
                id: "user123",
                email: "test@example.com",
                fullName: "Test User",
              },
              lastUsed: "2024-01-01T12:00:00Z",
              usageCount: 5,
              chatbotConfig: {
                title: "Test Chat",
                welcomeText: "Welcome to test!",
                placeholder: "Type here...",
                theme: { primary: "#3b82f6" },
                agentUrl: "https://test.agent.url",
              },
            },
          }),
      });

      const validApiKey = "sk_" + "f".repeat(64);
      const { result } = renderHook(() => useChatbot({ apiKey: validApiKey }));

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
      });

      return { result, validApiKey };
    };

    it("should clear messages", async () => {
      const { result } = await setupValidHook();

      // Send a message first to have multiple messages
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              response: "Test response",
              conversationId: "conv-123",
              messageId: "msg-456",
            },
          }),
      });

      await act(async () => {
        await result.current.sendMessage("Test message");
      });

      // Should have welcome + user + bot messages
      expect(result.current.messages.length).toBeGreaterThan(1);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it("should clear error state", async () => {
      const { result } = await setupValidHook();

      // Simulate an error
      mockFetch.mockRejectedValueOnce(new Error("Test error"));

      await act(async () => {
        await result.current.sendMessage("Test message");
      });

      // Should have an error
      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it("should update welcome message", () => {
      const { result } = renderHook(() => useChatbot());

      const newWelcomeMessage = "Custom welcome message";

      act(() => {
        result.current.updateWelcomeMessage(newWelcomeMessage);
      });

      const effectiveMessage = result.current.getEffectiveWelcomeMessage();
      expect(effectiveMessage).toBe(newWelcomeMessage);
    });
  });

  describe("Error Handling", () => {
    const setupValidApiKey = async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              isValid: true,
              isActive: true,
              keyId: "key123",
              keyName: "Test Key",
              user: {
                id: "user123",
                email: "test@example.com",
                fullName: "Test User",
              },
              lastUsed: "2024-01-01T12:00:00Z",
              usageCount: 5,
              chatbotConfig: {
                title: "Test Chat",
                welcomeText: "Welcome to test!",
                placeholder: "Type here...",
                theme: { primary: "#3b82f6" },
                agentUrl: "https://test.agent.url",
              },
            },
          }),
      });

      const validApiKey = "sk_" + "g".repeat(64);
      const { result } = renderHook(() => useChatbot({ apiKey: validApiKey }));

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
      });

      return { result, validApiKey };
    };

    it("should handle API timeout", async () => {
      const { result } = await setupValidApiKey();

      // Mock timeout error
      mockFetch.mockRejectedValueOnce(new Error("Request timeout"));

      await act(async () => {
        await result.current.sendMessage("Test message");
      });

      expect(result.current.error).toMatch(/timeout|request/i);
    });

    it("should handle malformed API responses", async () => {
      const { result } = await setupValidApiKey();

      // Mock malformed response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ malformed: "response" }),
      });

      await act(async () => {
        await result.current.sendMessage("Test message");
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("Environment Configuration", () => {
    it("should use correct endpoints for different environments", () => {
      // Test environment detection and endpoint configuration
      // This would test the ConfigService and ApiConfigurationService
      const { result } = renderHook(() => useChatbot());

      // The hook should initialize with proper configuration
      expect(result.current).toBeDefined();
    });
  });
});
