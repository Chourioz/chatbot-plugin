import React, { useEffect, useRef, useCallback, useState } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
import ChatInput from "./components/ChatInput";
import type { ChatbotProps, ChatbotTheme } from "./types";
import { useChatbot } from "./hooks/useChatbot";

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
  apiKey,
  position = "bottom-right",
  className,
}) => {
  // Local state for UI
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use custom hook for all business logic
  const { messages, isTyping, sendMessage, apiKeyValidation } = useChatbot({
    apiKey,
  });

  // Debug: Log messages changes
  useEffect(() => {
    console.log("💬 Messages updated:", messages);
    console.log("📊 Total messages:", messages.length);
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      console.log("📧 Last message:", lastMessage);
    }
  }, [messages]);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInterfaceRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);
  const chatIconRef = useRef<SVGSVGElement>(null);
  const closeIconRef = useRef<SVGSVGElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typingIndicatorRef = useRef<HTMLDivElement>(null);

  const isOpen = internalIsOpen;

  // Get configuration from API key validation or use defaults
  const config = apiKeyValidation.chatbotConfig;
  const title = config?.title || "Chat Assistant";
  const welcomeMessage =
    config?.welcomeText || "Hello! How can I help you today?";
  const placeholder = config?.placeholder || "Type your message...";
  const theme = config?.theme
    ? { ...defaultTheme, ...config.theme }
    : defaultTheme;

  // Debug: Log position changes
  useEffect(() => {
    console.log("🔄 Chatbot position changed to:", position);
  }, [position]);

  // Log API Key validation status
  useEffect(() => {
    if (apiKeyValidation.isValid) {
      console.log("🔑 API Key validated for client:", apiKeyValidation.keyId);
      if (apiKeyValidation.user) {
        console.log(
          "👤 User:",
          apiKeyValidation.user.fullName,
          `(${apiKeyValidation.user.email})`
        );
      }
      if (apiKeyValidation.chatbotConfig) {
        console.log("⚙️ Chatbot Config:", {
          title: apiKeyValidation.chatbotConfig.title,
          welcomeText: apiKeyValidation.chatbotConfig.welcomeText,
          agentUrl: apiKeyValidation.chatbotConfig.agentUrl,
          theme: apiKeyValidation.chatbotConfig.theme || {},
        });
      }
    } else if (apiKeyValidation.error) {
      console.warn("⚠️ API Key validation failed:", apiKeyValidation.error);
    }
  }, [
    apiKeyValidation.isValid,
    apiKeyValidation.keyId,
    apiKeyValidation.error,
    apiKeyValidation.user,
    apiKeyValidation.chatbotConfig,
  ]);

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
          visibility: "hidden",
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
          repeat: -1,
        });
      }

      // Setup icons initial states
      if (chatIconRef.current && closeIconRef.current) {
        gsap.set(closeIconRef.current, {
          scale: 0,
          rotation: 180,
          opacity: 0,
        });
        gsap.set(chatIconRef.current, {
          scale: 1,
          rotation: 0,
          opacity: 1,
        });
      }

      // Enhanced typing indicator animation
      if (typingIndicatorRef.current) {
        const dots = typingIndicatorRef.current.querySelectorAll(".typing-dot");
        if (dots.length > 0) {
          gsap.set(dots, {
            scale: 0.8,
            opacity: 0.3,
          });

          const tl = gsap.timeline({ repeat: -1 });
          tl.to(dots, {
            scale: 1.2,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
            stagger: 0.15,
          }).to(
            dots,
            {
              scale: 0.8,
              opacity: 0.3,
              duration: 0.4,
              ease: "back.in(1.7)",
              stagger: 0.15,
            },
            "-=0.2"
          );
        }
      }
    },
    { scope: containerRef }
  );

  // Function to animate bot messages with split text effect
  const animateBotMessage = contextSafe((messageElement: HTMLElement) => {
    console.log("🎬 Starting SplitText animation for bot message");

    // Only animate bot messages
    if (!messageElement.classList.contains("bot-message")) {
      return;
    }

    const messageContainer = messageElement.querySelector(".max-w-xs");
    const textContainer = messageElement.querySelector(".message-text");

    if (!textContainer || !messageContainer) {
      console.log("❌ Required elements not found");
      return;
    }

    const textContent = textContainer.textContent?.substring(0, 30) + "...";
    console.log("📝 Animating text:", textContent);

    // Remove the pre-animation class to allow GSAP control
    messageElement.classList.remove("pre-animation");
    console.log("🔓 Removed pre-animation class for GSAP control");

    // Check current visibility state after class removal
    const containerOpacity = window.getComputedStyle(messageContainer).opacity;
    const textOpacity = window.getComputedStyle(textContainer).opacity;
    console.log(
      "📊 Opacity after class removal - Container:",
      containerOpacity,
      "Text:",
      textOpacity
    );

    // Initialize SplitType to split text into words
    const split = new SplitType(textContainer as HTMLElement, {
      types: "words",
      wordClass: "split-word",
    });

    if (!split.words || split.words.length === 0) {
      console.log("❌ SplitType failed to create words");
      // Restore visibility if split failed
      gsap.set(messageContainer, { opacity: 1 });
      gsap.set(textContainer, { opacity: 1 });
      return;
    }

    console.log(
      "✨ Animating",
      split.words.length,
      "words with stagger effect"
    );

    // Set initial state for words
    gsap.set(split.words, {
      opacity: 0,
      y: 15,
      scale: 0.9,
    });

    // Set initial state for containers
    gsap.set(messageContainer, { opacity: 0, y: 10 });
    gsap.set(textContainer, { opacity: 1 }); // Text container visible, but words are hidden

    // Animate the message container entrance first
    gsap.to(messageContainer, {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        // After container is visible, animate words
        gsap.to(split.words, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
          stagger: {
            amount: 0.6,
            from: "start",
          },
          onComplete: () => {
            console.log("✅ SplitText animation completed");
            // Clean up split after animation completes
            split.revert();
          },
        });
      },
    });
  });

  // Enhanced chat interface open/close animation
  useGSAP(
    () => {
      if (!chatInterfaceRef.current) return;

      if (isOpen) {
        // Show and animate in
        gsap.set(chatInterfaceRef.current, { visibility: "visible" });

        // Ensure all child elements are immediately visible
        const headerEl = chatInterfaceRef.current.querySelector(".chat-header");
        const messagesEl =
          chatInterfaceRef.current.querySelector(".chat-messages");
        const inputEl = chatInterfaceRef.current.querySelector(
          ".chat-input-container"
        );

        if (headerEl) gsap.set(headerEl, { opacity: 1, y: 0 });
        if (messagesEl) gsap.set(messagesEl, { opacity: 1, y: 0 });
        if (inputEl) gsap.set(inputEl, { opacity: 1, y: 0 });

        const tl = gsap.timeline();
        tl.to(chatInterfaceRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        });

        // Animate individual elements if they exist
        if (headerEl) {
          tl.from(
            headerEl,
            {
              y: -20,
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            "-=0.3"
          );
        }

        if (messagesEl) {
          tl.from(
            messagesEl,
            {
              y: 20,
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            "-=0.2"
          );
        }

        if (inputEl) {
          tl.from(
            inputEl,
            {
              y: 20,
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            "-=0.2"
          );
        }
      } else {
        // Animate out then hide
        const headerEl = chatInterfaceRef.current.querySelector(".chat-header");
        const messagesEl =
          chatInterfaceRef.current.querySelector(".chat-messages");
        const inputEl = chatInterfaceRef.current.querySelector(
          ".chat-input-container"
        );

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(chatInterfaceRef.current, { visibility: "hidden" });
          },
        });

        if (inputEl) {
          tl.to(inputEl, {
            y: 20,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          });
        }

        if (messagesEl) {
          tl.to(
            messagesEl,
            {
              y: 20,
              opacity: 0,
              duration: 0.2,
              ease: "power2.in",
            },
            "-=0.1"
          );
        }

        if (headerEl) {
          tl.to(
            headerEl,
            {
              y: -20,
              opacity: 0,
              duration: 0.2,
              ease: "power2.in",
            },
            "-=0.1"
          );
        }

        tl.to(
          chatInterfaceRef.current,
          {
            scale: 0,
            opacity: 0,
            y: position.includes("bottom") ? 50 : -50,
            duration: 0.4,
            ease: "back.in(1.7)",
          },
          "-=0.2"
        );
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
          ease: "back.in(1.7)",
        }).to(
          closeIconRef.current,
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)",
          },
          "-=0.1"
        );
      } else {
        // Transition to chat icon
        tl.to(closeIconRef.current, {
          scale: 0,
          rotation: 180,
          opacity: 0,
          duration: 0.3,
          ease: "back.in(1.7)",
        }).to(
          chatIconRef.current,
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.3,
            ease: "back.out(1.7)",
          },
          "-=0.1"
        );
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  // Enhanced new message animation - using different approach
  useEffect(() => {
    if (messages.length === 0) return;

    console.log("🔄 New message effect triggered");
    console.log("📊 Messages count:", messages.length);

    // Use a small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (!messagesContainerRef.current) {
        console.log("❌ Messages container ref not available");
        return;
      }

      const allMessageElements =
        messagesContainerRef.current.querySelectorAll(".message-bubble");
      console.log(
        "🔍 Found total message elements:",
        allMessageElements.length
      );

      if (allMessageElements.length > 0) {
        const lastMessage = allMessageElements[allMessageElements.length - 1];
        const isUserMessage = lastMessage.classList.contains("user-message");

        console.log("📨 Last message element:", lastMessage);
        console.log("👤 Is user message:", isUserMessage);
        console.log("🤖 Is bot message:", !isUserMessage);
        console.log("📝 Message classes:", lastMessage.className);

        // Check if this message was already animated
        if (lastMessage.getAttribute("data-animated") === "true") {
          console.log("⏭️ Message already animated, skipping");
          return;
        }

        // Mark as animated
        lastMessage.setAttribute("data-animated", "true");

        // Different animations for user vs bot messages
        if (isUserMessage) {
          // User messages get the standard entrance animation
          gsap.fromTo(
            lastMessage,
            {
              opacity: 0,
              y: 30,
              scale: 0.8,
              x: 20,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              x: 0,
              duration: 0.5,
              ease: "back.out(1.7)",
              onStart: () => {
                console.log("🚀 User message entrance animation started");
              },
            }
          );
        } else {
          // Bot messages get minimal entrance animation (the bubble will handle its own animation)
          console.log("🤖 Setting up bot message for SplitText animation");
          gsap.set(lastMessage, { opacity: 1 }); // Make the message bubble visible immediately

          // Add a small delay to ensure CSS has been applied and DOM is stable
          gsap.delayedCall(0.05, () => {
            console.log("⏰ Starting SplitText animation after micro-delay");
            animateBotMessage(lastMessage as HTMLElement);
          });
        }
      } else {
        console.log("❌ No message elements found");
      }
    }, 50); // Small delay to ensure DOM is updated

    return () => clearTimeout(timer);
  }, [messages, animateBotMessage]);

  // Apply CSS variables for theming
  useEffect(() => {
    const chatbotElement = containerRef.current;
    if (chatbotElement) {
      Object.entries(theme).forEach(([key, value]) => {
        if (value) {
          chatbotElement.style.setProperty(
            `--chatbot-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
            value
          );
        }
      });
    }
  }, [theme]);

  // Fallback to ensure elements are visible if animations fail
  useEffect(() => {
    if (isOpen && chatInterfaceRef.current) {
      // Delay to allow GSAP animations to run first
      const timer = setTimeout(() => {
        const headerEl = chatInterfaceRef.current?.querySelector(
          ".chat-header"
        ) as HTMLElement;
        const messagesEl = chatInterfaceRef.current?.querySelector(
          ".chat-messages"
        ) as HTMLElement;
        const inputEl = chatInterfaceRef.current?.querySelector(
          ".chat-input-container"
        ) as HTMLElement;

        if (headerEl && getComputedStyle(headerEl).opacity === "0") {
          headerEl.style.opacity = "1";
          headerEl.style.transform = "translateY(0)";
        }
        if (messagesEl && getComputedStyle(messagesEl).opacity === "0") {
          messagesEl.style.opacity = "1";
          messagesEl.style.transform = "translateY(0)";
        }
        if (inputEl && getComputedStyle(inputEl).opacity === "0") {
          inputEl.style.opacity = "1";
          inputEl.style.transform = "translateY(0)";
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
            ease: "elastic.out(1, 0.5)",
          });
        },
      });
    }

    setInternalIsOpen(newIsOpen);
  }, [isOpen]);

  // Simplified message handler for the new ChatInput component
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Use the hook's sendMessage function which handles all business logic
      await sendMessage(text.trim());
    },
    [sendMessage]
  );

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

  // Don't render if API key is not valid
  if (!apiKeyValidation.isValid && apiKeyValidation.error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Chatbot Error:</strong> {apiKeyValidation.error}
      </div>
    );
  }

  // Show loading state while validating API key
  if (!apiKeyValidation.isValid && !apiKeyValidation.error) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <strong>Loading chatbot...</strong>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(positionClasses[position], className)}
      data-chatbot-instance=""
      style={{
        fontFamily: theme.font,
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
          {messages.map((message, index) => {
            // Only log bot messages for debugging
            if (message.sender === "bot") {
              console.log(`🤖 Rendering bot message ${index}:`, {
                id: message.id,
                text: message.text.substring(0, 50) + "...",
              });
            }

            return (
              <div
                key={message.id}
                className={clsx(
                  "flex message-bubble",
                  message.sender === "user"
                    ? "justify-end user-message"
                    : "justify-start bot-message",
                  // Add pre-animation class to bot messages
                  message.sender === "bot" && "pre-animation"
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
                  <span className="message-text">{message.text}</span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
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

        {/* Input - Isolated Component */}
        <ChatInput
          onSubmit={handleSendMessage}
          placeholder={placeholder}
          disabled={isTyping}
        />
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
