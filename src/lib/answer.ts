import type { Card, CheckResult, Difficulty, Direction, ResolvedDirection } from "./types";
import { levenshtein } from "./levenshtein";

// Easy mode: ignore case, accents and extra spaces
export function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/\s+/g, " ");
}

// Hard mode: ignore case and extra spaces, but keep accents
export function normalizeStrict(text: string): string {
  return text.trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");
}

export function resolveDirection(
  direction: Direction,
  random: () => number = Math.random,
): ResolvedDirection {
  if (direction !== "random") return direction;
  return random() < 0.5 ? "forward" : "backward";
}

export function getPrompt(card: Card, direction: ResolvedDirection): string {
  return direction === "forward" ? card.front : card.back;
}

export function getAcceptedAnswers(card: Card, direction: ResolvedDirection): string[] {
  return direction === "forward"
    ? [card.back, ...(card.backAlternatives ?? [])]
    : [card.front, ...(card.frontAlternatives ?? [])];
}

// How many typos to forgive, based on the length of the correct word
export function allowedTypos(length: number): number {
  if (length <= 3) return 0;
  if (length <= 7) return 1;
  return 2;
}

export function checkAnswer(
  input: string,
  accepted: string[],
  difficulty: Difficulty,
): CheckResult {
  const expected = accepted[0];
  const compare = difficulty === "hard" ? normalizeStrict : normalize;
  const answer = compare(input);

  if (answer === "") return { status: "wrong", expected };

  // 1. Exact match (by the rules of the current difficulty)
  if (accepted.some((a) => compare(a) === answer)) {
    return { status: "correct" };
  }

  // 2. Hard mode: right word, wrong accents
  if (difficulty === "hard") {
    const accentMatch = accepted.find((a) => normalize(a) === normalize(input));
    if (accentMatch) return { status: "close", reason: "accents", expected: accentMatch };
  }

  // 3. A small typo: find the closest accepted answer within the allowed distance
  const loose = normalize(input);
  let best: { answer: string; distance: number } | null = null;

  for (const a of accepted) {
    const target = normalize(a);
    const distance = levenshtein(loose, target);
    if (distance <= allowedTypos(target.length) && (best === null || distance < best.distance)) {
      best = { answer: a, distance };
    }
  }

  if (best) return { status: "close", reason: "typo", expected: best.answer };

  return { status: "wrong", expected };
}
