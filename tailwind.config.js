import tailwindcss from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  // For Tailwind 4, we use @import in CSS instead of content paths
  theme: {
    extend: {
      colors: {
        "chatbot-primary": "var(--chatbot-primary, #3b82f6)",
        "chatbot-secondary": "var(--chatbot-secondary, #1e40af)",
        "chatbot-accent": "var(--chatbot-accent, #60a5fa)",
        "chatbot-background": "var(--chatbot-background, #ffffff)",
        "chatbot-surface": "var(--chatbot-surface, #f8fafc)",
        "chatbot-text": "var(--chatbot-text, #1f2937)",
        "chatbot-text-secondary": "var(--chatbot-text-secondary, #6b7280)",
        "chatbot-border": "var(--chatbot-border, #e5e7eb)",
      },
      fontFamily: {
        chatbot: "var(--chatbot-font, system-ui, sans-serif)",
      },
      zIndex: {
        chatbot: "9999",
      },
    },
  },
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflicts in host applications
  },
};
