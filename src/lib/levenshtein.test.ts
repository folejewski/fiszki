import { describe, it, expect } from "vitest";
import { levenshtein } from "./levenshtein";

describe("levenshtein", () => {
  it("is 0 for identical words", () => {
    expect(levenshtein("água", "água")).toBe(0);
  });

  it("counts one swapped letter", () => {
    expect(levenshtein("obrigado", "obrigada")).toBe(1);
  });

  it("counts missing and extra letters", () => {
    expect(levenshtein("obrigdo", "obrigado")).toBe(1);
    expect(levenshtein("obrigaddo", "obrigado")).toBe(1);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "sim")).toBe(3);
    expect(levenshtein("sim", "")).toBe(3);
  });

  it("matches the classic example", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });

  it("gives the same result in both directions", () => {
    expect(levenshtein("rua", "ruas")).toBe(levenshtein("ruas", "rua"));
  });
});
