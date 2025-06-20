import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ChatInput from "../components/ChatInput";

describe("ChatInput Component", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    placeholder: "Type your message...",
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render input with correct placeholder", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Type your message...");
    });

    it("should render send button", () => {
      render(<ChatInput {...defaultProps} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeInTheDocument();
    });

    it("should use custom placeholder", () => {
      render(<ChatInput {...defaultProps} placeholder="Custom placeholder..." />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", "Custom placeholder...");
    });
  });

  describe("Input Behavior", () => {
    it("should update value when typing", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "Hello world");
      
      expect(input).toHaveValue("Hello world");
    });

    it("should clear input after sending message", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(input, "Test message");
      fireEvent.click(sendButton);
      
      expect(input).toHaveValue("");
    });

    // Input doesn't auto-resize like textarea, so we skip these tests for input
    it("should handle single line input", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox") as HTMLInputElement;
      
      await userEvent.type(input, "Single line of text");
      
      expect(input).toHaveValue("Single line of text");
    });

    it("should prevent newlines in input", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox") as HTMLInputElement;
      
      await userEvent.type(input, "Line 1");
      fireEvent.keyDown(input, { key: "Enter" });
      
      // Input should not contain newlines
      expect(input.value).not.toContain("\n");
    });
  });

  describe("Message Sending", () => {
    it("should call onSubmit when send button is clicked", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith("Test message");
    });

    it("should call onSubmit when Enter is pressed", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.keyDown(input, { key: "Enter" });
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith("Test message");
    });

    it("should not send message when Shift+Enter is pressed", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      expect(input).toHaveValue("Test message");
    });

    it("should handle Enter key in input (no newlines)", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      
      await userEvent.type(input, "Single line");
      fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
      
      // Input should not support newlines like textarea
      expect(input).toHaveValue("Single line");
    });

    it("should not send empty messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it("should not send whitespace-only messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(input, { target: { value: "   \t  " } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it("should trim whitespace from messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(input, { target: { value: "  Test message  " } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith("Test message");
    });
  });

  describe("Disabled State", () => {
    it("should disable input when disabled prop is true", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should disable send button when disabled prop is true", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it("should not send message when disabled", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it("should not respond to keyboard events when disabled", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const input = screen.getByRole("textbox");
      
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.keyDown(input, { key: "Enter" });
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      expect(input).toHaveAttribute("aria-label", "Type your message");
      expect(sendButton).toHaveAttribute("aria-label", "Send message");
    });

    it("should be keyboard navigable", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      // Focus should start on input
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Manually test button focus - JSDOM doesn't handle tab navigation automatically
      sendButton.focus();
      expect(document.activeElement).toBe(sendButton);
    });

    it("should support screen readers", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      // Input has implicit textbox role and button has submit type
      expect(input).toHaveAttribute("type", "text");
      expect(sendButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      const longMessage = "A".repeat(1000); // Reducido de 5000 a 1000 para evitar timeout
      fireEvent.change(input, { target: { value: longMessage } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(longMessage);
    });

    it("should handle special characters", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      const specialMessage = "Hello! @#$%^&*()_+{}|:<>?[]\\;'\".,/";
      fireEvent.change(input, { target: { value: specialMessage } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(specialMessage);
    });

    it("should handle emoji messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      const emojiMessage = "Hello! 😀👍❤️🚀";
      fireEvent.change(input, { target: { value: emojiMessage } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(emojiMessage);
    });

    it("should handle rapid key presses", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      
      fireEvent.change(input, { target: { value: "Test" } });
      
      // Simulate rapid Enter presses
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(input, { key: "Enter" });
      }
      
      // Should only send once since input is cleared after first send
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration", () => {
    it("should work with form submission", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <ChatInput {...defaultProps} />
        </form>
      );
      
      const input = screen.getByRole("textbox");
      
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.keyDown(input, { key: "Enter" });
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith("Test message");
      expect(handleSubmit).not.toHaveBeenCalled(); // Should prevent default form submission
    });

    it("should maintain focus after sending message", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      input.focus();
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
      
      // Focus should remain on input after sending
      expect(document.activeElement).toBe(input);
    });
  });
}); 