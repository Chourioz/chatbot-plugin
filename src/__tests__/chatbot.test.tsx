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
    title: "Test Chatbot",
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
    welcomeMessage: "Hello! How can I help you?",
    placeholder: "Type your message...",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render the floating button", () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("floating-button");
    });

    it("should start with chat interface closed", () => {
      render(<Chatbot {...defaultProps} />);
      
      const chatInterface = screen.queryByTestId("chat-interface");
      expect(chatInterface).not.toBeInTheDocument();
    });

    it("should apply the correct position class", () => {
      render(<Chatbot {...defaultProps} position="bottom-left" />);
      
      const container = screen.getByTestId("chatbot-container") || 
                      screen.getByText("Test Chatbot").closest('[class*="position"]');
      expect(container).toHaveClass("position-bottom-left");
    });

    it("should apply custom theme variables", () => {
      const customTheme = {
        primary: "#ff0000",
        secondary: "#00ff00",
        accent: "#0000ff",
      };
      
      render(<Chatbot {...defaultProps} theme={customTheme} />);
      
      const container = screen.getByTestId("chatbot-container");
      expect(container).toHaveStyle({
        "--chatbot-primary": "#ff0000",
        "--chatbot-secondary": "#00ff00",
        "--chatbot-accent": "#0000ff",
      });
    });
  });

  describe("Chat Interface Interaction", () => {
    it("should open chat interface when button is clicked", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const chatInterface = await screen.findByTestId("chat-interface");
      expect(chatInterface).toBeInTheDocument();
    });

    it("should display the title in the header", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const title = await screen.findByText("Test Chatbot");
      expect(title).toBeInTheDocument();
    });

    it("should display welcome message when opened", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const welcomeMessage = await screen.findByText("Hello! How can I help you?");
      expect(welcomeMessage).toBeInTheDocument();
    });

    it("should close chat interface when close button is clicked", async () => {
      render(<Chatbot {...defaultProps} />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(openButton);
      
      // Verify it's open
      const title = await screen.findByText("Test Chatbot");
      expect(title).toBeInTheDocument();
      
      // Close chat
      const closeButton = screen.getByRole("button", { name: "Close chat" });
      await userEvent.click(closeButton);
      
      // Verify button changed back to "Open chat"
      await waitFor(() => {
        const openButtonAgain = screen.getByRole("button", { name: "Open chat" });
        expect(openButtonAgain).toBeInTheDocument();
      });
    });

    it("should close chat interface when Escape key is pressed", async () => {
      render(<Chatbot {...defaultProps} />);
      
      // Open chat
      const openButton = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(openButton);
      
      // Verify it's open
      const title = await screen.findByText("Test Chatbot");
      expect(title).toBeInTheDocument();
      
      // Press Escape
      fireEvent.keyDown(document, { key: "Escape" });
      
      // Verify it's closed
      await waitFor(() => {
        const openButtonAgain = screen.getByRole("button", { name: "Open chat" });
        expect(openButtonAgain).toBeInTheDocument();
      });
    });
  });

  describe("Message Handling", () => {
    it("should display input field with correct placeholder", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      expect(input).toBeInTheDocument();
    });

    it("should send message when form is submitted", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      const sendButton = screen.getByRole("button", { name: "Send message" });
      
      await userEvent.type(input, "Hello bot");
      await userEvent.click(sendButton);
      
      expect(mockOnMessage).toHaveBeenCalledWith("Hello bot");
    });

    it("should send message when Enter key is pressed", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      expect(mockOnMessage).toHaveBeenCalledWith("Hello bot");
    });

    it("should clear input after sending message", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      await waitFor(() => {
        expect(input).toHaveValue("");
      });
    });

    it("should display user message in chat", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      const userMessage = await screen.findByText("Hello bot");
      expect(userMessage).toBeInTheDocument();
    });

    it("should display bot response after user message", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      const botResponse = await screen.findByText("Bot response");
      expect(botResponse).toBeInTheDocument();
    });

    it("should show typing indicator while processing message", async () => {
      const mockOnMessage = vi.fn(() => new Promise(resolve => setTimeout(() => resolve("Bot response"), 100)));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      const typingIndicator = await screen.findByTestId("typing-indicator");
      expect(typingIndicator).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByTestId("typing-indicator")).not.toBeInTheDocument();
      });
    });

    it("should not send empty messages", async () => {
      const mockOnMessage = vi.fn().mockImplementation((_: string) => Promise.resolve("Bot response"));
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const sendButton = await screen.findByRole("button", { name: "Send message" });
      
      // Button should be disabled when input is empty
      expect(sendButton).toBeDisabled();
      
      await userEvent.click(sendButton);
      
      expect(mockOnMessage).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      expect(button).toHaveAttribute("aria-label");
      
      await userEvent.click(button);
      
      const input = await screen.findByRole("textbox");
      expect(input).toHaveAttribute("aria-label");
    });

    it("should be keyboard navigable", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      
      // Test tab navigation
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Test Enter key activation
      fireEvent.keyDown(button, { key: "Enter" });
      
      const chatInterface = await screen.findByTestId("chat-interface");
      expect(chatInterface).toBeInTheDocument();
    });

    it("should maintain focus management", async () => {
      render(<Chatbot {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByRole("textbox");
      expect(document.activeElement).toBe(input);
    });
  });

  describe("Error Handling", () => {
    it("should handle onMessage errors gracefully", async () => {
      const mockOnMessage = vi.fn().mockRejectedValue(new Error("API Error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      render(<Chatbot {...defaultProps} onMessage={mockOnMessage} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it("should handle missing onMessage prop", async () => {
      render(<Chatbot {...defaultProps} onMessage={undefined} />);
      
      const button = screen.getByRole("button", { name: "Open chat" });
      await userEvent.click(button);
      
      const input = await screen.findByPlaceholderText("Type your message...");
      
      await userEvent.type(input, "Hello bot");
      await userEvent.keyboard("{Enter}");
      
      // Should not crash and should clear input
      await waitFor(() => {
        expect(input).toHaveValue("");
      });
    });
  });

  describe("Theme Customization", () => {
    it("should apply partial theme overrides", () => {
      const partialTheme = {
        primary: "#custom-primary",
        secondary: "#custom-secondary",
      };
      
      render(<Chatbot {...defaultProps} theme={partialTheme} />);
      
      const container = screen.getByTestId("chatbot-container");
      expect(container).toHaveStyle({
        "--chatbot-primary": "#custom-primary",
        "--chatbot-secondary": "#custom-secondary",
      });
    });

    it("should fall back to default theme values for missing properties", () => {
      const partialTheme = {
        primary: "#custom-primary",
      };
      
      render(<Chatbot {...defaultProps} theme={partialTheme} />);
      
      const container = screen.getByTestId("chatbot-container");
      expect(container).toHaveStyle({
        "--chatbot-primary": "#custom-primary",
        "--chatbot-secondary": "#1e40af", // default value
      });
    });
  });
}); 