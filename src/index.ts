// Main exports
export { ReactChatbot as default } from "./chatbot";
export { ReactChatbot } from "./chatbot";
export { useChatbot } from "./hooks/useChatbot";

// Type exports
export type {
  ChatMessage,
  ChatbotTheme,
  ChatbotConfig,
  ChatbotProps,
  MessageHandler,
  FloatingPosition,
  ServerChatbotConfig,
} from "./types";

// Create custom element for direct HTML usage
import React from "react";
import { createRoot } from "react-dom/client";
import { ReactChatbot } from "./chatbot";
import type { ChatbotConfig } from "./types";

class ReactChatbotElement extends HTMLElement {
  private root: any;
  private config: ChatbotConfig = {};

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [
      "title",
      "theme",
      "position",
      "welcome-message",
      "placeholder",
      "api-key",
      "max-messages",
      "show-typing-indicator",
      "enable-sound",
    ];
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateConfig();
      this.render();
    }
  }

  connectedCallback() {
    this.updateConfig();
    this.render();

    // Listen for external configuration updates
    this.addEventListener(
      "chatbot-config-update",
      this.handleConfigUpdate.bind(this) as EventListener
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
    this.removeEventListener(
      "chatbot-config-update",
      this.handleConfigUpdate.bind(this) as EventListener
    );
  }

  private handleConfigUpdate(event: Event) {
    const customEvent = event as CustomEvent;
    this.config = { ...this.config, ...customEvent.detail };
    this.render();
  }

  private updateConfig() {
    // Parse boolean attributes properly
    const getBooleanAttribute = (
      name: string,
      defaultValue: boolean = true
    ) => {
      const value = this.getAttribute(name);
      if (value === null) return defaultValue;
      return value !== "false" && value !== "0";
    };

    // Parse number attributes
    const getNumberAttribute = (name: string, defaultValue?: number) => {
      const value = this.getAttribute(name);
      if (value === null) return defaultValue;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    this.config = {
      title: this.getAttribute("title") || undefined,
      welcomeMessage: this.getAttribute("welcome-message") || undefined,
      placeholder: this.getAttribute("placeholder") || undefined,
      position: (this.getAttribute("position") as any) || "bottom-right",
      apiKey: this.getAttribute("api-key") || undefined,
      maxMessages: getNumberAttribute("max-messages", 100),
      showTypingIndicator: getBooleanAttribute("show-typing-indicator", true),
      enableSound: getBooleanAttribute("enable-sound", false),
      theme: this.getAttribute("theme")
        ? JSON.parse(this.getAttribute("theme")!)
        : undefined,
      onMessage: this.onMessage?.bind(this),
    };
  }

  private async onMessage(message: string, apiKey?: string): Promise<string> {
    // Dispatch custom event for message handling
    const event = new CustomEvent("chatbot-message", {
      detail: { message, apiKey },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    // Check if there's an external handler attached
    const handler = (this as any).messageHandler;
    if (handler && typeof handler === "function") {
      try {
        return await handler(message, apiKey);
      } catch (error) {
        console.error("Error in external message handler:", error);
      }
    }

    // Return a default response if no handler is attached
    return "I received your message: " + message;
  }

  // Public method to set message handler programmatically
  setMessageHandler(
    handler: (message: string, apiKey?: string) => Promise<string>
  ) {
    (this as any).messageHandler = handler;
  }

  // Public method to update configuration
  updateConfiguration(config: Partial<ChatbotConfig>) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    // Create container
    const container = document.createElement("div");
    this.shadowRoot.innerHTML = "";

    // Add comprehensive styles for Shadow DOM
    const style = document.createElement("style");
    style.textContent = `
      /* Import Tailwind via CDN for Shadow DOM compatibility */
      @import url('https://cdn.tailwindcss.com');
      
      :host {
        /* CSS Variables for theming */
        --chatbot-primary: ${this.config.theme?.primary || "#3b82f6"};
        --chatbot-secondary: ${this.config.theme?.secondary || "#1e40af"};
        --chatbot-accent: ${this.config.theme?.accent || "#60a5fa"};
        --chatbot-background: ${this.config.theme?.background || "#ffffff"};
        --chatbot-surface: ${this.config.theme?.surface || "#f8fafc"};
        --chatbot-text: ${this.config.theme?.text || "#1f2937"};
        --chatbot-text-secondary: ${
          this.config.theme?.textSecondary || "#6b7280"
        };
        --chatbot-border: ${this.config.theme?.border || "#e5e7eb"};
        --chatbot-font: ${this.config.theme?.font || "system-ui, sans-serif"};
        
        /* Ensure proper positioning */
        position: fixed;
        z-index: 999999;
        pointer-events: none;
      }
      
      :host > div {
        pointer-events: auto;
      }
      
      /* Ensure fonts are properly inherited */
      *, *::before, *::after {
        font-family: var(--chatbot-font);
      }
      
      /* Override any potential conflicts from host page */
      .chatbot-container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
    `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    // Create React root and render
    if (!this.root) {
      this.root = createRoot(container);
    }

    this.root.render(React.createElement(ReactChatbot, this.config));
  }
}

// Register custom element
if (typeof window !== "undefined" && !customElements.get("react-chatbot")) {
  customElements.define("react-chatbot", ReactChatbotElement);
}

// Global registration for direct script usage
if (typeof window !== "undefined") {
  (window as any).ReactChatbotComponent = {
    ReactChatbot,
    ReactChatbotElement,
    // Utility function for manual initialization
    init: (selector: string, config: ChatbotConfig) => {
      const element = document.querySelector(selector) as ReactChatbotElement;
      if (element && element.updateConfiguration) {
        element.updateConfiguration(config);
      }
    },
  };
}
