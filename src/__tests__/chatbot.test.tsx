import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ReactChatbot } from "../chatbot";
import type { ChatbotProps } from "../types";

// Mock GSAP completely
vi.mock("gsap", () => ({
  default: {
    set: vi.fn(),
    to: vi.fn(() => ({ kill: vi.fn() })),
    from: vi.fn(() => ({ kill: vi.fn() })),
    fromTo: vi.fn(() => ({ kill: vi.fn() })),
    delayedCall: vi.fn(() => ({ kill: vi.fn() })),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
    registerPlugin: vi.fn(),
    getById: vi.fn(() => null),
    killTweensOf: vi.fn(),
  },
}));

// Mock @gsap/react
vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn((callback) => {
    if (callback) callback();
    return { contextSafe: vi.fn((fn) => fn) };
  }),
}));

// Mock SplitType
vi.mock("split-type", () => ({
  default: vi.fn(() => ({
    chars: [],
    words: [],
    lines: [],
    revert: vi.fn(),
  })),
}));

// Mock the ChatInput component
vi.mock("../components/ChatInput", () => ({
  default: ({ onSendMessage, placeholder, disabled }: any) => (
    <div data-testid="chat-input">
      <input
        placeholder={placeholder}
        disabled={disabled}
        data-testid="message-input"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const target = e.target as HTMLInputElement;
            if (target.value.trim()) {
              onSendMessage(target.value);
              target.value = "";
            }
          }
        }}
      />
      <button
        data-testid="send-button"
        onClick={() => {
          const input = document.querySelector('[data-testid="message-input"]') as HTMLInputElement;
          if (input?.value.trim()) {
            onSendMessage(input.value);
            input.value = "";
          }
        }}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  ),
}));

// Mock the useChatbot hook
const mockUseChatbot = vi.fn();
vi.mock("../hooks/useChatbot", () => ({
  useChatbot: mockUseChatbot,
}));

describe("ReactChatbot Component", () => {
  const defaultMockReturn = {
    messages: [
      {
        id: "welcome-1",
        text: "Hello! How can I help you today?",
        sender: "bot" as const,
        timestamp: new Date("2024-01-01T12:00:00Z"),
      },
    ],
    isTyping: false,
    sendMessage: vi.fn(),
    apiKeyValidation: {
      isValid: true,
      isLoading: false,
      error: null,
      chatbotConfig: {
        title: "Test Chat",
        welcomeText: "Hello! How can I help you today?",
        placeholder: "Type your message...",
        theme: {
          primary: "#3b82f6",
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChatbot.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering and Basic Functionality", () => {
    it("should render floating button when closed", () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      const button = screen.getByRole("button", { name: /open chat/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("floating-button");
    });

    it("should apply correct position classes", () => {
      const { container } = render(
        <ReactChatbot apiKey="sk_test123" position="bottom-left" />
      );
      
      const chatbotContainer = container.querySelector(".chatbot-container");
      expect(chatbotContainer).toHaveClass("position-bottom-left");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ReactChatbot 
          apiKey="sk_test123" 
          position="bottom-right" 
          className="custom-chatbot" 
        />
      );
      
      const chatbotContainer = container.querySelector(".chatbot-container");
      expect(chatbotContainer).toHaveClass("custom-chatbot");
    });

    it("should start with chat interface closed", () => {
      const { container } = render(
        <ReactChatbot apiKey="sk_test123" position="bottom-right" />
      );
      
      const chatInterface = container.querySelector(".chat-interface");
      expect(chatInterface).toBeInTheDocument();
      // Interface should be hidden initially (via GSAP)
    });
  });

  describe("Chat Interface Interactions", () => {
    it("should open chat interface when floating button is clicked", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /close chat/i })).toBeInTheDocument();
      });
    });

    it("should close chat interface when close button is clicked", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open first
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: /close chat/i });
        fireEvent.click(closeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
      });
    });

    it("should close chat interface when Escape key is pressed", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open first
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /close chat/i })).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: "Escape" });
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
      });
    });
  });

  describe("Message Display", () => {
    it("should display welcome message", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText("Hello! How can I help you today?")).toBeInTheDocument();
      });
    });

    it("should display chat title in header", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText("Test Chat")).toBeInTheDocument();
      });
    });

    it("should display multiple messages with correct styling", async () => {
      const mockMessages = [
        {
          id: "welcome-1",
          text: "Hello! How can I help you today?",
          sender: "bot" as const,
          timestamp: new Date("2024-01-01T12:00:00Z"),
        },
        {
          id: "user-1",
          text: "I need help with my order",
          sender: "user" as const,
          timestamp: new Date("2024-01-01T12:01:00Z"),
        },
        {
          id: "bot-1",
          text: "I'd be happy to help you with your order!",
          sender: "bot" as const,
          timestamp: new Date("2024-01-01T12:01:30Z"),
        },
      ];

      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        messages: mockMessages,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        expect(screen.getByText("Hello! How can I help you today?")).toBeInTheDocument();
        expect(screen.getByText("I need help with my order")).toBeInTheDocument();
        expect(screen.getByText("I'd be happy to help you with your order!")).toBeInTheDocument();
      });
    });
  });

  describe("Message Sending", () => {
    it("should send message through ChatInput component", async () => {
      const mockSendMessage = vi.fn();
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        sendMessage: mockSendMessage,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const input = screen.getByTestId("message-input");
        const sendButton = screen.getByTestId("send-button");
        
        fireEvent.change(input, { target: { value: "Hello world" } });
        fireEvent.click(sendButton);
        
        expect(mockSendMessage).toHaveBeenCalledWith("Hello world");
      });
    });

    it("should send message on Enter key press", async () => {
      const mockSendMessage = vi.fn();
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        sendMessage: mockSendMessage,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const input = screen.getByTestId("message-input");
        
        fireEvent.change(input, { target: { value: "Hello world" } });
        fireEvent.keyDown(input, { key: "Enter" });
        
        expect(mockSendMessage).toHaveBeenCalledWith("Hello world");
      });
    });

    it("should not send empty messages", async () => {
      const mockSendMessage = vi.fn();
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        sendMessage: mockSendMessage,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const sendButton = screen.getByTestId("send-button");
        fireEvent.click(sendButton);
        
        expect(mockSendMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe("Typing Indicator", () => {
    it("should show typing indicator when isTyping is true", async () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        isTyping: true,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const typingIndicator = screen.getByTestId("typing-indicator");
        expect(typingIndicator).toBeInTheDocument();
      });
    });

    it("should hide typing indicator when isTyping is false", async () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        isTyping: false,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const typingIndicator = screen.queryByTestId("typing-indicator");
        expect(typingIndicator).not.toBeInTheDocument();
      });
    });
  });

  describe("Error States", () => {
    it("should display error banner when API key validation fails", () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        apiKeyValidation: {
          isValid: false,
          isLoading: false,
          error: "Invalid API Key",
          chatbotConfig: null,
        },
      });

      render(<ReactChatbot apiKey="invalid_key" position="bottom-right" />);
      
      expect(screen.getByText("Chatbot Error:")).toBeInTheDocument();
      expect(screen.getByText("Invalid API Key")).toBeInTheDocument();
    });

    it("should not render chat interface when API key is invalid", () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        apiKeyValidation: {
          isValid: false,
          isLoading: false,
          error: "Invalid API Key",
          chatbotConfig: null,
        },
      });

      render(<ReactChatbot apiKey="invalid_key" position="bottom-right" />);
      
      expect(screen.queryByRole("button", { name: /open chat/i })).not.toBeInTheDocument();
    });

    it("should show loading state during API key validation", () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        apiKeyValidation: {
          isValid: false,
          isLoading: true,
          error: null,
          chatbotConfig: null,
        },
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      expect(screen.getByText("Validating API Key...")).toBeInTheDocument();
    });
  });

  describe("Theme Customization", () => {
    it("should apply theme from API configuration", () => {
      const customTheme = {
        primary: "#ff6b35",
        secondary: "#e55100",
        accent: "#ffab91",
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#333333",
        textSecondary: "#666666",
        border: "#e0e0e0",
        font: "Arial, sans-serif",
      };

      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        apiKeyValidation: {
          isValid: true,
          isLoading: false,
          error: null,
          chatbotConfig: {
            title: "Custom Chat",
            welcomeText: "Welcome!",
            placeholder: "Type here...",
            theme: customTheme,
          },
        },
      });

      const { container } = render(
        <ReactChatbot apiKey="sk_test123" position="bottom-right" />
      );
      
      const chatbotContainer = container.querySelector(".chatbot-container");
      const style = chatbotContainer?.getAttribute("style");
      
      expect(style).toContain("--chatbot-primary: #ff6b35");
      expect(style).toContain("--chatbot-secondary: #e55100");
    });

    it("should use default theme when no theme is provided", () => {
      const { container } = render(
        <ReactChatbot apiKey="sk_test123" position="bottom-right" />
      );
      
      const chatbotContainer = container.querySelector(".chatbot-container");
      const style = chatbotContainer?.getAttribute("style");
      
      expect(style).toContain("--chatbot-primary: #3b82f6");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on buttons", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      const openButton = screen.getByRole("button", { name: /open chat/i });
      expect(openButton).toHaveAttribute("aria-label", "Open chat");
      
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: /close chat/i });
        expect(closeButton).toHaveAttribute("aria-label", "Close chat");
      });
    });

    it("should be keyboard navigable", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      const openButton = screen.getByRole("button", { name: /open chat/i });
      
      // Should be focusable
      openButton.focus();
      expect(document.activeElement).toBe(openButton);
      
      // Should open on Enter
      fireEvent.keyDown(openButton, { key: "Enter" });
      
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /close chat/i })).toBeInTheDocument();
      });
    });

    it("should maintain focus management when opening/closing", async () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      const openButton = screen.getByRole("button", { name: /open chat/i });
      openButton.focus();
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const messageInput = screen.getByTestId("message-input");
        expect(document.activeElement).toBe(messageInput);
      });
    });
  });

  describe("Position Variants", () => {
    const positions = [
      "bottom-right",
      "bottom-left", 
      "top-right",
      "top-left"
    ] as const;

    positions.forEach(position => {
      it(`should render correctly with position ${position}`, () => {
        const { container } = render(
          <ReactChatbot apiKey="sk_test123" position={position} />
        );
        
        const chatbotContainer = container.querySelector(".chatbot-container");
        expect(chatbotContainer).toHaveClass(`position-${position}`);
      });
    });
  });

  describe("Hook Integration", () => {
    it("should call useChatbot with correct parameters", () => {
      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);
      
      expect(mockUseChatbot).toHaveBeenCalledWith({
        apiKey: "sk_test123",
      });
    });

    it("should handle missing API key", () => {
      render(<ReactChatbot apiKey="" position="bottom-right" />);
      
      expect(mockUseChatbot).toHaveBeenCalledWith({
        apiKey: "",
      });
    });
  });
});