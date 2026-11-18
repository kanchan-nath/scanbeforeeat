import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon, KnownIconName } from "@/components/ui/Icon";

const ALL_REQUIRED_ICONS: KnownIconName[] = [
  "check",
  "check_circle",
  "close",
  "menu",
  "arrow_forward",
  "qr_code_scanner",
  "photo_camera",
  "play_circle",
  "lock",
  "lock_open",
  "verified",
  "verified_user",
  "security",
  "search",
  "sync",
  "format_list_bulleted",
  "open_in_new",
  "mail",
  "barcode_scanner",
  "document_scanner",
  "biotech",
  "notification_important",
  "compare_arrows",
  "fact_check",
  "eco",
  "blender",
  "inventory_2",
  "warning",
  "flag",
  "public",
  "terminal",
  "science",
  "money_off",
  "menu_book",
  "person_off",
  "memory",
  "account_tree",
  "local_dining",
  "shield",
  "restaurant",
  "cancel",
  "code",
  "chevron_right",
  "send",
  "scanner",
  "delete_forever",
  "history_edu",
  "lock_open_right",
];

describe("Icon Component", () => {
  it("renders all required icons as clean SVG vectors with zero literal text", () => {
    for (const name of ALL_REQUIRED_ICONS) {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector("svg");

      expect(svg, `Expected SVG element for icon "${name}"`).not.toBeNull();
      expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
      expect(svg?.getAttribute("data-icon")).toBe(name);
      expect(svg?.getAttribute("aria-hidden")).toBe("true");

      // Verify zero literal text inside the SVG
      expect(svg?.textContent).toBe("");

      // Verify it contains path or vector markup
      const paths = svg?.querySelectorAll("path, circle, rect, polygon");
      expect(paths && paths.length).toBeGreaterThan(0);
    }
  });

  it("applies custom className and dimensions correctly", () => {
    const { container } = render(
      <Icon name="photo_camera" className="text-emerald-600 text-xl" size={32} />
    );
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("class")).toContain("text-emerald-600 text-xl");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("height")).toBe("32");
  });

  it("gracefully renders fallback SVG for unknown icon without rendering literal string", () => {
    const { container } = render(<Icon name="non_existent_custom_icon" />);
    const svg = container.querySelector("svg");

    expect(svg).not.toBeNull();
    expect(svg?.textContent).toBe("");
    expect(svg?.querySelector("path")).not.toBeNull();
  });
});
