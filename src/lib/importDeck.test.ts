import { describe, it, expect } from "vitest";
import { parseDeckFile } from "./importDeck";

const validDeck = {
  name: "Basics",
  sourceLang: "pl",
  targetLang: "pt",
  cards: [
    { front: "dziękuję", back: "obrigado", backAlternatives: ["obrigada"] },
    { front: "woda", back: "água" },
  ],
};

// Helper: turn an object into file text
const file = (value: unknown) => JSON.stringify(value);

describe("parseDeckFile", () => {
  it("accepts a valid deck", () => {
    const result = parseDeckFile(file(validDeck));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.deck.cards).toHaveLength(2);
  });

  it("rejects text that isn't JSON", () => {
    expect(parseDeckFile("not json {")).toEqual({
      ok: false,
      error: "This file isn't valid JSON.",
    });
  });

  it("rejects the old list-only format", () => {
    const result = parseDeckFile(file([{ pl: "woda", pt: "água" }]));
    expect(result.ok).toBe(false);
  });

  it("requires a name", () => {
    const result = parseDeckFile(file({ ...validDeck, name: "  " }));
    expect(result).toEqual({ ok: false, error: 'The deck needs a "name".' });
  });

  it("rejects unsupported languages", () => {
    const result = parseDeckFile(file({ ...validDeck, targetLang: "klingon" }));
    expect(result.ok).toBe(false);
  });

  it("rejects the same language on both sides", () => {
    const result = parseDeckFile(file({ ...validDeck, targetLang: "pl" }));
    expect(result).toEqual({ ok: false, error: "The two languages must be different." });
  });

  it("rejects an empty card list", () => {
    const result = parseDeckFile(file({ ...validDeck, cards: [] }));
    expect(result.ok).toBe(false);
  });

  it("says which card is broken", () => {
    const cards = [...validDeck.cards, { front: "chleb" }];
    const result = parseDeckFile(file({ ...validDeck, cards }));
    expect(result).toEqual({ ok: false, error: 'Card 3 needs a "front" and a "back".' });
  });

  it("rejects alternatives that aren't a list of words", () => {
    const cards = [{ front: "tak", back: "sim", backAlternatives: "sí" }];
    const result = parseDeckFile(file({ ...validDeck, cards }));
    expect(result.ok).toBe(false);
  });

  it("trims text and drops unknown fields", () => {
    const cards = [{ front: "  woda ", back: " água  ", colour: "blue" }];
    const result = parseDeckFile(file({ ...validDeck, cards }));
    expect(result).toEqual({
      ok: true,
      deck: {
        name: "Basics",
        sourceLang: "pl",
        targetLang: "pt",
        cards: [
          {
            front: "woda",
            back: "água",
            frontAlternatives: undefined,
            backAlternatives: undefined,
          },
        ],
      },
    });
  });
});
