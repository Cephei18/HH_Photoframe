"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHAIN_STAMPS, MAX_CHAIN_STAMPS, type ChainStampId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChainStampIcon } from "./ChainStampIcon";

type IdentityFormProps = {
  onSubmit: (values: { name: string; stack: string; chainStamps: ChainStampId[] }) => void;
  submitting?: boolean;
};

/**
 * The only form in the product — two fields plus a stamp-flavor picker, on
 * the same screen as the photo, per the approved mobile-first flow. Stack
 * is optional; the chain stamp defaults to Ethereum so a one-tap Generate
 * still works for anyone in a hurry — it's a fun customization, not a
 * gate. Up to MAX_CHAIN_STAMPS can be picked, each landing in its own
 * visa-stamp slot on the pass — a real passport page carries more than
 * one stamp, and one flavor never felt like enough.
 */
export function IdentityForm({ onSubmit, submitting }: IdentityFormProps) {
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [chainStamps, setChainStamps] = useState<ChainStampId[]>(["ethereum"]);

  function toggleStamp(id: ChainStampId) {
    setChainStamps((current) => {
      if (current.includes(id)) {
        // At least one stamp must stay selected — dropping the last one
        // would leave the pass with an empty visa-stamp cluster.
        return current.length === 1 ? current : current.filter((s) => s !== id);
      }
      if (current.length >= MAX_CHAIN_STAMPS) return current;
      return [...current, id];
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), stack: stack.trim(), chainStamps });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="builder-name"
          className="text-ink-soft font-mono text-xs tracking-wide uppercase"
        >
          Name
        </Label>
        <Input
          id="builder-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Santoshi Nakamoto"
          maxLength={40}
          required
          autoComplete="name"
          className="h-11 font-mono"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="builder-stack"
          className="text-ink-soft font-mono text-xs tracking-wide uppercase"
        >
          Stack <span className="text-ink-faint">(optional)</span>
        </Label>
        <Input
          id="builder-stack"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          placeholder="React, Solidity"
          maxLength={60}
          className="h-11 font-mono"
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-ink-soft font-mono text-xs tracking-wide uppercase">
          Visa stamps <span className="text-ink-faint">(pick up to {MAX_CHAIN_STAMPS})</span>
        </legend>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Visa stamp flavors">
          {CHAIN_STAMPS.map((stampOption) => {
            const selected = chainStamps.includes(stampOption.id);
            const atLimit = !selected && chainStamps.length >= MAX_CHAIN_STAMPS;
            return (
              <button
                key={stampOption.id}
                type="button"
                role="checkbox"
                aria-checked={selected}
                disabled={atLimit}
                onClick={() => toggleStamp(stampOption.id)}
                className={cn(
                  "flex flex-col items-center gap-1 border py-2.5 font-mono text-[10px] uppercase transition-colors",
                  selected
                    ? "border-ink bg-gold text-ink"
                    : atLimit
                      ? "border-line text-ink-faint/60 cursor-not-allowed"
                      : "border-line-strong bg-paper-raised text-ink-soft hover:border-ink",
                )}
              >
                <ChainStampIcon id={stampOption.id} size={18} />
                {stampOption.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button
        type="submit"
        size="lg"
        disabled={!name.trim() || submitting}
        className="h-12 font-mono text-sm tracking-wide uppercase"
      >
        {submitting ? "Authorizing…" : "Generate My Pass"}
      </Button>
    </form>
  );
}
