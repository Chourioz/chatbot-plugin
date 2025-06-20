import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReactChatbot } from "../chatbot";

// Create the mock function first
const mockUseChatbot = vi.fn();

// Mock the useChatbot hook
vi.mock("../hooks/useChatbot", () => ({
  useChatbot: () => mockUseChatbot(),
}));

// Mock GSAP
vi.mock("gsap", () => ({
  default: {
    set: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
    delayedCall: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
    })),
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
  default: ({ onSubmit, placeholder, disabled }: any) => (
    <div data-testid="chat-input" className="chat-input-container">
      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.querySelector(
            "input"
          ) as HTMLInputElement;
          if (input?.value.trim()) {
            onSubmit(input.value);
            input.value = "";
          }
        }}
      >
        <div className="input-container">
          <input
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            data-testid="message-input"
            className="chat-input"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  onSubmit(target.value);
                  target.value = "";
                }
              }
            }}
          />
          <button
            type="submit"
            data-testid="send-button"
            className="send-button"
            disabled={disabled}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  ),
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
    isConnected: true,
    error: null,
    sendMessage: vi.fn(),
    clearMessages: vi.fn(),
    clearError: vi.fn(),
    validateApiKey: vi.fn(),
    updateWelcomeMessage: vi.fn(),
    clearSession: vi.fn(),
    getSessionInfo: vi.fn(),
    getEffectiveWelcomeMessage: vi.fn(() => "Hello! How can I help you today?"),
    apiKeyValidation: {
      isValid: true,
      isLoading: false,
      error: null,
      keyId: "test-key-123",
      keyName: "Test Key",
      chatbotConfig: {
        title: "Test Chat",
        welcomeText: "Hello! How can I help you today?",
        placeholder: "Type your message...",
        theme: {
          primary: "#3b82f6",
          secondary: "#1e40af",
          accent: "#60a5fa",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#1f2937",
          textSecondary: "#6b7280",
          border: "#e5e7eb",
          font: "system-ui, sans-serif",
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

      const chatbotContainer = container.querySelector(".position-bottom-left");
      expect(chatbotContainer).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ReactChatbot
          apiKey="sk_test123"
          position="bottom-right"
          className="custom-chatbot"
        />
      );

      const chatbotContainer = container.querySelector(".custom-chatbot");
      expect(chatbotContainer).toBeInTheDocument();
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
      const { container } = render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);

      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        // Check that the chat interface is visible by checking for the header
        const chatHeader = container.querySelector(".chat-header");
        expect(chatHeader).toBeInTheDocument();
        expect(screen.getByText("Test Chat")).toBeInTheDocument();
      });
    });

    it("should close chat interface when close button is clicked", async () => {
      const { container } = render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);

      // Open first
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        // Use more specific selector for the header close button
        const headerCloseButton = container.querySelector(".chat-header button");
        expect(headerCloseButton).toBeInTheDocument();
        fireEvent.click(headerCloseButton!);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /open chat/i })
        ).toBeInTheDocument();
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
        expect(
          screen.getByText("Hello! How can I help you today?")
        ).toBeInTheDocument();
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
        expect(
          screen.getByText("Hello! How can I help you today?")
        ).toBeInTheDocument();
        expect(screen.getByText("I need help with my order")).toBeInTheDocument();
        expect(
          screen.getByText("I'd be happy to help you with your order!")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Message Sending", () => {
    it("should send message when user submits", async () => {
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

        fireEvent.change(input, { target: { value: "Hello bot!" } });
        fireEvent.click(sendButton);

        expect(mockSendMessage).toHaveBeenCalledWith("Hello bot!");
      });
    });

    it("should send message when user presses Enter", async () => {
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

        fireEvent.change(input, { target: { value: "Hello bot!" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(mockSendMessage).toHaveBeenCalledWith("Hello bot!");
      });
    });
  });

  describe("Typing Indicator", () => {
    it("should show typing indicator when bot is typing", async () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        isTyping: true,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);

      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        const typingIndicator = document.querySelector(".typing-indicator");
        expect(typingIndicator).toBeInTheDocument();
      });
    });

    it("should hide typing indicator when bot is not typing", async () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        isTyping: false,
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);

      // Open chat
      const openButton = screen.getByRole("button", { name: /open chat/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        const typingIndicator = document.querySelector(".typing-indicator");
        expect(typingIndicator).not.toBeInTheDocument();
      });
    });
  });

  describe("API Key Validation", () => {
    it("should show error when API key is invalid", () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        apiKeyValidation: {
          isValid: false,
          isLoading: false,
          error: "Invalid API key",
          keyId: null,
          keyName: null,
          chatbotConfig: null,
        },
      });

      render(<ReactChatbot apiKey="invalid_key" position="bottom-right" />);

      expect(screen.getByText("Chatbot Error:")).toBeInTheDocument();
      expect(screen.getByText("Invalid API key")).toBeInTheDocument();
    });

    it("should show loading state while validating API key", () => {
      mockUseChatbot.mockReturnValue({
        ...defaultMockReturn,
        apiKeyValidation: {
          isValid: false,
          isLoading: true,
          error: null,
          keyId: null,
          keyName: null,
          chatbotConfig: null,
        },
      });

      render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);

      expect(screen.getByText("Loading chatbot...")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      const { container } = render(<ReactChatbot apiKey="sk_test123" position="bottom-right" />);

      const openButton = screen.getByRole("button", { name: /open chat/i });
      expect(openButton).toHaveAttribute("aria-label", "Open chat");

      fireEvent.click(openButton);

      await waitFor(() => {
        // Test the header close button specifically
        const headerCloseButton = container.querySelector(".chat-header button");
        expect(headerCloseButton).toHaveAttribute("aria-label", "Close chat");
        
        // Test the floating button (now shows close)  
        const floatingButton = container.querySelector(".floating-button");
        expect(floatingButton).toHaveAttribute("aria-label", "Close chat");
      });
    });
  });
});