import { describe, it, expect } from "vitest";
import { normalize } from "./answer";

describe("normalize", () => {
  it("removes Portuguese accents", () => {
    expect(normalize("Não")).toBe("nao");
    expect(normalize("água")).toBe("agua");
  });

  it("handles Polish ł, which doesn't decompose", () => {
    expect(normalize("łódź")).toBe("lodz");
  });

  it("trims and collapses spaces", () => {
    expect(normalize("  bom    dia ")).toBe("bom dia");
  });
});
