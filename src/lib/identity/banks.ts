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

const CATEGORY_KEYWORDS: Record<Exclude<ArchetypeCategory, "generic">, readonly string[]> = {
  frontend: ["react", "vue", "svelte", "next", "frontend", "css", "tailwind", "angular", "html"],
  backend: [
    "node",
    "express",
    "django",
    "rails",
    "backend",
    "api",
    "golang",
    "go",
    "java",
    "spring",
    "postgres",
    "sql",
    "database",
    "php",
  ],
  crypto: [
    "solidity",
    "web3",
    "ethereum",
    "evm",
    "solana",
    "rust",
    "move",
    "chain",
    "contract",
    "defi",
    "nft",
    "anchor",
  ],
  ai: [
    "python",
    "pytorch",
    "tensorflow",
    "llm",
    "ml",
    "ai",
    "model",
    "transformer",
    "gpt",
    "langchain",
  ],
  design: ["figma", "design", "product", "ux", "ui"],
  infra: ["docker", "kubernetes", "k8s", "aws", "devops", "infra", "terraform", "cloud", "gcp"],
};

/** Matches a free-text stack string to a flavor category by substring —
 * deterministic, no external NLP. Falls back to `generic`. */
export function categoryFromStack(stack: string): ArchetypeCategory {
  const lower = stack.toLowerCase();
  const matches = (Object.keys(CATEGORY_KEYWORDS) as (keyof typeof CATEGORY_KEYWORDS)[]).filter(
    (category) => CATEGORY_KEYWORDS[category].some((keyword) => lower.includes(keyword)),
  );
  if (matches.length === 0) return "generic";
  return matches[0];
}
