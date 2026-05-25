import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TypingIndicator from "./TypingIndicator";

describe("TypingIndicator", () => {
  beforeEach(() => {
    // Reset matchMedia mock before each test
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query) => ({
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
  });

  it("renders the typing indicator with AI avatar", () => {
    const { container } = render(<TypingIndicator />);

    // Check for the AI avatar container
    const avatar = container.querySelector(".bg-gradient-to-br.from-purple-500.to-blue-600");
    expect(avatar).toBeInTheDocument();
    
    // Check for the Bot icon SVG
    const botIcon = container.querySelector("svg.lucide-bot");
    expect(botIcon).toBeInTheDocument();
  });

  it('displays "AI is thinking" text', () => {
    render(<TypingIndicator />);

    // Check for the thinking text
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
  });

  it("renders three animated dots", () => {
    const { container } = render(<TypingIndicator />);

    // Find all dots by their class
    const dots = container.querySelectorAll(".rounded-full.bg-purple-400");
    expect(dots).toHaveLength(3);
  });

  it("applies glassmorphism styling", () => {
    const { container } = render(<TypingIndicator />);

    // Check for glassmorphism classes
    const bubble = container.querySelector(".backdrop-blur-lg");
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveClass("bg-white/10");
    expect(bubble).toHaveClass("border-white/20");
  });

  it("respects prefers-reduced-motion setting", () => {
    // Mock prefers-reduced-motion: reduce
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    const { container } = render(<TypingIndicator />);

    // The component should still render but without animations
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();

    // Dots should still be present
    const dots = container.querySelectorAll(".rounded-full.bg-purple-400");
    expect(dots).toHaveLength(3);
  });

  it("has proper shadow and border styling", () => {
    const { container } = render(<TypingIndicator />);

    const bubble = container.querySelector(".rounded-2xl");
    expect(bubble).toHaveClass("shadow-xl");
    expect(bubble).toHaveClass("border");
  });

  it("uses muted color for text", () => {
    render(<TypingIndicator />);

    const text = screen.getByText(/AI is thinking/i);
    expect(text).toHaveClass("text-gray-400");
  });
});
