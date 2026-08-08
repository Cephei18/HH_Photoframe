/**
 * Everything in the identity engine derives from ONE seeded hash — no
 * independent `Math.random()` calls anywhere downstream. These two
 * primitives are the entire source of "randomness":
 *
 *  - `fnv1a` turns an arbitrary string (name + stack + photo) into a single
 *    32-bit seed.
 *  - `mulberry32` expands that one seed into a repeatable *stream* of
 *    numbers, so drawing the tier, then the archetype, then the serial,
 *    etc. in a fixed order never correlates fields with each other the way
 *    reusing `seed % N` for every field would.
 *
 * Neither is cryptographic — they don't need to be. They only need to be
 * fast and to always produce the same output for the same input.
 */

/** 32-bit FNV-1a — fast, dependency-free, deterministic. */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 — a small, fast, seeded PRNG. Returns a `next(): number in [0, 1)` generator. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks an index into `weights` proportional to each weight — the one
 * place probability enters the engine, and it still only consumes the next
 * value off the shared seeded stream. */
export function pickWeightedIndex(next: () => number, weights: readonly number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = next() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll < 0) return i;
  }
  return weights.length - 1;
}

/** Picks a uniformly-random index from the seeded stream. */
export function pickIndex(next: () => number, length: number): number {
  return Math.min(length - 1, Math.floor(next() * length));
}
