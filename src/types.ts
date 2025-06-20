export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface ChatbotTheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
  font?: string;
}

export interface ServerChatbotConfig {
  title?: string;
  welcomeText?: string;
  placeholder?: string;
  agentUrl?: string;
  theme?: ChatbotTheme;
  systemPrompt?: string;
}

export interface ChatbotConfig {
  title?: string;
  welcomeMessage?: string;
  placeholder?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: ChatbotTheme;
  apiKey?: string;
  onMessage?: (message: string, apiKey?: string) => Promise<string>;
  enableSound?: boolean;
  className?: string;
  maxMessages?: number;
  showTypingIndicator?: boolean;
}

export interface ChatbotProps {
  apiKey: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export type MessageHandler = (
  message: string,
  apiKey?: string
) => Promise<string>;

export interface FloatingPosition {
  bottom?: string;
  right?: string;
  top?: string;
  left?: string;
}
