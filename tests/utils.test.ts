import { describe, it, expect } from "vitest";
import { formatMoney, slugifyText } from "@/lib/utils";

describe("formatMoney", () => {
  it("formats USD minor units with two decimal places", () => {
    expect(formatMoney(184000, "USD")).toBe("$1,840.00");
  });

  it("formats PKR with zero decimal places", () => {
    const result = formatMoney(184000, "PKR");
    expect(result.replace(/\s/g, " ")).toBe("PKR 1,840");
  });

  it("handles zero", () => {
    expect(formatMoney(0, "USD")).toBe("$0.00");
  });
});

describe("slugifyText", () => {
  it("lowercases and hyphenates, treating non-alphanumeric characters (including accents) as separators", () => {
    expect(slugifyText("Aurélie Embroidered Gown")).toBe("aur-lie-embroidered-gown");
  });

  it("strips leading/trailing hyphens", () => {
    expect(slugifyText("  --Hello World--  ")).toBe("hello-world");
  });

  it("collapses repeated separators", () => {
    expect(slugifyText("A   B---C")).toBe("a-b-c");
  });
});
