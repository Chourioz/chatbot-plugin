import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ChatInput from "../components/ChatInput";

describe("ChatInput Component", () => {
  const defaultProps = {
    onSendMessage: vi.fn(),
    placeholder: "Type your message...",
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render textarea with correct placeholder", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("placeholder", "Type your message...");
    });

    it("should render send button", () => {
      render(<ChatInput {...defaultProps} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeInTheDocument();
    });

    it("should use custom placeholder", () => {
      render(<ChatInput {...defaultProps} placeholder="Custom placeholder..." />);
      
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("placeholder", "Custom placeholder...");
    });
  });

  describe("Input Behavior", () => {
    it("should update value when typing", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Hello world");
      
      expect(textarea).toHaveValue("Hello world");
    });

    it("should clear input after sending message", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      await userEvent.type(textarea, "Test message");
      fireEvent.click(sendButton);
      
      expect(textarea).toHaveValue("");
    });

    it("should auto-resize textarea based on content", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      const initialHeight = textarea.style.height;
      
      await userEvent.type(textarea, "Line 1\nLine 2\nLine 3\nLine 4\nLine 5");
      
      // Height should have changed from initial
      expect(textarea.style.height).not.toBe(initialHeight);
    });

    it("should limit textarea height to maximum", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      
      // Type many lines to exceed max height
      const longText = Array(20).fill("This is a very long line of text").join("\n");
      await userEvent.type(textarea, longText);
      
      // Should not exceed 200px (max height)
      const height = parseInt(textarea.style.height);
      expect(height).toBeLessThanOrEqual(200);
    });
  });

  describe("Message Sending", () => {
    it("should call onSendMessage when send button is clicked", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("should call onSendMessage when Enter is pressed", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter" });
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("should not send message when Shift+Enter is pressed", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
      expect(textarea).toHaveValue("Test message");
    });

    it("should add new line when Shift+Enter is pressed", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      
      await userEvent.type(textarea, "Line 1");
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
      await userEvent.type(textarea, "Line 2");
      
      expect(textarea).toHaveValue("Line 1\nLine 2");
    });

    it("should not send empty messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });

    it("should not send whitespace-only messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(textarea, { target: { value: "   \n\t  " } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });

    it("should trim whitespace from messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(textarea, { target: { value: "  Test message  " } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith("Test message");
    });
  });

  describe("Disabled State", () => {
    it("should disable textarea when disabled prop is true", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });

    it("should disable send button when disabled prop is true", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const sendButton = screen.getByRole("button", { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it("should not send message when disabled", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });

    it("should not respond to keyboard events when disabled", () => {
      render(<ChatInput {...defaultProps} disabled={true} />);
      
      const textarea = screen.getByRole("textbox");
      
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter" });
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      expect(textarea).toHaveAttribute("aria-label", "Type your message");
      expect(sendButton).toHaveAttribute("aria-label", "Send message");
    });

    it("should be keyboard navigable", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      // Focus should start on textarea
      textarea.focus();
      expect(document.activeElement).toBe(textarea);
      
      // Tab should move to send button
      await userEvent.tab();
      expect(document.activeElement).toBe(sendButton);
    });

    it("should support screen readers", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      expect(textarea).toHaveAttribute("role", "textbox");
      expect(sendButton).toHaveAttribute("type", "button");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long messages", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      const longMessage = "A".repeat(5000);
      await userEvent.type(textarea, longMessage);
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith(longMessage);
    });

    it("should handle special characters", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      const specialMessage = "Hello! @#$%^&*()_+{}|:<>?[]\\;'\".,/";
      fireEvent.change(textarea, { target: { value: specialMessage } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith(specialMessage);
    });

    it("should handle emoji messages", () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      const emojiMessage = "Hello! 😀👍❤️🚀";
      fireEvent.change(textarea, { target: { value: emojiMessage } });
      fireEvent.click(sendButton);
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith(emojiMessage);
    });

    it("should handle rapid key presses", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      
      fireEvent.change(textarea, { target: { value: "Test" } });
      
      // Simulate rapid Enter presses
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(textarea, { key: "Enter" });
      }
      
      // Should only send once since input is cleared after first send
      expect(defaultProps.onSendMessage).toHaveBeenCalledTimes(1);
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
      
      const textarea = screen.getByRole("textbox");
      
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.keyDown(textarea, { key: "Enter" });
      
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith("Test message");
      expect(handleSubmit).not.toHaveBeenCalled(); // Should prevent default form submission
    });

    it("should maintain focus after sending message", async () => {
      render(<ChatInput {...defaultProps} />);
      
      const textarea = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: /send message/i });
      
      textarea.focus();
      fireEvent.change(textarea, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
      
      // Focus should remain on textarea after sending
      expect(document.activeElement).toBe(textarea);
    });
  });
}); 