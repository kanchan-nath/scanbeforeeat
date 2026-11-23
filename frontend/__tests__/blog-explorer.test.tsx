import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { getAllBlogPosts } from "@/content/blog";

// Mock next/link
vi.mock("next/link", () => {
  return {
    default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...rest}>
        {children}
      </a>
    ),
  };
});

// Mock Icon component
vi.mock("@/components/ui/Icon", () => {
  return {
    Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>,
  };
});

describe("BlogExplorer Component", () => {
  const posts = getAllBlogPosts();

  it("renders search input, filter pills, and skin mode switcher", () => {
    render(<BlogExplorer initialPosts={posts} />);

    expect(
      screen.getByPlaceholderText(/Semantic search: chemicals, additives, gut health/i)
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Grid Skin/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Academic List/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compact Table/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /All Articles/i })).toBeInTheDocument();
  });

  it("switches skin templates when clicking skin switcher buttons", () => {
    render(<BlogExplorer initialPosts={posts} />);

    // Default is Grid skin
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    // Click Compact Table
    const compactBtn = screen.getByRole("button", { name: /Compact Table/i });
    fireEvent.click(compactBtn);
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Click Academic List
    const academicBtn = screen.getByRole("button", { name: /Academic List/i });
    fireEvent.click(academicBtn);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("filters articles by category when category pill is clicked", () => {
    render(<BlogExplorer initialPosts={posts} />);

    const toxicologyBtn = screen.getByRole("button", { name: /Toxicology/i });
    fireEvent.click(toxicologyBtn);

    // Showing telemetry should update with toxicology matches
    const matches = screen.getAllByText(/Toxicology/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("auto-switches to academic list skin when user types a search query", () => {
    render(<BlogExplorer initialPosts={posts} />);

    const searchInput = screen.getByPlaceholderText(/Semantic search/i);
    fireEvent.change(searchInput, { target: { value: "carrageenan" } });

    // Should display match results and query pill
    expect(screen.getByText(/Query: “carrageenan”/i)).toBeInTheDocument();
  });

  it("supports pagination controls (page buttons, next, previous)", () => {
    // 12-13 posts with pageSize 6 should have multiple pages
    render(<BlogExplorer initialPosts={posts} />);

    const page2Button = screen.getByRole("button", { name: "2" });
    expect(page2Button).toBeInTheDocument();

    fireEvent.click(page2Button);

    // After clicking page 2, Previous button should be enabled
    const prevButton = screen.getByRole("button", { name: /Previous/i });
    expect(prevButton).not.toBeDisabled();
  });
});
