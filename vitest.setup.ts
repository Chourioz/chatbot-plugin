import "@testing-library/jest-dom";
import { afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

// Setup GSAP for testing environment
beforeAll(() => {
  // Mock GSAP animations in tests
  const mockGSAP = {
    set: () => {},
    to: () => Promise.resolve(),
    from: () => Promise.resolve(),
    fromTo: () => Promise.resolve(),
    timeline: () => ({
      to: () => mockGSAP,
      from: () => mockGSAP,
      set: () => mockGSAP,
      kill: () => {},
    }),
    registerPlugin: () => {},
    getById: () => null,
    killTweensOf: () => {},
  };

  (global as any).gsap = mockGSAP;
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock CSS custom properties support
Object.defineProperty(window, "CSS", {
  writable: true,
  value: {
    supports: (_property: string, _value: string) => true,
  },
});

// Mock ResizeObserver for responsive components
(global as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for visibility testing
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = () => [];
};
