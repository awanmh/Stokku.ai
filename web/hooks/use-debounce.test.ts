// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));
    expect(result.current).toBe("hello");
  });

  it("should update the value only after the specified delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "hello", delay: 500 },
      }
    );

    expect(result.current).toBe("hello");

    // Change value
    rerender({ value: "world", delay: 500 });
    expect(result.current).toBe("hello"); // Still old value

    // Fast-forward time by 300ms (not yet 500ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("hello");

    // Fast-forward another 200ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("world"); // Value updated!
  });
});
