import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SkeletonLoader from "./SkeletonLoader";

describe("SkeletonLoader", () => {
  let matchMediaMock;

  beforeEach(() => {
    // Mock matchMedia
    matchMediaMock = vi.fn();
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Message Skeleton Variant", () => {
    it("should render default count of 3 message skeletons", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader />);
      
      // Should render 3 message skeletons (default count)
      const skeletons = container.querySelectorAll(".flex.gap-3.my-3");
      expect(skeletons).toHaveLength(3);
    });

    it("should render custom count of message skeletons", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={5} />);
      
      // Should render 5 message skeletons
      const skeletons = container.querySelectorAll(".flex.gap-3.my-3");
      expect(skeletons).toHaveLength(5);
    });

    it("should alternate between user and AI message styles", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={2} />);
      
      const skeletons = container.querySelectorAll(".flex.gap-3.my-3");
      
      // First skeleton should be user (justify-end)
      expect(skeletons[0]).toHaveClass("justify-end");
      
      // Second skeleton should be AI (justify-start)
      expect(skeletons[1]).toHaveClass("justify-start");
    });

    it("should render with glassmorphism styling", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Check for backdrop-blur-lg class
      const messageBubble = container.querySelector(".backdrop-blur-lg");
      expect(messageBubble).toBeInTheDocument();
    });

    it("should render with shimmer animation when motion is not reduced", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Check for animated element
      const animatedElement = container.querySelector(".rounded-2xl");
      expect(animatedElement).toBeInTheDocument();
      // Check that the element has a background style applied (shimmer gradient)
      expect(animatedElement.style.background).toBeTruthy();
    });

    it("should render without shimmer animation when prefers-reduced-motion", () => {
      matchMediaMock.mockReturnValue({ matches: true });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Check that shimmer animation is not applied
      const animatedElement = container.querySelector(".rounded-2xl");
      expect(animatedElement).toBeInTheDocument();
      // Should not have backgroundSize style when reduced motion is preferred
      expect(animatedElement.style.backgroundSize).toBe("");
    });
  });

  describe("Typing Indicator Skeleton Variant", () => {
    it("should render typing indicator skeleton", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader variant="typing" />);
      
      // Should render single typing indicator skeleton
      const skeleton = container.querySelector(".flex.gap-3.my-3.justify-start");
      expect(skeleton).toBeInTheDocument();
      
      // Should have three dots
      const dots = container.querySelectorAll(".w-2.h-2.rounded-full");
      expect(dots).toHaveLength(3);
    });

    it("should render typing indicator with glassmorphism styling", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader variant="typing" />);
      
      // Check for backdrop-blur-lg class
      const typingBubble = container.querySelector(".backdrop-blur-lg");
      expect(typingBubble).toBeInTheDocument();
    });

    it("should render typing indicator without shimmer when prefers-reduced-motion", () => {
      matchMediaMock.mockReturnValue({ matches: true });
      const { container } = render(<SkeletonLoader variant="typing" />);
      
      // Check that shimmer animation is not applied
      const animatedElement = container.querySelector(".rounded-2xl");
      expect(animatedElement).toBeInTheDocument();
      expect(animatedElement.style.backgroundSize).toBe("");
    });
  });

  describe("Accessibility", () => {
    it("should respect prefers-reduced-motion for animations", () => {
      matchMediaMock.mockReturnValue({ matches: true });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Verify no animation styles are applied
      const animatedElement = container.querySelector(".rounded-2xl");
      expect(animatedElement.style.background).toBe("");
      expect(animatedElement.style.backgroundSize).toBe("");
    });

    it("should apply animations when motion is not reduced", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Verify animation styles are applied
      const animatedElement = container.querySelector(".rounded-2xl");
      expect(animatedElement.style.backgroundSize).toBe("200% 100%");
    });
  });

  describe("Visual Structure", () => {
    it("should render avatar skeletons for AI messages", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={2} />);
      
      // Second skeleton is AI (index 1), should have avatar on left
      const skeletons = container.querySelectorAll(".flex.gap-3.my-3");
      const aiSkeleton = skeletons[1];
      
      // Check for avatar skeleton
      const avatar = aiSkeleton.querySelector(".w-8.h-8.rounded-full");
      expect(avatar).toBeInTheDocument();
    });

    it("should render timestamp skeletons", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Check for timestamp skeleton
      const timestamp = container.querySelector(".h-2.w-12.rounded");
      expect(timestamp).toBeInTheDocument();
    });

    it("should render text line skeletons", () => {
      matchMediaMock.mockReturnValue({ matches: false });
      const { container } = render(<SkeletonLoader count={1} />);
      
      // Check for text line skeletons
      const textLines = container.querySelectorAll(".h-3.rounded");
      expect(textLines.length).toBeGreaterThanOrEqual(2);
    });
  });
});
