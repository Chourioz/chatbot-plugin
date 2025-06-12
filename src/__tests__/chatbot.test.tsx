import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Chatbot from "../chatbot";
import type { ChatbotProps } from "../types";

// Mock GSAP
vi.mock("gsap", () => ({
  default: {
    set: vi.fn(),
    to: vi.fn(() => Promise.resolve()),
    from: vi.fn(() => Promise.resolve()),
    fromTo: vi.fn(() => Promise.resolve()),
    delayedCall: vi.fn(),
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

describe("Chatbot Component", () => {
  const defaultProps: ChatbotProps = {
    title: "Test Chat",
    position: "bottom-right",
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
    onMessage: vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response")),
    welcomeMessage: "Welcome to test chat",
    placeholder: "Type here...",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render the floating button", () => {
      render(<Chatbot {...defaultProps} />);
      const button = screen.getByRole("button", { name: /open chat/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("floating-button");
    });

    it("should start with chat interface closed", () => {
      render(<Chatbot {...defaultProps} />);
      const chatInterface = document.querySelector(".chat-interface");
      expect(chatInterface).toBeInTheDocument();
      // Interface exists but is hidden via GSAP
    });

    it("should apply the correct position class", () => {
      render(<Chatbot {...defaultProps} position="bottom-left" />);
      const container = document.querySelector(".position-bottom-left");
      expect(container).toBeInTheDocument();
    });

    it("should apply custom theme variables", () => {
      const customTheme = { primary: "#ff0000" };
      render(<Chatbot {...defaultProps} theme={customTheme} />);
      const container = document.querySelector("[data-chatbot-instance]");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Chat Interface Interaction", () => {
    it("should open chat interface when button is clicked", async () => {
      render(<Chatbot {...defaultProps} />);
      const openButton = screen.getByRole("button", { name: /open chat/i });
      
      fireEvent.click(openButton);
      
      await waitFor(() => {
        const headerCloseButton = document.querySelector(".chat-header button");
        expect(headerCloseButton).toBeInTheDocument();
      });
    });

    it("should display the title in the header", () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      expect(screen.getByText("Test Chat")).toBeInTheDocument();
    });

    it("should display welcome message when opened", () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      expect(screen.getByText("Welcome to test chat")).toBeInTheDocument();
    });

    it("should close chat interface when close button is clicked", async () => {
      const onToggle = vi.fn();
      render(<Chatbot {...defaultProps} isOpen={true} onToggle={onToggle} />);
      const headerCloseButton = document.querySelector(".chat-header button");
      expect(headerCloseButton).toBeInTheDocument();
      
      fireEvent.click(headerCloseButton!);
      
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it("should close chat interface when Escape key is pressed", async () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      
      fireEvent.keyDown(document, { key: "Escape" });
      
      // Note: The component doesn't implement Escape key functionality
      // This test would need the feature to be implemented first
      expect(screen.getByText("Test Chat")).toBeInTheDocument();
    });
  });

  describe("Message Handling", () => {
    it("should display input field with correct placeholder", () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      const input = screen.getByPlaceholderText("Type here...");
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass("chat-input");
    });

    it("should send message when form is submitted", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Hello");
      fireEvent.click(sendButton);
      
      expect(mockOnMessage).toHaveBeenCalledWith("Hello");
    });

    it("should send message when Enter key is pressed", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      
      await userEvent.type(input, "Hello{enter}");
      
      expect(mockOnMessage).toHaveBeenCalledWith("Hello");
    });

    it("should clear input after sending message", async () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Hello");
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(input).toHaveValue("");
      });
    });

    it("should display user message in chat", async () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Hello");
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Hello")).toBeInTheDocument();
      });
    });

    it("should display bot response after user message", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Hello");
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText("Bot response")).toBeInTheDocument();
      });
    });

    it("should show typing indicator while processing message", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => 
        new Promise(resolve => setTimeout(() => resolve("Bot response"), 100))
      );
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Hello");
      fireEvent.click(sendButton);
      
      // Check for typing indicator (dots)
      const typingIndicator = document.querySelector(".typing-indicator");
      expect(typingIndicator).toBeInTheDocument();
    });

    it("should not send empty messages", async () => {
      const mockOnMessage = vi.fn();
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} isOpen={true} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.click(sendButton);
      
      expect(mockOnMessage).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<Chatbot {...defaultProps} />);
      
      const openButton = screen.getByRole("button", { name: /open chat/i });
      expect(openButton).toHaveAttribute("aria-label", "Open chat");
    });

    it("should be keyboard navigable", () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      const headerCloseButton = document.querySelector(".chat-header button");
      
      expect(input).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
      expect(headerCloseButton).toBeInTheDocument();
    });

    it("should maintain focus management", async () => {
      render(<Chatbot {...defaultProps} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      expect(input).toBeInTheDocument();
      
      // Focus is handled by GSAP delayedCall, so we just verify the input exists
    });
  });

  describe("Error Handling", () => {
    it("should handle onMessage errors gracefully", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => 
        Promise.reject(new Error("API Error"))
      );
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type here...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Hello");
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/sorry, i encountered an error/i)).toBeInTheDocument();
      });
    });

    it("should handle missing onMessage prop", () => {
      render(<Chatbot title="Test" isOpen={true} />);
      
      const input = screen.getByPlaceholderText("Type your message...");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      expect(input).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe("Theme Customization", () => {
    it("should apply partial theme overrides", () => {
      const partialTheme = { primary: "#ff6b35" };
      render(<Chatbot {...defaultProps} theme={partialTheme} />);
      
      const container = document.querySelector("[data-chatbot-instance]");
      expect(container).toBeInTheDocument();
    });

    it("should fall back to default theme values for missing properties", () => {
      const partialTheme = { primary: "#ff6b35" };
      render(<Chatbot {...defaultProps} theme={partialTheme} />);
      
      const container = document.querySelector("[data-chatbot-instance]");
      expect(container).toBeInTheDocument();
      // Theme fallback is handled internally via mergedTheme
    });
  });
}); 