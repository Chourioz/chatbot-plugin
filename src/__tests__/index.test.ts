import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import React from "react"; // React is needed for React.createElement call

const mockRender = vi.fn();
const mockUnmount = vi.fn();
const mockReactChatbot = vi.fn();
let createRoot: any;

// Mock the useChatbot hook
const mockUseChatbot = vi.fn(() => ({
  messages: [],
  isTyping: false,
  sendMessage: vi.fn(),
  apiKeyValidation: {
    isValid: true,
    keyId: "test-key-id",
    error: null,
    user: null,
    chatbotConfig: {
      title: "Test Bot",
      welcomeText: "Hello Test",
      placeholder: "Type here...",
      theme: { primary: "#ff0000" },
    },
  },
}));

beforeAll(async () => {
  vi.doMock("react-dom/client", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-dom/client")>();
    createRoot = vi.fn(() => ({
      render: mockRender,
      unmount: mockUnmount,
    }));
    return {
      ...actual,
      createRoot,
    };
  });

  vi.doMock("../hooks/useChatbot", () => ({
    useChatbot: mockUseChatbot,
  }));

  vi.doMock("../chatbot", () => ({
    ReactChatbot: (props: any) => {
      mockReactChatbot(props);
      return null;
    },
  }));

  // Import the module after mocks are set up
  await import("../index");
});

describe("ReactChatbot Custom Element", () => {
  let element: HTMLElement;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockRender.mockClear();
    mockUnmount.mockClear();
    mockReactChatbot.mockClear();
    createRoot.mockClear();
    mockUseChatbot.mockClear();

    element = document.createElement("react-chatbot");
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  });

  it("should register the custom element 'react-chatbot'", () => {
    expect(customElements.get("react-chatbot")).toBeDefined();
  });

  it("should create a shadow root on construction", () => {
    expect(element.shadowRoot).toBeDefined();
    expect(element.shadowRoot?.mode).toBe("open");
  });

  it("should render the ReactChatbot component with correct React props", () => {
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockReactChatbot).toHaveBeenCalledTimes(1);

    const reactProps = mockReactChatbot.mock.calls[0][0];
    expect(reactProps).toBeDefined();

    // The React component should receive these specific props
    expect(reactProps.position).toBe("bottom-right"); // default
    expect(reactProps.apiKey).toBeUndefined(); // not set initially
    expect(reactProps.className).toBeUndefined(); // not set initially
  });

  it("should pass apiKey and position as React props", () => {
    // Remove the current element first
    document.body.removeChild(element);

    // Create a new element with the props that should go to React component
    element = document.createElement("react-chatbot");
    element.setAttribute("api-key", "test-api-key-123");
    element.setAttribute("position", "bottom-left");
    document.body.appendChild(element);

    expect(mockReactChatbot).toHaveBeenCalledTimes(1);
    const reactProps = mockReactChatbot.mock.calls[0][0];

    // These should be passed as React props
    expect(reactProps.apiKey).toBe("test-api-key-123");
    expect(reactProps.position).toBe("bottom-left");
  });

  it("should store configuration attributes internally (not as React props)", () => {
    document.body.removeChild(element);

    element = document.createElement("react-chatbot");
    element.setAttribute("title", "Custom Bot");
    element.setAttribute("welcome-message", "Hello Custom");
    element.setAttribute("placeholder", "Custom placeholder...");
    element.setAttribute("theme", '{"primary": "#00ff00"}');
    element.setAttribute("max-messages", "50");
    element.setAttribute("show-typing-indicator", "false");
    element.setAttribute("enable-sound", "true");
    document.body.appendChild(element);

    const reactProps = mockReactChatbot.mock.calls[0][0];

    // These should NOT be passed as React props (they're internal configuration)
    expect(reactProps.title).toBeUndefined();
    expect(reactProps.welcomeMessage).toBeUndefined();
    expect(reactProps.placeholder).toBeUndefined();
    expect(reactProps.theme).toBeUndefined();
    expect(reactProps.maxMessages).toBeUndefined();
    expect(reactProps.showTypingIndicator).toBeUndefined();
    expect(reactProps.enableSound).toBeUndefined();

    // Only the actual React props should be present
    expect(reactProps.position).toBe("bottom-right"); // default
    expect(reactProps.apiKey).toBeUndefined();
    expect(reactProps.className).toBeUndefined();
  });

  it("should re-render when api-key or position attributes change", () => {
    // Initially rendered once
    expect(mockRender).toHaveBeenCalledTimes(1);

    // Change api-key should trigger re-render
    element.setAttribute("api-key", "new-api-key");
    expect(mockRender).toHaveBeenCalledTimes(2);

    const reactProps = mockReactChatbot.mock.calls[1][0];
    expect(reactProps.apiKey).toBe("new-api-key");

    // Change position should trigger re-render
    element.setAttribute("position", "top-right");
    expect(mockRender).toHaveBeenCalledTimes(3);

    const reactProps2 = mockReactChatbot.mock.calls[2][0];
    expect(reactProps2.position).toBe("top-right");
  });

  it("should re-render when configuration attributes change (but not affect React props)", () => {
    const initialRenderCount = mockRender.mock.calls.length;

    // Change configuration attribute should trigger re-render
    element.setAttribute("title", "New Title");
    expect(mockRender).toHaveBeenCalledTimes(initialRenderCount + 1);

    // But the React props should remain the same (only apiKey, position, className)
    const lastCallIndex = mockReactChatbot.mock.calls.length - 1;
    const reactProps = mockReactChatbot.mock.calls[lastCallIndex][0];
    expect(reactProps.title).toBeUndefined();
    expect(reactProps.position).toBe("bottom-right");
    expect(reactProps.apiKey).toBeUndefined();
  });

  it("should unmount the React component on disconnectedCallback", () => {
    document.body.removeChild(element);
    expect(mockUnmount).toHaveBeenCalledTimes(1);
  });

  it("should update CSS variables in shadow DOM based on theme attribute", () => {
    // Remove current element
    document.body.removeChild(element);

    // Create new element with theme
    element = document.createElement("react-chatbot");
    const theme = {
      primary: "rgb(255, 0, 0)",
      secondary: "rgb(0, 255, 0)",
      accent: "rgb(0, 0, 255)",
      background: "rgb(255, 255, 255)",
      surface: "rgb(240, 240, 240)",
      text: "rgb(17, 17, 17)",
      textSecondary: "rgb(102, 102, 102)",
      border: "rgb(204, 204, 204)",
      font: "Arial, sans-serif",
    };
    element.setAttribute("theme", JSON.stringify(theme));
    document.body.appendChild(element);

    const styleElement = element.shadowRoot?.querySelector("style");
    expect(styleElement).not.toBeNull();
    const styleContent = styleElement?.textContent || "";

    expect(styleContent).toContain(`--chatbot-primary: ${theme.primary}`);
    expect(styleContent).toContain(`--chatbot-secondary: ${theme.secondary}`);
    expect(styleContent).toContain(`--chatbot-accent: ${theme.accent}`);
    expect(styleContent).toContain(`--chatbot-background: ${theme.background}`);
    expect(styleContent).toContain(`--chatbot-surface: ${theme.surface}`);
    expect(styleContent).toContain(`--chatbot-text: ${theme.text}`);
    expect(styleContent).toContain(
      `--chatbot-text-secondary: ${theme.textSecondary}`
    );
    expect(styleContent).toContain(`--chatbot-border: ${theme.border}`);
    expect(styleContent).toContain(`--chatbot-font: ${theme.font}`);
  });

  it("should handle configuration updates programmatically", () => {
    const initialRenderCount = mockRender.mock.calls.length;

    // Cast to access the updateConfiguration method
    const customElement = element as any;
    customElement.updateConfiguration({
      apiKey: "updated-api-key",
      position: "top-left",
    });

    // Should trigger a re-render
    expect(mockRender).toHaveBeenCalledTimes(initialRenderCount + 1);
  });

  it("should handle configuration updates programmatically", () => {
    const initialRenderCount = mockRender.mock.calls.length;

    // Cast to access the updateConfiguration method
    const customElement = element as any;
    customElement.updateConfiguration({
      apiKey: "updated-api-key",
      position: "top-left",
    });

    // Should trigger a re-render
    expect(mockRender).toHaveBeenCalledTimes(initialRenderCount + 1);

    // Check that the new props were passed to ReactChatbot
    const lastCallIndex = mockReactChatbot.mock.calls.length - 1;
    const reactProps = mockReactChatbot.mock.calls[lastCallIndex][0];
    expect(reactProps.apiKey).toBe("updated-api-key");
    expect(reactProps.position).toBe("top-left");
  });

  it("should handle invalid JSON in theme attribute gracefully", () => {
    document.body.removeChild(element);

    // Create element with invalid JSON - this should not crash
    element = document.createElement("react-chatbot");
    element.setAttribute("theme", "invalid-json");

    // Should not throw an error when appending to DOM
    expect(() => {
      document.body.appendChild(element);
    }).not.toThrow();

    // The component should still render with valid React props
    expect(mockReactChatbot).toHaveBeenCalled();
    const reactProps = mockReactChatbot.mock.calls[0][0];
    expect(reactProps.position).toBe("bottom-right");
    expect(reactProps.apiKey).toBeUndefined();
  });

  it("should handle all observed attributes correctly", () => {
    const ReactChatbotElement = customElements.get("react-chatbot") as any;
    const observedAttributes = ReactChatbotElement.observedAttributes;

    expect(observedAttributes).toEqual([
      "title",
      "theme",
      "position",
      "welcome-message",
      "placeholder",
      "api-key",
      "max-messages",
      "show-typing-indicator",
      "enable-sound",
      "class",
    ]);
  });

  it("should pass only valid React props to ReactChatbot component", () => {
    document.body.removeChild(element);

    element = document.createElement("react-chatbot");
    element.setAttribute("api-key", "test-key");
    element.setAttribute("position", "top-right");
    element.className = "custom-class";

    // Set non-React props (these should be internal configuration)
    element.setAttribute("title", "Test Title");
    element.setAttribute("theme", '{"primary": "#ff0000"}');
    element.setAttribute("max-messages", "100");

    document.body.appendChild(element);

    const reactProps = mockReactChatbot.mock.calls[0][0];

    // Should have only the valid React props
    const expectedProps = {
      apiKey: "test-key",
      position: "top-right",
    };

    expect(reactProps.apiKey).toBe(expectedProps.apiKey);
    expect(reactProps.position).toBe(expectedProps.position);

    // Should not have configuration attributes as props
    expect(reactProps.title).toBeUndefined();
    expect(reactProps.theme).toBeUndefined();
    expect(reactProps.maxMessages).toBeUndefined();
  });
});
