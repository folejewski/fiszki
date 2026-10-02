export type LanguageCode = "pl" | "pt" | "en" | "de";

export type Difficulty = "easy" | "hard";

// forward = front to back (e.g. PL to PT), backward = back to front
export type Direction = "forward" | "backward" | "random";
export type ResolvedDirection = "forward" | "backward";

// A card as it appears in an imported file (no id yet)
export interface ImportedCard {
  front: string;
  back: string;
  frontAlternatives?: string[];
  backAlternatives?: string[];
}

// A card inside the app (has an id)
export interface Card extends ImportedCard {
  id: string;
}

export interface ImportedDeck {
  name: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  cards: ImportedCard[];
}

export interface Deck extends Omit<ImportedDeck, "cards"> {
  id: string;
  cards: Card[];
}

export type CheckResult =
  | { status: "correct" }
  | { status: "close"; reason: "accents" | "typo"; expected: string }
  | { status: "wrong"; expected: string };
