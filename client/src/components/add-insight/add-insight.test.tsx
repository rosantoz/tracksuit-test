import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddInsight } from "./add-insight.tsx";

// Mock fetch globally
global.fetch = vi.fn();

describe("AddInsight", () => {
  const mockOnClose = vi.fn();
  const mockOnInsightAdded = vi.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onInsightAdded: mockOnInsightAdded,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders", () => {
    render(<AddInsight {...defaultProps} />);
    expect(screen.getByText("Add a new insight")).toBeTruthy();
  });

  it("renders form fields", () => {
    render(<AddInsight {...defaultProps} />);
    
    expect(screen.getByDisplayValue("Select a brand")).toBeTruthy();
    expect(screen.getByPlaceholderText("Something insightful...")).toBeTruthy();
    expect(screen.getByText("Add insight")).toBeTruthy();
  });

  it("shows brand options", () => {
    render(<AddInsight {...defaultProps} />);
    
    const brandSelect = screen.getByDisplayValue("Select a brand");
    expect(brandSelect).toBeTruthy();
    
    // Check that brand options are rendered
    expect(screen.getByText("Select a brand")).toBeTruthy();
    expect(screen.getByText("Brand 1")).toBeTruthy();
    expect(screen.getByText("Brand 6")).toBeTruthy();
  });

  it("submits form with valid data", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    global.fetch = mockFetch;

    render(<AddInsight {...defaultProps} />);
    
    // Fill in form
    fireEvent.change(screen.getByDisplayValue("Select a brand"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Something insightful..."), { 
      target: { value: "Test insight text" } 
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Add insight"));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand: 1, text: "Test insight text" }),
      });
    });
  });

  it("shows error for invalid form submission", async () => {
    render(<AddInsight {...defaultProps} />);
    
    // Submit form without filling required fields
    const form = screen.getByText("Add insight").closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);
    
    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByText("Please fill in all fields")).toBeTruthy();
    }, { timeout: 2000 });
  });

  it("shows error from API response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "API Error" }),
    });
    global.fetch = mockFetch;

    render(<AddInsight {...defaultProps} />);
    
    // Fill in form
    fireEvent.change(screen.getByDisplayValue("Select a brand"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Something insightful..."), { 
      target: { value: "Test insight text" } 
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Add insight"));
    
    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeTruthy();
    });
  });

  it("calls onInsightAdded and onClose on successful submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    global.fetch = mockFetch;

    render(<AddInsight {...defaultProps} />);
    
    // Fill in form
    fireEvent.change(screen.getByDisplayValue("Select a brand"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Something insightful..."), { 
      target: { value: "Test insight text" } 
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Add insight"));
    
    await waitFor(() => {
      expect(mockOnInsightAdded).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("resets form on successful submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    global.fetch = mockFetch;

    render(<AddInsight {...defaultProps} />);
    
    // Fill in form
    fireEvent.change(screen.getByDisplayValue("Select a brand"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Something insightful..."), { 
      target: { value: "Test insight text" } 
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Add insight"));
    
    await waitFor(() => {
      const brandSelect = screen.getByDisplayValue("Select a brand") as HTMLSelectElement;
      const insightTextarea = screen.getByPlaceholderText("Something insightful...") as HTMLTextAreaElement;
      
      expect(brandSelect.value).toBe("");
      expect(insightTextarea.value).toBe("");
    });
  });

  it("shows loading state during submission", async () => {
    const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    global.fetch = mockFetch;

    render(<AddInsight {...defaultProps} />);
    
    // Fill in form
    fireEvent.change(screen.getByDisplayValue("Select a brand"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Something insightful..."), { 
      target: { value: "Test insight text" } 
    });
    
    // Submit form
    fireEvent.click(screen.getByText("Add insight"));
    
    // Check loading state
    expect(screen.getByText("Adding...")).toBeTruthy();
    const submitButton = screen.getByText("Adding...") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });
});
