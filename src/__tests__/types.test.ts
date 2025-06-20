import { describe, it, expect } from "vitest";
import type {
  ChatMessage,
  ChatbotTheme,
  ChatbotProps,
  ServerChatbotConfig,
} from "../types";

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

describe("Type Definitions", () => {
  describe("ChatMessage Interface", () => {
    it("should have required properties", () => {
      const message: ChatMessage = {
        id: "msg-123",
        text: "Hello world",
        sender: "user",
        timestamp: new Date(),
      };

      expect(typeof message.id).toBe("string");
      expect(typeof message.text).toBe("string");
      expect(["user", "bot"]).toContain(message.sender);
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it("should accept bot sender type", () => {
      const message: ChatMessage = {
        id: "msg-456",
        text: "Bot response",
        sender: "bot",
        timestamp: new Date(),
      };

      expect(message.sender).toBe("bot");
    });

    it("should accept user sender type", () => {
      const message: ChatMessage = {
        id: "msg-789",
        text: "User message",
        sender: "user",
        timestamp: new Date(),
      };

      expect(message.sender).toBe("user");
    });

    it("should handle empty text", () => {
      const message: ChatMessage = {
        id: "msg-empty",
        text: "",
        sender: "user",
        timestamp: new Date(),
      };

      expect(message.text).toBe("");
    });

    it("should handle special characters in text", () => {
      const message: ChatMessage = {
        id: "msg-special",
        text: "Hello! @#$%^&*()_+{}|:<>?[]\\;'\".,/ 😀👍❤️",
        sender: "user",
        timestamp: new Date(),
      };

      expect(message.text).toContain("😀👍❤️");
    });
  });

  describe("ChatbotTheme Interface", () => {
    it("should have all required color properties", () => {
      const theme: ChatbotTheme = {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#e5e7eb",
        font: "system-ui, sans-serif",
      };

      expect(typeof theme.primary).toBe("string");
      expect(typeof theme.secondary).toBe("string");
      expect(typeof theme.accent).toBe("string");
      expect(typeof theme.background).toBe("string");
      expect(typeof theme.surface).toBe("string");
      expect(typeof theme.text).toBe("string");
      expect(typeof theme.textSecondary).toBe("string");
      expect(typeof theme.border).toBe("string");
      expect(typeof theme.font).toBe("string");
    });

    it("should accept hex color values", () => {
      const theme: ChatbotTheme = {
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

      expect(theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it("should accept rgb color values", () => {
      const theme: ChatbotTheme = {
        primary: "rgb(255, 107, 53)",
        secondary: "rgb(229, 81, 0)",
        accent: "rgb(255, 171, 145)",
        background: "rgb(255, 255, 255)",
        surface: "rgb(245, 245, 245)",
        text: "rgb(51, 51, 51)",
        textSecondary: "rgb(102, 102, 102)",
        border: "rgb(224, 224, 224)",
        font: "Arial, sans-serif",
      };

      expect(theme.primary).toContain("rgb(");
      expect(theme.secondary).toContain("rgb(");
    });

    it("should accept various font family formats", () => {
      const theme: ChatbotTheme = {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#e5e7eb",
        font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      };

      expect(theme.font).toContain("Helvetica");
    });
  });

  describe("Position Type", () => {
    it("should accept valid position values", () => {
      const positions: Position[] = [
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
      ];

      positions.forEach((position) => {
        const testPosition: Position = position;
        expect([
          "bottom-right",
          "bottom-left",
          "top-right",
          "top-left",
        ]).toContain(testPosition);
      });
    });

    it("should work with bottom positions", () => {
      const bottomRight: Position = "bottom-right";
      const bottomLeft: Position = "bottom-left";

      expect(bottomRight).toBe("bottom-right");
      expect(bottomLeft).toBe("bottom-left");
    });

    it("should work with top positions", () => {
      const topRight: Position = "top-right";
      const topLeft: Position = "top-left";

      expect(topRight).toBe("top-right");
      expect(topLeft).toBe("top-left");
    });
  });

  describe("ChatbotProps Interface", () => {
    it("should have required properties", () => {
      const props: ChatbotProps = {
        apiKey: "sk_test123",
        position: "bottom-right",
      };

      expect(typeof props.apiKey).toBe("string");
      expect(typeof props.position).toBe("string");
    });

    it("should allow optional className", () => {
      const propsWithClass: ChatbotProps = {
        apiKey: "sk_test123",
        position: "bottom-right",
        className: "custom-chatbot",
      };

      expect(propsWithClass.className).toBe("custom-chatbot");
    });

    it("should work without optional properties", () => {
      const minimalProps: ChatbotProps = {
        apiKey: "sk_test123",
        position: "bottom-right",
      };

      expect(minimalProps.apiKey).toBeDefined();
      expect(minimalProps.position).toBeDefined();
      expect(minimalProps.className).toBeUndefined();
    });

    it("should accept all position values", () => {
      const positions: Position[] = [
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
      ];

      positions.forEach((position) => {
        const props: ChatbotProps = {
          apiKey: "sk_test123",
          position,
        };

        expect(props.position).toBe(position);
      });
    });
  });

  describe("ServerChatbotConfig Interface", () => {
    it("should have all required properties", () => {
      const config: ServerChatbotConfig = {
        title: "Test Chat",
        welcomeText: "Welcome to our chat!",
        placeholder: "Type your message...",
        agentUrl: "https://api.example.com/chat",
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
      };

      expect(typeof config.title).toBe("string");
      expect(typeof config.welcomeText).toBe("string");
      expect(typeof config.placeholder).toBe("string");
      expect(typeof config.agentUrl).toBe("string");
      expect(typeof config.theme).toBe("object");
    });

    it("should work with partial theme", () => {
      const config: ServerChatbotConfig = {
        title: "Test Chat",
        welcomeText: "Welcome!",
        placeholder: "Type here...",
        agentUrl: "https://api.example.com/chat",
        theme: {
          primary: "#ff6b35",
          secondary: "#e55100",
          accent: "#ffab91",
          background: "#ffffff",
          surface: "#f5f5f5",
          text: "#333333",
          textSecondary: "#666666",
          border: "#e0e0e0",
          font: "Arial, sans-serif",
        },
      };

      expect(config.theme?.primary).toBe("#ff6b35");
      expect(config.theme?.font).toBe("Arial, sans-serif");
    });

    it("should accept valid URLs", () => {
      const config: ServerChatbotConfig = {
        title: "Test",
        welcomeText: "Welcome",
        placeholder: "Type...",
        agentUrl: "https://secure-api.example.com/v1/chat/agent",
        theme: {
          primary: "#3b82f6",
          secondary: "#1e40af",
          accent: "#60a5fa",
          background: "#ffffff",
          surface: "#f8fafc",
          text: "#1f2937",
          textSecondary: "#6b7280",
          border: "#e5e7eb",
          font: "system-ui",
        },
      };

      expect(config.agentUrl).toMatch(/^https?:\/\//);
    });

    it("should handle empty strings", () => {
      const config: ServerChatbotConfig = {
        title: "",
        welcomeText: "",
        placeholder: "",
        agentUrl: "",
        theme: {
          primary: "",
          secondary: "",
          accent: "",
          background: "",
          surface: "",
          text: "",
          textSecondary: "",
          border: "",
          font: "",
        },
      };

      expect(config.title).toBe("");
      expect(config.theme?.primary).toBe("");
    });
  });

  describe("Type Compatibility", () => {
    it("should allow ChatbotTheme to be used in ServerChatbotConfig", () => {
      const theme: ChatbotTheme = {
        primary: "#3b82f6",
        secondary: "#1e40af",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#e5e7eb",
        font: "system-ui, sans-serif",
      };

      const config: ServerChatbotConfig = {
        title: "Test",
        welcomeText: "Welcome",
        placeholder: "Type...",
        agentUrl: "https://api.example.com",
        theme,
      };

      expect(config.theme).toBe(theme);
    });

    it("should allow Position to be used in ChatbotProps", () => {
      const position: Position = "bottom-right";

      const props: ChatbotProps = {
        apiKey: "sk_test123",
        position,
      };

      expect(props.position).toBe(position);
    });

    it("should handle message creation with current timestamp", () => {
      const now = new Date();
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        text: "Test message",
        sender: "user",
        timestamp: now,
      };

      expect(message.timestamp).toBe(now);
      expect(message.id).toMatch(/^msg-\d+$/);
    });
  });

  describe("Edge Cases and Validation", () => {
    it("should handle very long text in messages", () => {
      const longText = "A".repeat(10000);
      const message: ChatMessage = {
        id: "msg-long",
        text: longText,
        sender: "user",
        timestamp: new Date(),
      };

      expect(message.text.length).toBe(10000);
    });

    it("should handle unicode characters", () => {
      const message: ChatMessage = {
        id: "msg-unicode",
        text: "Hello 世界 🌍 مرحبا здравствуй",
        sender: "user",
        timestamp: new Date(),
      };

      expect(message.text).toContain("世界");
      expect(message.text).toContain("🌍");
      expect(message.text).toContain("مرحبا");
      expect(message.text).toContain("здравствуй");
    });

    it("should handle newlines and special whitespace", () => {
      const message: ChatMessage = {
        id: "msg-newlines",
        text: "Line 1\nLine 2\r\nLine 3\tTabbed",
        sender: "user",
        timestamp: new Date(),
      };

      expect(message.text).toContain("\n");
      expect(message.text).toContain("\r\n");
      expect(message.text).toContain("\t");
    });

    it("should handle CSS color formats", () => {
      const theme: ChatbotTheme = {
        primary: "hsl(220, 100%, 50%)",
        secondary: "rgba(255, 0, 0, 0.5)",
        accent: "var(--custom-color)",
        background: "transparent",
        surface: "inherit",
        text: "currentColor",
        textSecondary: "#666",
        border: "red",
        font: "inherit",
      };

      expect(theme.primary).toContain("hsl(");
      expect(theme.secondary).toContain("rgba(");
      expect(theme.accent).toContain("var(");
      expect(theme.background).toBe("transparent");
      expect(theme.surface).toBe("inherit");
    });

    it("should handle complex font families", () => {
      const theme: ChatbotTheme = {
        primary: "#000",
        secondary: "#000",
        accent: "#000",
        background: "#fff",
        surface: "#fff",
        text: "#000",
        textSecondary: "#666",
        border: "#ccc",
        font: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      };

      expect(theme.font).toContain("SF Pro Display");
      expect(theme.font).toContain("-apple-system");
    });
  });
});
