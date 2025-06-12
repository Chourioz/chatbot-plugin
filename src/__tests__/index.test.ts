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

  it("should render the ReactChatbot component on connectedCallback", () => {
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockReactChatbot).toHaveBeenCalledTimes(1);
    const chatbotProps = mockReactChatbot.mock.calls[0][0];
    expect(chatbotProps).toBeDefined();
    expect(chatbotProps.position).toBe("bottom-right");
  });

  it("should pass attributes as props to the ReactChatbot component", () => {
    document.body.removeChild(element);
    element = document.createElement("react-chatbot");
    element.setAttribute("title", "Test Bot");
    element.setAttribute("position", "bottom-left");
    element.setAttribute("welcome-message", "Hello Test");
    element.setAttribute("placeholder", "Type here...");
    const theme = { primary: "#ff0000" };
    element.setAttribute("theme", JSON.stringify(theme));
    document.body.appendChild(element);
    expect(mockReactChatbot).toHaveBeenCalledTimes(2); // 1 from previous test, 1 from this
    const chatbotProps = mockReactChatbot.mock.calls[1][0];
    expect(chatbotProps.title).toBe("Test Bot");
    expect(chatbotProps.position).toBe("bottom-left");
    expect(chatbotProps.welcomeMessage).toBe("Hello Test");
    expect(chatbotProps.placeholder).toBe("Type here...");
    expect(chatbotProps.theme).toEqual(theme);
  });

  it("should re-render when an attribute is changed", () => {
    expect(mockRender).toHaveBeenCalledTimes(1);
    element.setAttribute("title", "New Title");
    expect(mockRender).toHaveBeenCalledTimes(2);
    const chatbotProps = mockReactChatbot.mock.calls[1][0];
    expect(chatbotProps.title).toBe("New Title");
  });

  it("should unmount the React component on disconnectedCallback", () => {
    document.body.removeChild(element);
    expect(mockUnmount).toHaveBeenCalledTimes(1);
  });

  it("should dispatch a custom event onMessage", async () => {
    const messageHandler = vi.fn();
    element.addEventListener("chatbot-message", messageHandler);
    const chatbotProps = mockReactChatbot.mock.calls[0][0];
    expect(chatbotProps.onMessage).toBeInstanceOf(Function);
    const testMessage = "Hello from test";
    await chatbotProps.onMessage(testMessage);
    expect(messageHandler).toHaveBeenCalledTimes(1);
    const event = messageHandler.mock.calls[0][0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.detail).toEqual({ message: testMessage });
    element.removeEventListener("chatbot-message", messageHandler);
  });

  it("should update CSS variables in shadow DOM based on theme prop", () => {
    document.body.removeChild(element);
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

  it("should handle onMessage and return a default message", async () => {
    const chatbotProps = mockReactChatbot.mock.calls[0][0];
    const response = await chatbotProps.onMessage("test");
    expect(response).toBe("I received your message: test");
  });
});
