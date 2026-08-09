/**
 * Builder Archetype word banks — deadpan-funny in the same register as HH
 * Goa's own generated titles ("Latency Shaman," "Regex Monk"). A stack is
 * matched to a flavor category by keyword; unmatched or empty stacks land
 * on `generic`, which is a legitimate archetype family on its own, not an
 * error state.
 */

export type ArchetypeBank = {
  traits: readonly string[];
  roles: readonly string[];
};

export const ARCHETYPE_BANKS = {
  frontend: {
    traits: ["Pixel", "Flexbox", "Hydration", "Z-Index", "Repaint"],
    roles: ["Shaman", "Monk", "Whisperer", "Sage", "Purist"],
  },
  backend: {
    traits: ["Race-Condition", "Null-Pointer", "Deadlock", "Latency", "Queue"],
    roles: ["Shaman", "Monk", "Exorcist", "Sage", "Wrangler"],
  },
  crypto: {
    traits: ["Gas-Fee", "Reentrancy", "Merkle-Tree", "Consensus", "Mempool"],
    roles: ["Oracle", "Sage", "Whisperer", "Monk", "Guardian"],
  },
  ai: {
    traits: ["Overfit", "Hallucination", "Gradient", "Token", "Context-Window"],
    roles: ["Whisperer", "Wrangler", "Shaman", "Oracle", "Tamer"],
  },
  design: {
    traits: ["Pixel-Perfect", "Whitespace", "Kerning", "Contrast", "Grid"],
    roles: ["Purist", "Monk", "Zealot", "Sage", "Whisperer"],
  },
  infra: {
    traits: ["Uptime", "Cold-Start", "YAML", "Rate-Limit", "Rollback"],
    roles: ["Guardian", "Shaman", "Monk", "Exorcist", "Sentinel"],
  },
  generic: {
    traits: ["Regex", "Merge-Conflict", "Semicolon", "Cache", "Legacy-Code"],
    roles: ["Shaman", "Monk", "Sage", "Oracle", "Whisperer"],
  },
} as const satisfies Record<string, ArchetypeBank>;

export type ArchetypeCategory = keyof typeof ARCHETYPE_BANKS;

/**
 * The Domain picker's own options (IdentityForm) — a person states their
 * domain directly rather than it being guessed from free-text `stack`
 * keywords. An earlier version matched `stack` substrings against a
 * keyword list per category and took the first category with any match;
 * since `Object.keys` iterates in insertion order, a stack that matched
 * more than one category (e.g. "React, Solidity" hitting both `frontend`
 * and `crypto`) always silently lost to whichever category happened to
 * be listed first, regardless of which keyword was actually the
 * stronger signal — verified by actually trying it. Explicit beats
 * guessed here.
 */
export const DOMAIN_OPTIONS: ReadonlyArray<{ id: ArchetypeCategory; label: string }> = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "crypto", label: "Blockchain" },
  { id: "ai", label: "AI" },
  { id: "design", label: "Design" },
  { id: "infra", label: "Cloud" },
  { id: "generic", label: "Generic" },
];
