// Main exports
export { ReactChatbot as default } from "./chatbot";
export { ReactChatbot } from "./chatbot";

// Type exports
export type {
  ChatMessage,
  ChatbotTheme,
  ChatbotConfig,
  ChatbotProps,
  MessageHandler,
  FloatingPosition,
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
    return ["title", "theme", "position", "welcome-message", "placeholder"];
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
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }

  private updateConfig() {
    this.config = {
      title: this.getAttribute("title") || undefined,
      welcomeMessage: this.getAttribute("welcome-message") || undefined,
      placeholder: this.getAttribute("placeholder") || undefined,
      position: (this.getAttribute("position") as any) || "bottom-right",
      theme: this.getAttribute("theme")
        ? JSON.parse(this.getAttribute("theme")!)
        : undefined,
      onMessage: this.onMessage?.bind(this),
    };
  }

  private async onMessage(message: string): Promise<string> {
    // Dispatch custom event for message handling
    const event = new CustomEvent("chatbot-message", {
      detail: { message },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);

    // Return a default response if no handler is attached
    return "I received your message: " + message;
  }

  private render() {
    if (!this.shadowRoot) return;

    // Create container
    const container = document.createElement("div");
    this.shadowRoot.innerHTML = "";

    // Add Tailwind styles (inline for Shadow DOM)
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://cdn.tailwindcss.com');
      :host {
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
