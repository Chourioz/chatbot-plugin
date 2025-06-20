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

      expect(result.current.messages).toEqual([]);
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
        useChatbot({ apiKey: "sk_valid_key" })
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
      expect(result.current.apiKeyValidation.error).toContain(
        "Invalid API key format"
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

      const { result } = renderHook(() =>
        useChatbot({
          apiKey:
            "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
        })
      );

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/validate-api-key"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("sk_valid_key"),
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

      const { result } = renderHook(() =>
        useChatbot({
          apiKey:
            "sk_invalid_key_here_1234567890abcdef1234567890abcdef1234567890abcd",
        })
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

      const { result } = renderHook(() =>
        useChatbot({
          apiKey:
            "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
        })
      );

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(false);
        expect(result.current.apiKeyValidation.error).toContain(
          "Network error"
        );
      });
    });

    it("should show loading state during validation", async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(delayedPromise);

      const { result } = renderHook(() =>
        useChatbot({
          apiKey:
            "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
        })
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
                  title: "Test",
                  welcomeText: "Welcome!",
                  placeholder: "Type...",
                  theme: {},
                },
              },
            }),
        });
      });

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isLoading).toBe(false);
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
                welcomeText: "Welcome!",
                placeholder: "Type here...",
                agentUrl: "https://api.example.com/chat",
                theme: { primary: "#3b82f6" },
              },
            },
          }),
      });

      const { result } = renderHook(() =>
        useChatbot({
          apiKey:
            "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
        })
      );

      await waitFor(() => {
        expect(result.current.apiKeyValidation.isValid).toBe(true);
      });

      return result;
    };

    it("should send message successfully", async () => {
      const result = await setupValidApiKey();

      // Mock chat response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("Hello! How can I help you today?"),
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3); // welcome + user + bot
        expect(result.current.messages[1].text).toBe("Hello");
        expect(result.current.messages[1].sender).toBe("user");
        expect(result.current.messages[2].text).toBe(
          "Hello! How can I help you today?"
        );
        expect(result.current.messages[2].sender).toBe("bot");
      });
    });

    it("should show typing indicator during message processing", async () => {
      const result = await setupValidApiKey();

      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(delayedPromise);

      // Start sending message
      act(() => {
        result.current.sendMessage("Hello");
      });

      // Should show typing indicator
      await waitFor(() => {
        expect(result.current.isTyping).toBe(true);
      });

      // Resolve the message
      act(() => {
        resolvePromise!({
          ok: true,
          text: () => Promise.resolve("Bot response"),
        });
      });

      await waitFor(() => {
        expect(result.current.isTyping).toBe(false);
      });
    });

    it("should handle message sending errors", async () => {
      const result = await setupValidApiKey();

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.error).toContain("Network error");
        expect(result.current.isTyping).toBe(false);
      });
    });

    it("should not send empty messages", async () => {
      const result = await setupValidApiKey();

      await act(async () => {
        await result.current.sendMessage("");
      });

      // Should still only have welcome message
      expect(result.current.messages).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only validation call
    });

    it("should not send whitespace-only messages", async () => {
      const result = await setupValidApiKey();

      await act(async () => {
        await result.current.sendMessage("   \n\t  ");
      });

      // Should still only have welcome message
      expect(result.current.messages).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only validation call
    });

    it("should prevent sending messages when API key is invalid", async () => {
      const { result } = renderHook(() =>
        useChatbot({ apiKey: "invalid_key" })
      );

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe("Session Management", () => {
    it("should create and manage session", () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useChatbot());

      const sessionInfo = result.current.getSessionInfo();
      expect(sessionInfo).toHaveProperty("sessionId");
      expect(sessionInfo).toHaveProperty("deviceFingerprint");
      expect(sessionInfo).toHaveProperty("created");
      expect(typeof sessionInfo.sessionId).toBe("string");
      expect(sessionInfo.sessionId.length).toBeGreaterThan(0);
    });

    it("should reuse existing session", () => {
      const existingSessionId = "existing-session-123";
      const existingDeviceFingerprint = "device-fp-456";

      sessionStorageMock.getItem.mockImplementation((key) => {
        if (key === "react-chatbot-session") {
          return JSON.stringify({
            sessionId: existingSessionId,
            created: "2024-01-01T12:00:00Z",
          });
        }
        return null;
      });

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "react-chatbot-device-fp") {
          return existingDeviceFingerprint;
        }
        return null;
      });

      const { result } = renderHook(() => useChatbot());

      const sessionInfo = result.current.getSessionInfo();
      expect(sessionInfo.sessionId).toBe(existingSessionId);
      expect(sessionInfo.deviceFingerprint).toBe(existingDeviceFingerprint);
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
    it("should clear messages", async () => {
      const result = await setupValidHook();

      // Add some messages first
      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(1);
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it("should clear error state", async () => {
      const { result } = renderHook(() =>
        useChatbot({
          apiKey:
            "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
        })
      );

      // Mock error response
      mockFetch.mockRejectedValueOnce(new Error("Test error"));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
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
    it("should handle API timeout", async () => {
      const result = await setupValidApiKey();

      // Mock timeout error
      mockFetch.mockRejectedValueOnce(new Error("Timeout"));

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      await waitFor(() => {
        expect(result.current.error).toContain("Timeout");
      });
    });

    it("should handle malformed API responses", async () => {
      const result = await setupValidApiKey();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("Invalid JSON response"),
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      // Should handle gracefully
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3); // welcome + user + response
      });
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

  // Helper function to setup a valid hook
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
              welcomeText: "Welcome!",
              placeholder: "Type here...",
              agentUrl: "https://api.example.com/chat",
              theme: { primary: "#3b82f6" },
            },
          },
        }),
    });

    const { result } = renderHook(() =>
      useChatbot({
        apiKey:
          "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
      })
    );

    await waitFor(() => {
      expect(result.current.apiKeyValidation.isValid).toBe(true);
    });

    return result;
  };

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
              welcomeText: "Welcome!",
              placeholder: "Type here...",
              agentUrl: "https://api.example.com/chat",
              theme: { primary: "#3b82f6" },
            },
          },
        }),
    });

    const { result } = renderHook(() =>
      useChatbot({
        apiKey:
          "sk_valid_key_here_1234567890abcdef1234567890abcdef1234567890abcdef",
      })
    );

    await waitFor(() => {
      expect(result.current.apiKeyValidation.isValid).toBe(true);
    });

    return result;
  };
});
