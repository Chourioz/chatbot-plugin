import React, { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { ChatbotProps, ChatMessage, ChatbotTheme } from "./types";

// Default theme values
const defaultTheme: ChatbotTheme = {
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

export const ReactChatbot: React.FC<ChatbotProps> = ({
  title = "Chat Assistant",
  welcomeMessage = "Hello! How can I help you today?",
  placeholder = "Type your message...",
  position = "bottom-right",
  theme = {},
  onMessage,
  maxMessages = 100,
  showTypingIndicator = true,
  enableSound: _enableSound = false,
  isOpen: controlledIsOpen,
  onToggle,
  className,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInterfaceRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const chatIconRef = useRef<SVGSVGElement>(null);
  const closeIconRef = useRef<SVGSVGElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const mergedTheme = { ...defaultTheme, ...theme };

  // Debug: Log position changes
  useEffect(() => {
    console.log('🔄 Chatbot position changed to:', position);
  }, [position]);

  // GSAP animations setup
  const { contextSafe } = useGSAP(
    () => {
      // Initial setup - hide chat interface completely
      if (chatInterfaceRef.current) {
        const isBottom = position.includes("bottom");
        const isRight = position.includes("right");
        
        gsap.set(chatInterfaceRef.current, {
          scale: 0,
          opacity: 0,
          y: isBottom ? 50 : -50,
          transformOrigin: isBottom 
            ? `bottom ${isRight ? "right" : "left"}`
            : `top ${isRight ? "right" : "left"}`,
          visibility: "hidden"
        });
      }

      // Setup floating button initial state
      if (floatingButtonRef.current) {
        gsap.set(floatingButtonRef.current, {
          scale: 1,
          rotation: 0,
        });
        
        // Subtle floating animation
        gsap.to(floatingButtonRef.current, {
          y: -2,
          duration: 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      }

      // Setup icons initial states
      if (chatIconRef.current && closeIconRef.current) {
        gsap.set(closeIconRef.current, {
          scale: 0,
          rotation: 180,
          opacity: 0
        });
        gsap.set(chatIconRef.current, {
          scale: 1,
          rotation: 0,
          opacity: 1
        });
      }

      // Enhanced typing indicator animation
      if (typingIndicatorRef.current) {
        const dots = typingIndicatorRef.current.querySelectorAll(".typing-dot");
        if (dots.length > 0) {
          gsap.set(dots, { 
            scale: 0.8,
            opacity: 0.3 
          });
          
          const tl = gsap.timeline({ repeat: -1 });
          tl.to(dots, {
            scale: 1.2,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
            stagger: 0.15
          })
          .to(dots, {
            scale: 0.8,
            opacity: 0.3,
            duration: 0.4,
            ease: "back.in(1.7)",
            stagger: 0.15
          }, "-=0.2");
        }
      }
    },
    { scope: containerRef }
  );

  // Enhanced chat interface open/close animation
  useGSAP(
    () => {
      if (!chatInterfaceRef.current) return;

      if (isOpen) {
        // Show and animate in
        gsap.set(chatInterfaceRef.current, { visibility: "visible" });
        
        // Ensure all child elements are immediately visible
        const headerEl = chatInterfaceRef.current.querySelector('.chat-header');
        const messagesEl = chatInterfaceRef.current.querySelector('.chat-messages');
        const inputEl = chatInterfaceRef.current.querySelector('.chat-input-container');
        
        if (headerEl) gsap.set(headerEl, { opacity: 1, y: 0 });
        if (messagesEl) gsap.set(messagesEl, { opacity: 1, y: 0 });
        if (inputEl) gsap.set(inputEl, { opacity: 1, y: 0 });
        
        const tl = gsap.timeline();
        tl.to(chatInterfaceRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)"
        });
        
        // Animate individual elements if they exist
        if (headerEl) {
          tl.from(headerEl, {
            y: -20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
          }, "-=0.3");
        }
        
        if (messagesEl) {
          tl.from(messagesEl, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
          }, "-=0.2");
        }
        
        if (inputEl) {
          tl.from(inputEl, {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
          }, "-=0.2");
        }
      } else {
        // Animate out then hide
        const headerEl = chatInterfaceRef.current.querySelector('.chat-header');
        const messagesEl = chatInterfaceRef.current.querySelector('.chat-messages');
        const inputEl = chatInterfaceRef.current.querySelector('.chat-input-container');
        
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chatInterfaceRef.current, { visibility: "hidden" });
          }
        });
        
        if (inputEl) {
          tl.to(inputEl, {
            y: 20,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
          });
        }
        
        if (messagesEl) {
          tl.to(messagesEl, {
            y: 20,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
          }, "-=0.1");
        }
        
        if (headerEl) {
          tl.to(headerEl, {
            y: -20,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
          }, "-=0.1");
        }
        
        tl.to(chatInterfaceRef.current, {
          scale: 0,
          opacity: 0,
          y: position.includes("bottom") ? 50 : -50,
          duration: 0.4,
          ease: "back.in(1.7)"
        }, "-=0.2");
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  // Enhanced icon transition animation
  useGSAP(
    () => {
      if (!chatIconRef.current || !closeIconRef.current) return;

      const tl = gsap.timeline();

      if (isOpen) {
        // Transition to close icon
        tl.to(chatIconRef.current, {
          scale: 0,
          rotation: -180,
          opacity: 0,
          duration: 0.3,
          ease: "back.in(1.7)"
        })
        .to(closeIconRef.current, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        }, "-=0.1");
      } else {
        // Transition to chat icon
        tl.to(closeIconRef.current, {
          scale: 0,
          rotation: 180,
          opacity: 0,
          duration: 0.3,
          ease: "back.in(1.7)"
        })
        .to(chatIconRef.current, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        }, "-=0.1");
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  // Enhanced new message animation
  useGSAP(
    () => {
      if (!messagesContainerRef.current) return;

      const messageElements = messagesContainerRef.current.querySelectorAll(
        ".message-bubble:last-child"
      );
      if (messageElements.length > 0) {
        const lastMessage = messageElements[messageElements.length - 1];
        const isUserMessage = lastMessage.classList.contains('user-message');
        
        gsap.fromTo(
          lastMessage,
          {
            opacity: 0,
            y: 30,
            scale: 0.8,
            x: isUserMessage ? 20 : -20
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            x: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
          }
        );
      }
    },
    { dependencies: [messages.length], scope: containerRef }
  );

  // Apply CSS variables for theming
  useEffect(() => {
    const chatbotElement = containerRef.current;
    if (chatbotElement) {
      Object.entries(mergedTheme).forEach(([key, value]) => {
        if (value) {
          chatbotElement.style.setProperty(
            `--chatbot-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
            value
          );
        }
      });
    }
  }, [mergedTheme]);

  // Initialize with welcome message
  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: welcomeMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [welcomeMessage]);

  // Fallback to ensure elements are visible if animations fail
  useEffect(() => {
    if (isOpen && chatInterfaceRef.current) {
      // Delay to allow GSAP animations to run first
      const timer = setTimeout(() => {
        const headerEl = chatInterfaceRef.current?.querySelector('.chat-header') as HTMLElement;
        const messagesEl = chatInterfaceRef.current?.querySelector('.chat-messages') as HTMLElement;
        const inputEl = chatInterfaceRef.current?.querySelector('.chat-input-container') as HTMLElement;
        
        if (headerEl && getComputedStyle(headerEl).opacity === '0') {
          headerEl.style.opacity = '1';
          headerEl.style.transform = 'translateY(0)';
        }
        if (messagesEl && getComputedStyle(messagesEl).opacity === '0') {
          messagesEl.style.opacity = '1';
          messagesEl.style.transform = 'translateY(0)';
        }
        if (inputEl && getComputedStyle(inputEl).opacity === '0') {
          inputEl.style.opacity = '1';
          inputEl.style.transform = 'translateY(0)';
        }
      }, 700); // Wait for animations to complete
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Enhanced auto-scroll with smooth animation
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      gsap.to(messagesContainerRef.current, {
        scrollTop: messagesEndRef.current.offsetTop,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  }, [messages]);

  // Focus input when opened with proper delay
  useEffect(() => {
    if (isOpen && inputRef.current) {
      gsap.delayedCall(0.6, () => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    const newIsOpen = !isOpen;

    // Enhanced button feedback animation
    if (floatingButtonRef.current) {
      gsap.to(floatingButtonRef.current, {
        scale: 0.85,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(floatingButtonRef.current, {
            scale: 1,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)"
          });
        }
      });
    }

    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newIsOpen);
    }
    onToggle?.(newIsOpen);
  }, [isOpen, controlledIsOpen, onToggle]);

  const handleSendMessage = contextSafe(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev.slice(-(maxMessages - 1)), userMessage]);
    setInputValue("");

    // Enhanced input feedback animation
    if (inputRef.current) {
      const tl = gsap.timeline();
      tl.to(inputRef.current, {
        scale: 1.05,
        duration: 0.1,
        ease: "power2.out"
      })
      .to(inputRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)"
      });
    }

    if (onMessage) {
      setIsTyping(true);
      try {
        const response = await onMessage(text.trim());
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev.slice(-(maxMessages - 1)), botMessage]);
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [
          ...prev.slice(-(maxMessages - 1)),
          errorMessage,
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  // Enhanced hover animations
  const handleButtonHover = contextSafe(() => {
    if (floatingButtonRef.current && !isOpen) {
      gsap.to(floatingButtonRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  });

  const handleButtonLeave = contextSafe(() => {
    if (floatingButtonRef.current && !isOpen) {
      gsap.to(floatingButtonRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  });

  const positionClasses = {
    "bottom-right": "position-bottom-right",
    "bottom-left": "position-bottom-left",
    "top-right": "position-top-right",
    "top-left": "position-top-left",
  };

  return (
    <div
      ref={containerRef}
      className={clsx(positionClasses[position], className)}
      data-chatbot-instance=""
      style={{
        fontFamily: mergedTheme.font,
      }}
    >
      {/* Chat Interface - Always rendered but hidden */}
      <div
        ref={chatInterfaceRef}
        className="mb-4 w-80 h-96 bg-chatbot-background border border-chatbot-border rounded-lg chatbot-shadow-lg flex flex-col overflow-hidden chat-interface"
      >
        {/* Header */}
        <div className="bg-chatbot-primary text-white p-4 rounded-t-lg flex justify-between items-center chat-header">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={handleToggle}
            className="text-white hover:text-chatbot-accent transition-colors"
            aria-label="Close chat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                "flex message-bubble",
                message.sender === "user" ? "justify-end user-message" : "justify-start bot-message"
              )}
            >
              <div
                className={clsx(
                  "max-w-xs px-3 py-2 rounded-lg text-sm",
                  message.sender === "user"
                    ? "bg-chatbot-primary text-white"
                    : "bg-chatbot-surface text-chatbot-text border border-chatbot-border"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && showTypingIndicator && (
            <div className="flex justify-start">
              <div
                ref={typingIndicatorRef}
                className="bg-chatbot-surface text-chatbot-text-secondary px-3 py-2 rounded-lg text-sm border border-chatbot-border typing-indicator"
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-chatbot-border chat-input-container">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-chatbot-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatbot-primary text-chatbot-text bg-chatbot-background chat-input"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-chatbot-primary text-white rounded-lg hover:bg-chatbot-secondary disabled:opacity-50 disabled:cursor-not-allowed send-button"
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button - Fixed position with overlapping icons */}
      <button
        ref={floatingButtonRef}
        onClick={handleToggle}
        onMouseEnter={handleButtonHover}
        onMouseLeave={handleButtonLeave}
        className="w-14 h-14 bg-chatbot-primary hover:bg-chatbot-secondary text-white rounded-full flex items-center justify-center floating-button gsap-optimized relative"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Chat Icon */}
        <svg
          ref={chatIconRef}
          className="w-6 h-6 absolute"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        
        {/* Close Icon */}
        <svg
          ref={closeIconRef}
          className="w-6 h-6 absolute"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default ReactChatbot;
