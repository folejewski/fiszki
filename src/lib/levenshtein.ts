//Levenshtein distance is the number of single-letter edits (adding, removing or swapping one letter) needed to turn one word into another.
// obrigado and obrigada is 1. kitten and sitting is 3.

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // previous[j] = distance between the first i-1 letters of a and the first j letters of b
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1, // remove a letter
        current[j - 1] + 1, // add a letter
        previous[j - 1] + cost, // swap a letter (free if they're the same)
      );
    }
    previous = current;
  }

  return previous[b.length];
}
