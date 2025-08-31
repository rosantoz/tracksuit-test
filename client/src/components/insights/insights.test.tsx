import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brandId: 1,
    createdAt: new Date("2024-01-01"),
    text: "Test insight",
  },
  {
    id: 2,
    brandId: 2,
    createdAt: new Date("2024-01-02"),
    text: "Another test insight"
  },
];

describe("Insights", () => {
  const mockOnDeleteInsight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders", () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);
    expect(screen.getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });

  it("renders insights list", () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    expect(screen.getByText("Insights")).toBeTruthy();
    expect(screen.getByText("Test insight")).toBeTruthy();
    expect(screen.getByText("Another test insight")).toBeTruthy();
    expect(screen.getByText("Brand 1")).toBeTruthy();
    expect(screen.getByText("Brand 2")).toBeTruthy();
  });

  it("shows empty state when no insights", () => {
    render(<Insights insights={[]} onDeleteInsight={mockOnDeleteInsight} />);

    expect(screen.getByText("We have no insights!")).toBeTruthy();
  });

  it("shows delete icon for each insight", () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    // Check that delete icons are present (they have the Trash2Icon class)
    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');
    expect(deleteIcons).toHaveLength(2);
  });

  it("opens delete confirmation modal when delete icon is clicked", () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    // Click the first delete icon
    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');
    fireEvent.click(deleteIcons[0]);

    // Check that the delete modal is shown
    expect(screen.getByText("Delete Insight")).toBeTruthy();
    expect(screen.getByText("Are you sure you want to delete this insight?")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("closes delete modal when cancel is clicked", async () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    // Open delete modal
    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');
    fireEvent.click(deleteIcons[0]);

    // Verify modal is open
    expect(screen.getByText("Delete Insight")).toBeTruthy();

    // Click cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText("Delete Insight")).toBeFalsy();
    });
  });

  it("calls onDeleteInsight when delete is confirmed", async () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    // Open delete modal for first insight
    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');
    fireEvent.click(deleteIcons[0]);

    // Click delete button
    fireEvent.click(screen.getByText("Delete"));

    // Verify onDeleteInsight was called with correct insight ID
    await waitFor(() => {
      expect(mockOnDeleteInsight).toHaveBeenCalledWith(1);
    });
  });

  it("closes delete modal after successful deletion", async () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    // Open delete modal
    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');
    fireEvent.click(deleteIcons[0]);

    // Verify modal is open
    expect(screen.getByText("Delete Insight")).toBeTruthy();

    // Click delete button
    fireEvent.click(screen.getByText("Delete"));

    // Verify modal is closed after deletion
    await waitFor(() => {
      expect(screen.queryByText("Delete Insight")).toBeFalsy();
    });
  });

  it("resets insightToDelete state after deletion", async () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    // Open delete modal for first insight
    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');
    fireEvent.click(deleteIcons[0]);

    // Click delete button
    fireEvent.click(screen.getByText("Delete"));

    // Wait for deletion to complete
    await waitFor(() => {
      expect(mockOnDeleteInsight).toHaveBeenCalledWith(1);
    });

    // Try to open delete modal again - should work normally
    fireEvent.click(deleteIcons[0]);
    expect(screen.getByText("Delete Insight")).toBeTruthy();
  });

  it("handles multiple delete operations correctly", async () => {
    render(<Insights insights={TEST_INSIGHTS} onDeleteInsight={mockOnDeleteInsight} />);

    const deleteIcons = document.querySelectorAll('[class*="insight-delete"]');

    // Delete first insight
    fireEvent.click(deleteIcons[0]);
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(mockOnDeleteInsight).toHaveBeenCalledWith(1);
    });

    // Delete second insight
    fireEvent.click(deleteIcons[1]);
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(mockOnDeleteInsight).toHaveBeenCalledWith(2);
    });

    // Verify both calls were made
    expect(mockOnDeleteInsight).toHaveBeenCalledTimes(2);
  });
});
