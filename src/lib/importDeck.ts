import type { ImportedCard, ImportedDeck, LanguageCode } from "./types";

export const SUPPORTED_LANGUAGES: LanguageCode[] = ["pl", "pt", "en", "de"];

export type ParseResult = { ok: true; deck: ImportedDeck } | { ok: false; error: string };

function fail(error: string): ParseResult {
  return { ok: false, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isOptionalStringList(value: unknown): value is string[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every(isNonEmptyString));
}

function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as string[]).includes(value);
}

export function parseDeckFile(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return fail("This file isn't valid JSON.");
  }

  if (!isRecord(data)) return fail("The file must contain a deck, not a list.");
  if (!isNonEmptyString(data.name)) return fail('The deck needs a "name".');

  const languages = SUPPORTED_LANGUAGES.join(", ");
  if (!isLanguageCode(data.sourceLang)) return fail(`"sourceLang" must be one of: ${languages}.`);
  if (!isLanguageCode(data.targetLang)) return fail(`"targetLang" must be one of: ${languages}.`);
  if (data.sourceLang === data.targetLang) return fail("The two languages must be different.");

  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    return fail('The deck needs a "cards" list with at least one card.');
  }

  const cards: ImportedCard[] = [];

  for (const [index, card] of data.cards.entries()) {
    const number = index + 1;
    if (!isRecord(card)) return fail(`Card ${number} isn't valid.`);

    const { front, back, frontAlternatives, backAlternatives } = card;

    if (!isNonEmptyString(front) || !isNonEmptyString(back)) {
      return fail(`Card ${number} needs a "front" and a "back".`);
    }
    if (!isOptionalStringList(frontAlternatives) || !isOptionalStringList(backAlternatives)) {
      return fail(`Card ${number} has invalid alternatives. They must be a list of words.`);
    }

    cards.push({
      front: front.trim(),
      back: back.trim(),
      frontAlternatives: frontAlternatives?.map((a) => a.trim()),
      backAlternatives: backAlternatives?.map((a) => a.trim()),
    });
  }

  return {
    ok: true,
    deck: {
      name: data.name.trim(),
      sourceLang: data.sourceLang,
      targetLang: data.targetLang,
      cards,
    },
  };
}
