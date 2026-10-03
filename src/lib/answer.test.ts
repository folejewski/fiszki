import { describe, it, expect } from "vitest";
import type { Card } from "./types";
import {
  normalize,
  normalizeStrict,
  resolveDirection,
  getPrompt,
  getAcceptedAnswers,
  checkAnswer,
} from "./answer";

const card: Card = {
  id: "1",
  front: "dziękuję",
  back: "obrigado",
  frontAlternatives: ["dzięki"],
  backAlternatives: ["obrigada"],
};

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

describe("normalizeStrict", () => {
  it("keeps accents but ignores case and spaces", () => {
    expect(normalizeStrict("  Não  ")).toBe("não");
  });

  it("treats both Unicode forms of the same letter as equal", () => {
    const composed = "\u00e3"; // ã as one character
    const decomposed = "a\u0303"; // a + combining tilde
    expect(normalizeStrict(composed)).toBe(normalizeStrict(decomposed));
  });
});

describe("directions", () => {
  it("keeps a fixed direction", () => {
    expect(resolveDirection("forward")).toBe("forward");
    expect(resolveDirection("backward")).toBe("backward");
  });

  it("picks a side when random", () => {
    expect(resolveDirection("random", () => 0.1)).toBe("forward");
    expect(resolveDirection("random", () => 0.9)).toBe("backward");
  });

  it("shows the right side as the prompt", () => {
    expect(getPrompt(card, "forward")).toBe("dziękuję");
    expect(getPrompt(card, "backward")).toBe("obrigado");
  });

  it("accepts the other side plus its alternatives", () => {
    expect(getAcceptedAnswers(card, "forward")).toEqual(["obrigado", "obrigada"]);
    expect(getAcceptedAnswers(card, "backward")).toEqual(["dziękuję", "dzięki"]);
  });

  it("works when a card has no alternatives", () => {
    const simple: Card = { id: "2", front: "tak", back: "sim" };
    expect(getAcceptedAnswers(simple, "forward")).toEqual(["sim"]);
  });
});

describe("checkAnswer in easy mode", () => {
  it("accepts answers without accents", () => {
    expect(checkAnswer("nao", ["não"], "easy")).toEqual({ status: "correct" });
    expect(checkAnswer("dziekuje", ["dziękuję"], "easy")).toEqual({ status: "correct" });
  });

  it("ignores case and extra spaces", () => {
    expect(checkAnswer("  Bom   Dia ", ["bom dia"], "easy")).toEqual({ status: "correct" });
  });

  it("accepts alternatives", () => {
    expect(checkAnswer("obrigada", ["obrigado", "obrigada"], "easy")).toEqual({
      status: "correct",
    });
  });
});

describe("checkAnswer in hard mode", () => {
  it("accepts exact answers", () => {
    expect(checkAnswer("não", ["não"], "hard")).toEqual({ status: "correct" });
  });

  it("flags missing accents as close", () => {
    expect(checkAnswer("nao", ["não"], "hard")).toEqual({
      status: "close",
      reason: "accents",
      expected: "não",
    });
  });

  it("flags missing Polish letters as close", () => {
    expect(checkAnswer("dziekuje", ["dziękuję"], "hard")).toEqual({
      status: "close",
      reason: "accents",
      expected: "dziękuję",
    });
  });
});

describe("checkAnswer if there are typos and wrong answers", () => {
  it("flags a small typo as close", () => {
    expect(checkAnswer("obrigdo", ["obrigado"], "easy")).toEqual({
      status: "close",
      reason: "typo",
      expected: "obrigado",
    });
  });

  it("points to the nearest alternative", () => {
    expect(checkAnswer("obrigadaa", ["obrigado", "obrigada"], "easy")).toEqual({
      status: "close",
      reason: "typo",
      expected: "obrigada",
    });
  });

  it("doesn't forgive typos in short words", () => {
    expect(checkAnswer("sem", ["sim"], "easy")).toEqual({ status: "wrong", expected: "sim" });
  });

  it("marks a different word as wrong", () => {
    expect(checkAnswer("casa", ["água"], "easy")).toEqual({ status: "wrong", expected: "água" });
  });

  it("treats an empty answer as wrong", () => {
    expect(checkAnswer("   ", ["sim"], "easy")).toEqual({ status: "wrong", expected: "sim" });
  });
});
