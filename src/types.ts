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
  agentUrl?: string;
}

export interface ChatbotConfig {
  title?: string;
  welcomeMessage?: string;
  placeholder?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: ChatbotTheme;
  apiKey?: string;
  onMessage?: (message: string, apiKey?: string) => Promise<string>;
  maxMessages?: number;
  showTypingIndicator?: boolean;
  enableSound?: boolean;
}

export interface ChatbotProps extends ChatbotConfig {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
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
